import handleError, { ApiError } from "@/lib/api-error";
import ApiResponse from "@/lib/api-response";
import { recordRepo } from "@/repository/record-repo";
import { getSubDomainFromId } from "@/repository/subdomain-repo";
import cloudflareService from "@/service/cloudflare-service";
import { createRecordReqBody } from "@/types/zod-schema";
import { NextRequest } from "next/server";

export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const id = (await params).id;
		if (!id) {
			return Response.json(new ApiError(400, "Record ID not found"), {
				status: 400,
				statusText: "Bad Request",
			});
		}
		const body = await req.json();
		const parsedResult = createRecordReqBody.safeParse(body);
		if (!parsedResult.success) {
			return handleError(parsedResult.error);
		}
		const { subDomainId, type, ttl, proxied, content, comment } =
			parsedResult.data;
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
		const record = await cloudflareService.updateCFRecord(
			{
				name: find.name,
				content,
				type,
				ttl,
				proxied,
				comment,
			},
			id
		);
		if (!record) {
			return Response.json(
				new ApiError(500, "Failed to create record in Cloudflare"),
				{
					status: 500,
					statusText: "Internal Server Error",
				}
			);
		}

		const dbRecord = await recordRepo.updateRecordDb(
			{
				comment,
				content,
				proxied,
				ttl,
				type,
			},
			id
		);
		if (!dbRecord) {
			// TODO: Rollback to prev version
		}

		console.log(
			".......................record update Respose ......................"
		);
		console.log(record);
		console.log(dbRecord);
		console.log(
			".......................record update Respose ......................"
		);
		return Response.json(
			new ApiResponse(200, "Successfully Updated", record),
			{
				status: 200,
				statusText: "success",
			}
		);
	} catch (error) {
		return handleError(error);
	}
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: { id: string } }
) {
	try { 
		const id = (await params).id;
		if (!id) {
			return Response.json(new ApiError(400, "Record ID not found"), {
				status: 400,
				statusText: "Bad Request",
			});
		}

		const dbRecord = await recordRepo.deleteRecordDb(id);

		if (!dbRecord) {
			return Response.json(
				new ApiError(404, `Record with ID ${id} not found in DB`),
				{
					status: 404,
					statusText: "Not Found",
				}
			);
		}

		const cfRecord = await cloudflareService.deleteCFRecord(
			dbRecord.providerRecordId
		);

		if (!cfRecord) {
			// If CF deletion fails, consider re-inserting into DB or marking as failed
			console.error(
				`Failed to delete Cloudflare record for providerRecordId: ${dbRecord.providerRecordId}`
			);
			return Response.json(
				new ApiError(
					500,
					"Failed to delete record from Cloudflare, DB record deleted."
				),
				{
					status: 500,
					statusText: "Internal Server Error",
				}
			);
		}

		console.log(
			".......................record delete Response ......................"
		);
		console.log("DB Record Deleted:", dbRecord);
		console.log("CF Record Deleted:", cfRecord);
		console.log(
			".......................record delete Response ......................"
		);

		return Response.json(
			new ApiResponse(200, "Record Deleted Successfully", {
				dbRecord,
				cfRecord,
			}),
			{
				status: 200,
				statusText: "Success",
			}
		);
		
	}
	catch(error) {
		return handleError(error);
	}
}
