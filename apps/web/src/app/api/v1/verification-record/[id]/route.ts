import handleError, { ApiError } from "@/lib/api-error";
import ApiResponse from "@/lib/api-response";
import { verificationRepo } from "@/repository/verification-repo";
import cloudflareService from "@/service/cloudflare-service";
import { NextRequest } from "next/server";

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const recordId = (await params).id;
		const record = await verificationRepo.getVerificationRecord(recordId);
		if (!record) {
			return Response.json(
				new ApiError(404, "Verification Record not found"),
				{ status: 404 }
			);
		}
		const deleteFromCf = await cloudflareService.deleteCFRecord(
			record.providerRecordId
		);
		console.log(
			`delete cf record response : ${JSON.stringify(deleteFromCf)}`
		);

		const deleteFromDb =
			await verificationRepo.deleteVerificationRecord(recordId);
		if (!deleteFromDb) {
			return Response.json(
				new ApiError(404, "Verification Record deletion failed in db"),
				{ status: 404 }
			);
		}
		return Response.json(
			new ApiResponse(201, "deleted Successfully ", deleteFromDb),
			{
				status: 201,
			}
		);
	} catch (error) {
		console.log(error);
		return handleError(error);
	}
}
