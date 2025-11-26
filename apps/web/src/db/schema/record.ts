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
	type: recordTypeEnum("type").notNull(),
	content: text("content").notNull(),
	ttl: integer("ttl").default(300).notNull(),
	proxied: boolean("proxied").default(true).notNull(),
	raw: json("raw"),
	status: status("status").default("PENDING").notNull(),
	version: smallint("version").default(1).notNull(),
	lastSyncedAt: timestamp("last_synced_at").defaultNow(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});
