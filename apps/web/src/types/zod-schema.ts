import { z } from "zod";
import { RECORD_TYPES, STATUS } from "./constants";

export const createRecordReqBody = z.object({
	subDomainId: z.uuid(),
	type: z.enum(RECORD_TYPES),
	ttl: z.number().min(60).default(300),
	proxied: z.boolean().default(true),
	content: z.string(),
	comment: z.string().optional(),
});

export const RecordSchema = createRecordReqBody.extend({
	name: z.string().trim(),
	providerRecordId: z.string().trim(),
	raw: z.json().optional(),
	status: z.enum(STATUS).default("PENDING"),
	version: z.number().default(1),
});

export type Record = z.infer<typeof RecordSchema>;
export type CFRecord = Pick<
	Record,
	"name" | "type" | "ttl" | "proxied" | "content" | "comment"
>;

export const createSubDomainReqBody = z.object({
	projectName: z.string().trim(),
});
export type CreateSubdomainReqBody = z.infer<typeof createSubDomainReqBody>;

export const createSubDomainSchema = createSubDomainReqBody.extend({
	ownerId: z.string(),
});
export type CreateSubDomain = z.infer<typeof createSubDomainSchema>;

export const ProjectNameSchema = z.string().trim().min(2).max(30);


// schema for records
export const ipv4Schema = z.ipv4();
export const ipv6Schema = z.ipv6();

// cname validate
const dnsHostnameRegex =
	/^(?=.{1,255}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\.?$/;

// Simple IPv4 check to exclude IPs
const ipv4Regex =
	/^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;

export const cnameContentSchema = z
	.string()
	.trim()
	.max(255, "CNAME content exceeds 255 characters")
	.refine(
		(value) => dnsHostnameRegex.test(value),
		"Invalid CNAME hostname format"
	)
	.refine(
		(value) => !ipv4Regex.test(value),
		"CNAME content cannot be an IP address"
	)
	.refine(
		(value) => !value.includes("://"),
		"CNAME content cannot include a protocol"
	);

// TXT validate

export const txtSchema = z.string().trim().min(1).max(255);
