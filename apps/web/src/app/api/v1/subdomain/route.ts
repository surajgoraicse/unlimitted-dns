import handleError, { ApiError } from "@/lib/api-error";
import ApiResponse from "@/lib/api-response";
import { getUserSession } from "@/lib/auth";
import {
	checkSubDomainExist,
	getSubNameFromName,
	insertSubDomain,
	nameValidator,
} from "@/repository/subdomain-repo";
import { createSubDomainReqBody } from "@/types/zod-schema";
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
		const { name } = parsedBody.data;
		const isValid = nameValidator.validate(name);
		if (!isValid) {
			return Response.json(new ApiError(400, "Invalid Domain Name"), {
				status: 400,
				statusText: "Bad Request",
			});
		}
		console.log(`name : ${name}`);
		const exist = await checkSubDomainExist(name);
		if (exist) {
			return Response.json(
				new ApiError(400, "sub domain already exists"),
				{
					status: 400,
					statusText: "Bad Request",
				}
			);
		}

		const subName = getSubNameFromName(name);
		console.log(`subName  :${subName}`);

		const create = await insertSubDomain({ name, ownerId, subName });
		console.log(`create subdomain : ${create}`);
		if (!create) {
			return Response.json(new ApiResponse(500, "Something went wrong"), {
				status: 500,
				statusText: "Something went wrong",
			});
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
