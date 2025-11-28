import handleError, { ApiError } from "@/lib/api-error";
import ApiResponse from "@/lib/api-response";
import { createSubdomainReqBody } from "@/types/zodSchemas";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {

	// get data from body and cookies
	// schema validate
	// check subdomain exists
	// perform db insert operations
	// return response

	try {
		const body = await req.json();

		const parsedBody = createSubdomainReqBody.safeParse(body);
		if (!parsedBody.success) {
			return Response.json(
				new ApiError(400, "Invalid Body Data Passed", parsedBody.error),
				{
					status: 400,
					statusText: "Bad Request",
				}
			);
		}
		let { name, ownerId } = parsedBody.data;
		name = name.toLowerCase();
		const fqdn = name.trim() + "." + process.env.DOMAIN;
		const exist = await checkSubdomainExist(name);
		console.log("value of exist", exist);
		if (exist) {
			return Response.json(
				new ApiError(400, `Sub Domain : ${fqdn} already exist`),
				{
					status: 400,
					statusText: "Bad Request",
				}
			);
		}

		const subdomain = await createSubdomain({
			name,
			ownerId,
			fqdn,
		});
		return Response.json(
			new ApiResponse(
				201,
				"Sub Domain Created Successfully",
				subdomain // Clean object from the repository
			),
			{
				status: 201,
				statusText: "success",
			}
		);
	} catch (error) {
		return handleError(error);
	}
}
