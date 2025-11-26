import {
	boolean,
	integer,
	pgTable,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { recordTypeEnum, status } from "./enums";

// value of ttl will be auto if record is proxied otherwise some integer representing time in seconds.
export const subDomain = pgTable("sub_domain", {
	id: uuid("id").defaultRandom().primaryKey(),
	ownerId: uuid("owner_id").references(() => user.id, {
		onDelete: "cascade",
	}),
	name: text("name").notNull().unique(),
	fqdn: text("fqdn").notNull().unique(),

	// desired state
	desiredRecordType: recordTypeEnum("desired_record_type"),
	desiredTarget: text("desired_target"),
	desiredProxied: boolean("desired_proxied").default(true),
	desiredTTL: integer("desired_ttl"),

	status: status("status").default("PENDING"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});
