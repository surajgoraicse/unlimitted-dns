import handleError, { ApiError } from "@/lib/api-error";
import ApiResponse from "@/lib/api-response";
import { getUserSession } from "@/lib/auth";
import {
	checkSubDomainProjectNameExist,
	subDomainRepo,
} from "@/repository/subdomain-repo";
import { createSubDomainReqBody, ProjectNameSchema } from "@/types/zod-schema";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
	// get data from body and cookies
	// schema validate
	// check subdomain exists
	// perform db insert operations
	// return response

	try {
		const session = await getUserSession();
		if (!session) {
			return Response.json(
				new ApiError(401, "Session Not Found, Please Signin")
			);
		}
		const ownerId = session.user.id;
		console.log(`owner id  : ${ownerId}`);
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
		const exist = await checkSubDomainProjectNameExist(projectName);
		if (exist) {
			return Response.json(
				new ApiError(400, "Project Name already exists"),
				{
					status: 400,
					statusText: "Bad Request",
				}
			);
		}

		const create = await subDomainRepo.createSubDomainDb({
			ownerId,
			projectName,
		});
		if (!create) {
			return Response.json(
				new ApiError(
					500,
					"Something went wrong, Sub domain creation failed in DB"
				),
				{
					status: 500,
					statusText: "Something went wrong",
				}
			);
		}

		return Response.json(
			new ApiResponse(201, "Sub Domain Created", create),
			{
				status: 201,
				statusText: "Sub Domain Created",
			}
		);
	} catch (error) {
		return handleError(error);
	}
}
