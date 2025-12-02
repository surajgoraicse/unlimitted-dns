import handleError, { ApiError } from "@/lib/api-error";
import ApiResponse from "@/lib/api-response";
import { recordRepo } from "@/repository/record-repo";
import { getSubDomainFromId } from "@/repository/subdomain-repo";
import cloudflareService from "@/service/cloudflare-service";
import { createRecordReqBody } from "@/types/zod-schema";
import { NextRequest } from "next/server";

// use this in admin route
// export async function GET() {
// 	try {
// 		const recordList = [];
// 		for await (const recordResponse of cloudflareClient.dns.records.list({
// 			zone_id: process.env.ZONE_ID!,
// 		})) {
// 			recordList.push(recordResponse);
// 		}

// 		return Response.json(new ApiResponse(200, "success", recordList));
// 	} catch (error) {
// 		return handleError(error);
// 	}
// }

// get all registered dns record of a user and specific project
export async function GET(req: NextRequest) {
	try {
		const { searchParams } = new URL(req.url);
		const subDomainId = searchParams.get("subDomainId");
		if (!subDomainId) {
			return Response.json(
				new ApiResponse(400, "Sub Domain ID not found", false),
				{
					status: 400,
					statusText: "Bad Request",
				}
			);
		}

		const records =
			await recordRepo.getAllRecordsFromSubDomainId(subDomainId);
		if (!records) {
			return Response.json(
				new ApiResponse(
					404,
					"No records found for this subdomain",
					false
				),
				{
					status: 404,
					statusText: "Not Found",
				}
			);
		}

		return Response.json(new ApiResponse(200, "Success", records), {
			status: 200,
			statusText: "OK",
		});
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
	 * validate record name and generate fqdn
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

		const { subDomainId, type, ttl, proxied, content, comment, name } =
			parseResult.data;

		const find = await getSubDomainFromId(subDomainId);

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

		if (!isTypeValid.success) {
			return Response.json(
				new ApiError(
					400,
					isTypeValid.message || "Type Validation Failed"
				),
				{
					status: 400,
					statusText: "BAD REQUEST",
				}
			);
		}

		const isValidContent = recordRepo.validateRecordContext(content, type);
		if (!isValidContent.success) {
			return Response.json(
				new ApiError(
					400,
					isValidContent.message || "Content Validation Failed"
				),
				{
					status: 400,
					statusText: "BAD REQUEST",
				}
			);
		}
		const fqdn = `${name}.${process.env.DOMAIN}`;

		const isNameValid = await recordRepo.validateRecordName(name);
		if (!isNameValid.success) {
			return Response.json(
				new ApiError(
					400,
					isNameValid.message || `Name Validation Failed : ${fqdn} `
				),
				{
					status: 400,
					statusText: "BAD REQUEST",
				}
			);
		}

		const record = await cloudflareService.createCFRecord({
			name: fqdn,
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

		const dbRecord = await recordRepo.createRecordDb({
			subDomainId,
			providerRecordId: record.id,
			type,
			content,
			ttl,
			name,
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

		return Response.json(new ApiResponse(201, "record created", record));
	} catch (error) {
		return handleError(error);
	}
}
