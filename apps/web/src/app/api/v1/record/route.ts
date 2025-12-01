import handleError, { ApiError } from "@/lib/api-error";
import ApiResponse from "@/lib/api-response";
import { recordRepo } from "@/repository/record-repo";
import { getSubDomainFromId } from "@/repository/subdomain-repo";
import cloudflareService, {
	cloudflareClient,
} from "@/service/cloudflare-service";
import { createRecordReqBody } from "@/types/zod-schema";
import { NextRequest } from "next/server";

// get all registered dns record
export async function GET() {
	try {
		const recordList = [];
		for await (const recordResponse of cloudflareClient.dns.records.list({
			zone_id: process.env.ZONE_ID!,
		})) {
			recordList.push(recordResponse);
			console.log(recordResponse);
		}

		return Response.json(new ApiResponse(200, "success", recordList));
	} catch (error) {
		return handleError(error);
	}
}

// create a dns record
export async function POST(req: NextRequest) {
	/**
	 * check if subdomain exist
	 * check if record already exist for the same name
	 * 		- if it is a cname then do not allow any other record (allow txt for verification)
	 * 		- do not allow duplicate records
	 * 		- otherwise allow based on some rule
	 * validate record name
	 * validate record content
	 * create record using cf api
	 * success :
	 * 		save in the db
	 * 			- if falied to save in the db
	 * 			remove the cf record.
	 *
	 * methods req : validateRecordName, validateRecordContent,  createCFRecord(), createDBRecord()
	 *
	 */

	try {
		const body = await req.json();
		const parseResult = createRecordReqBody.safeParse(body);

		if (!parseResult.success) {
			return handleError(parseResult.error);
		}
		console.log(1);

		const { subDomainId, type, ttl, proxied, content, comment } =
			parseResult.data;

		const find = await getSubDomainFromId(subDomainId);
		console.log(2);


		if (!find) {
			return Response.json(
				new ApiError(404, `Sub Domain Not Found : ${subDomainId} `),
				{
					status: 404,
					statusText: "Not Found",
				}
			);
		}
		const isTypeValid = await recordRepo.validateRecordType(
			type,
			subDomainId
		);
		console.log(3, isTypeValid);

		if (!isTypeValid.success) {
			return (
				Response.json(
					new ApiError(
						400,
						isTypeValid.message || "Type Validation Failed"
					)
				),
				{
					status: 400,
					statusText: "BAD REQUEST",
				}
			);
		}
		console.log(4);


		const isValidContent = recordRepo.validateRecordContext(content, type);
		if (!isValidContent.success) {
			return (
				Response.json(
					new ApiError(
						400,
						isValidContent.message || "Content Validation Failed"
					)
				),
				{
					status: 400,
					statusText: "BAD REQUEST",
				}
			);
		}
		console.log(5);


		const record = await cloudflareService.createCFRecord({
			name: find.name,
			type,
			ttl,
			proxied,
			content,
			comment,
		});
		if (!record) {
			return Response.json(
				new ApiError(500, "Failed to create record in Cloudflare"),
				{
					status: 500,
					statusText: "Internal Server Error",
				}
			);
		}
		console.log(6);

		const dbRecord = await recordRepo.createRecordDb({
			subDomainId,
			providerRecordId: record.id,
			type,
			content,
			ttl,
			proxied: record?.proxied || false,
			comment: record?.comment || "",
			version: 1,
			status: "PENDING",
		});
		if (!dbRecord) {
			// rollback cf record
			await cloudflareService.deleteCFRecord(record.id);
			return Response.json(
				new ApiError(
					500,
					"Failed to save record in DB, rolled back Cloudflare record"
				),
				{
					status: 500,
					statusText: "Internal Server Error",
				}
			);
		}
		// success
		console.log(7);


		console.log(
			"................record created in CF....................."
		);
		console.log("cf record : ", record);
		console.log("db record : ", dbRecord);
		console.log(
			"................record created in CF....................."
		);

		return Response.json(new ApiResponse(201, "record created", record));
	} catch (error) {
		return handleError(error);
	}
}
