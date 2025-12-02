import handleError from "@/lib/api-error";
import ApiResponse from "@/lib/api-response";
import { checkOwnershipFromSubDomainId } from "@/lib/auth";
import { recordRepo } from "@/repository/record-repo";
import { NextRequest } from "next/server";

// get all registered dns record of a user in a specific project
// id = subdomain id
export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const subDomainId = (await params)?.id;
		if (!subDomainId) {
			return Response.json(
				new ApiResponse(400, "Sub Domain ID not found", false),
				{
					status: 400,
					statusText: "Bad Request",
				}
			);
		}
		const ownership = checkOwnershipFromSubDomainId(subDomainId);
		if (!ownership) {
			return Response.json(new ApiResponse(403, "Forbidden", false), {
				status: 403,
				statusText: "Forbidden",
			});
		}

		const records =
			await recordRepo.getAllRecordsFromSubDomainId(subDomainId);
		return Response.json(new ApiResponse(200, "Success", records), {
			status: 200,
			statusText: "OK",
		});
	} catch (error) {
		return handleError(error);
	}
}
