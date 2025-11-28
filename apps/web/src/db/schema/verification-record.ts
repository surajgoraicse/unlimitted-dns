import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";
import {
	platformEnum,
	verificationStatus,
	verificationTypeEnum,
} from "./enums";
import { subDomain } from "./sub-domain";

export const verificationRecord = pgTable("verification_record", {
	id: uuid("id").defaultRandom().primaryKey(),
	subDomainId: uuid("sub_domain_id").references(() => subDomain.id, {
		onDelete: "cascade",
	}),
	platform: platformEnum("platform").notNull(),
	verificationType: verificationTypeEnum("verification_type").notNull(),
	name: text("name").unique().notNull(),
	content: text("content").notNull(),
	ttl: integer("ttl").default(60),
	providerRecordId: text("provider_record_id").notNull().unique(),
	status: verificationStatus("status").default("PENDING"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const SelectVerificationRecordSchema =
	createSelectSchema(verificationRecord);
export type SelectVerificationRecord = z.infer<
	typeof SelectVerificationRecordSchema
>;
export const InsertVerificationRecordSchema =
	createInsertSchema(verificationRecord);
export type InsertVerificationRecord = z.infer<
	typeof InsertVerificationRecordSchema
>;
