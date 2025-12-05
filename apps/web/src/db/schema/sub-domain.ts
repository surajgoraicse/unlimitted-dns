import { pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import z from "zod";
import { user } from "./auth";
import { status } from "./enums";

// value of ttl will be auto if record is proxied otherwise some integer representing time in seconds.
export const subDomain = pgTable(
	"sub_domain",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		ownerId: text("owner_id")
			.notNull()
			.references(() => user.id, {
				onDelete: "cascade",
			}),
		comment: text("comment"),
		projectName: text("project_name").notNull(),
		status: status("status").default("PENDING"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => ({
		ownerProjectUnique: unique("subdomain_owner_project_unique").on(
			table.ownerId,
			table.projectName
		),
	})
);

export const SelectSubDomainSchema = createSelectSchema(subDomain);
export type SelectSubDomain = z.infer<typeof SelectSubDomainSchema>;
export const InsertSubDomainSchema = createInsertSchema(subDomain);
export type InsertSubDomain = z.infer<typeof InsertSubDomainSchema>;
