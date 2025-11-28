import handleError from "@/lib/api-error";
import ApiResponse from "@/lib/api-response";
import { cloudflareClient } from "@/lib/cloudflare";
import { NextRequest } from "next/server";

export async function GET(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const recordId = (await params)?.id;
		if (!recordId) {
			return Response.json(
				new ApiResponse(400, "Record ID not found", false),
				{
					status: 404,
					statusText: "Bad Request",
				}
			);
		}

		const recordResponse = await cloudflareClient.dns.records.get(
			recordId,
			{
				zone_id: process.env.ZONE_ID!,
			}
		);
		return Response.json(new ApiResponse(200, "success", recordResponse));
	} catch (error) {
		handleError(error);
	}
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	// get all the records id assocaited with the subdomain using the subDomainId field in the reocrd table.
	// delete all of them one by one from the cloudflare using the cloudflare api
	// once all records are removed
	// delete the sub domain from the db which will also remove all records associated with it.
	// return subdomain details 
	// methods required : deleteCFRecord(), getAllRecordsIdFromSubDomainId()
}
