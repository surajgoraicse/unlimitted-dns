import handleError, { ApiError } from "@/lib/api-error";
import ApiResponse from "@/lib/api-response";
import { verificationRepo } from "@/repository/verification-repo";
import cloudflareService from "@/service/cloudflare-service";
import { qstashPublishDeleteVerificationRecord } from "@/service/qstash";
import { DrizzleQueryError } from "drizzle-orm";
import { NextRequest } from "next/server";
import { z } from "zod";


export const verificationRecordSchema = z.object({
	content: z.string().trim().min(1).max(255),
	subDomainId: z.uuid(),
});
export type VerificationRecord = z.infer<typeof verificationRecordSchema>;

export async function POST(req: NextRequest) {
	// declare createCFRecord in outer scope so it's available in catch
	let createCFRecord: any = null;

	try {
		// here id is subdomain id

		const body = await req.json();
		const parsedResult = verificationRecordSchema.safeParse(body);
		if (!parsedResult.success) {
			return Response.json(new ApiError(400, parsedResult.error.message));
		}

		const { content, subDomainId } = parsedResult.data;
		createCFRecord = await cloudflareService.createVercelVerificationRecord(
			{ content }
		);
		// Validate it : check if it is created

		const createRecordDB = await verificationRepo.createVerificationRecord({
			content,
			subDomainId,
			name: "_vercel",
			platform: "VERCEL",
			verificationType: "TXT",
			providerRecordId: createCFRecord.id,
			ttl: 60,
			status: "VERIFIED",
		});
		console.log("create db", createRecordDB);

		// publish a qstash delete
		await qstashPublishDeleteVerificationRecord(createRecordDB.id, 10);

		return Response.json(new ApiResponse(200, "Success", createRecordDB), {
			status: 200,
			statusText: "OK",
		});
	} catch (error) {
		console.log(`error  : ${error}`);
		if (error instanceof DrizzleQueryError) {
			// only attempt to delete the CF record if it was created
			if (createCFRecord && createCFRecord.id) {
				await cloudflareService.deleteCFRecord(createCFRecord.id);
			}
			return Response.json(
				new ApiError(500, "Failed to create record in db", error),
				{
					status: 500,
					statusText: "Internal Server Error",
				}
			);
		}
		return handleError(error);
	}
}
