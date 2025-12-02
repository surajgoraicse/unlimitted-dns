import handleError, { ApiError } from "@/lib/api-error";
import ApiResponse from "@/lib/api-response";
import {
	checkOwnershipFromSubDomainId,
	getUserIdFromSession,
} from "@/lib/auth";
import { recordRepo } from "@/repository/record-repo";
import { subDomainRepo } from "@/repository/subdomain-repo";
import cloudflareService from "@/service/cloudflare-service";
import { createSubDomainReqBody, ProjectNameSchema } from "@/types/zod-schema";
import { NextRequest } from "next/server";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		console.log("hello 1");
		const subDomainId = (await params)?.id;
		if (!subDomainId) {
			return Response.json(
				new ApiResponse(400, "Record ID not found", false),
				{
					status: 404,
					statusText: "Bad Request",
				}
			);
		}
		const ownerId = await checkOwnershipFromSubDomainId(subDomainId);
		if (!ownerId) {
			return Response.json(new ApiResponse(401, "Unauthorized", false), {
				status: 401,
				statusText: "Unauthorized",
			});
		}

		console.log("hello 2");
		const subDomain = await subDomainRepo.getSubDomainFromId(
			subDomainId,
			ownerId
		);
		console.log("hello 3", subDomain);

		if (!subDomain) {
			return Response.json(
				new ApiResponse(404, "SubDomain Not Found", false),
				{
					status: 404,
					statusText: "Not Found",
				}
			);
		}
		const records =
			await recordRepo.getAllRecordsFromSubDomainId(subDomainId);
		console.log("hello 4", records);

		return Response.json(
			new ApiResponse(200, "OK", {
				subDomain,
				records,
			}),
			{
				status: 200,
				statusText: "OK",
			}
		);
	} catch (error) {
		return handleError(error);
	}
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	// get all the records id assocaited with the subdomain using the subDomainId field in the reocrd table.
	// delete all of them one by one from the cloudflare using the cloudflare api
	// once all records are removed
	// delete the sub domain from the db which will also remove all records associated with it.
	// return subdomain details
	// methods required : deleteCFRecord(), getAllRecordsIdFromSubDomainId()
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
		const ownerId = await getUserIdFromSession();
		if (!ownerId) {
			return Response.json(new ApiResponse(401, "Unauthorized", false), {
				status: 401,
				statusText: "Unauthorized",
			});
		}
		console.log(1);
		const recordsToDelete =
			await recordRepo.getAllRecordsIdFromSubDomainId(subDomainId);
		console.log("2");
		for (const record of recordsToDelete) {
			try {
				await cloudflareService.deleteCFRecord(record.id);
				console.log(`Deleted Cloudflare record with ID: ${record.id}`);
			} catch (cfError) {
				console.error(
					`Failed to delete Cloudflare record ${record.id}:`,
					cfError
				);
				// Depending on requirements, you might want to stop here or continue
				// For now, we'll log and continue, but this might leave orphaned CF records
			}
		}
		console.log(3);
		const deletedSubDomain = await subDomainRepo.deleteSubDomainDb(
			subDomainId,
			ownerId
		);
		console.log(4);
		if (!deletedSubDomain) {
			return Response.json(
				new ApiResponse(404, "Sub Domain not found in DB", false),
				{
					status: 404,
					statusText: "Not Found",
				}
			);
		}

		return Response.json(
			new ApiResponse(
				200,
				"Sub Domain and associated records deleted successfully",
				deletedSubDomain
			),
			{
				status: 200,
				statusText: "Success",
			}
		);
	} catch (error) {
		return handleError(error);
	}
}

export async function PUT(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const ownerId = await getUserIdFromSession();
	if (!ownerId) {
		return Response.json(new ApiResponse(401, "Unauthorized", false), {
			status: 401,
			statusText: "Unauthorized",
		});
	}
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

	const body = await req.json();
	const parsedBody = createSubDomainReqBody.safeParse(body);
	if (!parsedBody.success) {
		return handleError(parsedBody.error);
	}
	const { projectName } = parsedBody.data;

	const isValid = ProjectNameSchema.safeParse(projectName);
	if (!isValid.success) {
		return Response.json(
			new ApiError(400, "Invalid Project Name", isValid.error),
			{
				status: 400,
				statusText: "Bad Request",
			}
		);
	}
	console.log(`project name : ${projectName}`);

	const existingSubDomain =
		await subDomainRepo.checkSubDomainExistFromProjectName(
			projectName,
			ownerId
		);

	if (existingSubDomain) {
		return Response.json(
			new ApiError(
				404,
				"Sub Domain Already Exists with this Project name"
			),
			{
				status: 400,
				statusText: "Bad Request",
			}
		);
	}

	const update = subDomainRepo.updateSubDomainDb(
		projectName,
		subDomainId,
		ownerId
	);
	if (!update) {
		return Response.json(
			new ApiError(
				500,
				"Something went wrong, Sub domain update failed in DB"
			),
			{
				status: 500,
				statusText: "Something went wrong",
			}
		);
	}
	return Response.json(new ApiResponse(200, "Sub Domain Updated", update), {
		status: 200,
		statusText: "Sub Domain Updated",
	});
}
