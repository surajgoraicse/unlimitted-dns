import { pgEnum } from "drizzle-orm/pg-core";

// auth
export const role = pgEnum("role", ["ADMIN", "USER"]);

// record :
export const recordTypeEnum = pgEnum("record_type", [
	"A",
	"AAAA",
	"CNAME",
	"TXT",
	"CAA",
]);

// subdomain
export const status = pgEnum("status", [
	"PENDING",
	"PROVISIONING",
	"ACTIVE",
	"ERROR",
	"DELETING",
	"DELETED",
	"BLOCKED",
]);

// verification
export const platformEnum = pgEnum("platform", ["VERCEL"]);
export const verificationTypeEnum = pgEnum("verification_type", [
	"TXT",
	"HTTP",
]);
export const verificationStatus = pgEnum("verfication_status", [
	"PENDING",
	"VERIFIED",
	"FAILED",
]);

// audit

export const auditActions = pgEnum("audit_actions", [
	"CREATE-SUBDOMAIN",
	"DELETE-SUBDOMAIN",
	"UPDATE-SUBDOMAIN",
	"CREATE-RECORD",
	"UPDATE-RECORD",
	"DELETE-RECORD",
	"VERIFICATION-START",
	"VERIFICATION-FAILED",
	"VERIFICATION-SUCCESS",
	// CLOUDFLARE
	"CLOUDFLARE-ERROR",

	// USER
	"USER-CREATED",
	"USER-DELETED",
	"USER-UPDATE",
]);
export const auditResourceType = pgEnum("audit_resource_type", [
	"SUBDOMAIN",
	"RECORD",
	"USER",
]);
