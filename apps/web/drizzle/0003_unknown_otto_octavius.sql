ALTER TABLE "sub_domain" RENAME COLUMN "sub_domain_name" TO "sub_name";--> statement-breakpoint
ALTER TABLE "sub_domain" RENAME COLUMN "fqdn" TO "name";--> statement-breakpoint
ALTER TABLE "sub_domain" DROP CONSTRAINT "sub_domain_sub_domain_name_unique";--> statement-breakpoint
ALTER TABLE "sub_domain" DROP CONSTRAINT "sub_domain_fqdn_unique";--> statement-breakpoint
ALTER TABLE "record" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sub_domain" ALTER COLUMN "desired_record_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."record_type";--> statement-breakpoint
CREATE TYPE "public"."record_type" AS ENUM('A', 'AAAA', 'CNAME', 'TXT');--> statement-breakpoint
ALTER TABLE "record" ALTER COLUMN "type" SET DATA TYPE "public"."record_type" USING "type"::"public"."record_type";--> statement-breakpoint
ALTER TABLE "sub_domain" ALTER COLUMN "desired_record_type" SET DATA TYPE "public"."record_type" USING "desired_record_type"::"public"."record_type";--> statement-breakpoint
ALTER TABLE "record" DROP COLUMN "last_synced_at";--> statement-breakpoint
ALTER TABLE "sub_domain" ADD CONSTRAINT "sub_domain_sub_name_unique" UNIQUE("sub_name");--> statement-breakpoint
ALTER TABLE "sub_domain" ADD CONSTRAINT "sub_domain_name_unique" UNIQUE("name");