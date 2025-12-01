import {
	boolean,
	integer,
	json,
	pgTable,
	smallint,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema, Json } from "drizzle-zod";
import z from "zod";
import { recordTypeEnum, status } from "./enums";
import { subDomain } from "./sub-domain";

export const record = pgTable("record", {
	id: uuid("id").defaultRandom().primaryKey(),
	subDomainId: uuid("sub_domain_id")
		.references(() => subDomain.id, {
			onDelete: "cascade",
		})
		.notNull(),
	providerRecordId: text("provider_record_id").notNull().unique(),
	name: text("name").notNull().unique(),
	type: recordTypeEnum("type").notNull(),
	content: text("content").notNull(),
	ttl: integer("ttl").notNull(),
	proxied: boolean("proxied").notNull(),
	comment: text("comment"),
	status: status("status").default("PENDING").notNull(),
	version: smallint("version").default(1).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),

	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const SelectRecordSchema = createSelectSchema(record);
export type SelectRecord = z.infer<typeof SelectRecordSchema>;
export const InsertRecordSchema = createInsertSchema(record);
export type InsertRecord = z.infer<typeof InsertRecordSchema>;
