import { Client } from "@upstash/qstash";

export const qstash = new Client({
	token: process.env.QSTASH_TOKEN!,
});

// const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;
// type Method = (typeof METHODS)[number];

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
export async function qstashPublishDeleteVerificationRecord(
	id: string,
	delay: number
) {
	await qstash.publishJSON({
		url: `${baseUrl}/api/v1/verification-record/${id}`,
		delay,
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
	});
}
