import handleError, { ApiError } from "@/lib/api-error";
import ApiResponse from "@/lib/api-response";
import {
	validateRecordContent,
	validateRecordName,
} from "@/repository/record-repo";
import { getSubDomainFromId } from "@/repository/subdomain-repo";
import { cloudflareClient } from "@/service/cloudflare-service";
import { createRecordReqBody } from "@/types/zodSchemas";
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

		const { subDomainId, type, ttl, proxied, content, comment } =
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
		const fqdn = find.fqdn;
		const checkCNameExist = await validateRecordName(type, subDomainId);
		if (checkCNameExist) {
			return Response.json(
				new ApiError(400, "Record for this name alreay exists"),
				{
					status: 400,
					statusText: "BAD REQUEST",
				}
			);
		}
		const validateContent = await validateRecordContent(content, type);
		if (!validateContent) {
			return Response.json(
				new ApiError(400, "Content Validation Failed"),
				{
					status: 400,
					statusText: "BAD REQUEST",
				}
			);
		}

		const record = await cloudflareClient.dns.records.create({
			zone_id: process.env.ZONE_ID!,
			name: fqdn,
			type,
			ttl,
			proxied,
			content,
			comment,
		});
		console.log("................record created.....................");
		console.log(record);
		console.log("................record created.....................");

		return Response.json(new ApiResponse(201, "record created", record));
	} catch (error) {
		return handleError(error);
	}
}
export async function PUT() {}
export async function DELETE() {}
