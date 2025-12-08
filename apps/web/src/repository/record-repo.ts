import { db } from "@/db/db";
import { InsertRecord, record, SelectRecord } from "@/db/schema";
import { RecordTypes } from "@/types/constants";
import { DB } from "@/types/types";
import {
	cnameContentSchema,
	ipv4Schema,
	ipv6Schema,
	txtSchema,
} from "@/types/zod-schema";
import { eq } from "drizzle-orm";
export type UpdateRecord = Pick<
	InsertRecord,
	"comment" | "content" | "proxied" | "ttl" | "type" | "name"
>;

interface IRecordRepository {
	getRecordFromId(id: string): Promise<SelectRecord | undefined>;
	getAllRecordsFromSubDomainId(id: string): Promise<SelectRecord[] | null>;
	getAllRecordsIdFromSubDomainId(id: string): Promise<{ id: string }[]>;
	getSubDomainIdFromRecordId(id: string): Promise<string | null>;
	createRecordDb(record: InsertRecord): Promise<SelectRecord | undefined>;
	updateRecordDb(record: UpdateRecord, id: string): Promise<SelectRecord>;
	deleteRecordDb(id: string): Promise<SelectRecord | null>;
	validateRecordType(
		type: RecordTypes,
		subDomainId: string
	): Promise<{ success: boolean; message: string | undefined }>;
	validateRecordName(
		name: string
	): Promise<{ success: boolean; message?: string }>;
	validateRecordContext(
		content: string,
		type: RecordTypes
	): { success: boolean; message: string | undefined };
}

class RecordRepo implements IRecordRepository {
	db: DB;
	constructor(db: DB) {
		this.db = db;
	}
	async getRecordFromId(id: string): Promise<SelectRecord | undefined> {
		const record = await this.db.query.record.findFirst({
			where: (records, { eq }) => eq(records.id, id),
		});
		return record;
	}

	async getSubDomainIdFromRecordId(id: string): Promise<string | null> {
		const result = await this.db.query.record.findFirst({
			where: (records, { eq }) => eq(records.id, id),
			columns: {
				subDomainId: true,
			},
		});
		return result?.subDomainId || null;
	}
	async updateRecordDb(
		recordData: UpdateRecord,
		id: string
	): Promise<SelectRecord> {
		const updatedRecord = await this.db
			.update(record)
			.set({
				comment: recordData.comment,
				content: recordData.content,
				proxied: recordData.proxied,
				ttl: recordData.ttl,
				type: recordData.type,
				name: recordData.name,
			})
			.where(eq(record.providerRecordId, id))
			.returning();
		return updatedRecord[0];
	}
	async deleteRecordDb(id: string): Promise<SelectRecord | null> {
		const deletedRecords = await this.db
			.delete(record)
			.where(eq(record.id, id))
			.returning();

		if (deletedRecords.length === 0) {
			return null;
		}

		return deletedRecords[0];
	}
	async getAllRecordsFromSubDomainId(id: string) {
		try {
			return await db.query.record.findMany({
				where: (records, { eq }) => eq(records.subDomainId, id),
			});
		} catch (error) {
			return null;
		}
	}
	async getAllRecordsIdFromSubDomainId(
		id: string
	): Promise<{ id: string; providerRecordId: string }[]> {
		return await db.query.record.findMany({
			where: (records, { eq }) => eq(records.subDomainId, id),
			columns: {
				id: true,
				providerRecordId: true,
			},
		});
	}
	async createRecordDb(
		recordValues: InsertRecord
	): Promise<SelectRecord | undefined> {
		const create = await this.db
			.insert(record)
			.values(recordValues)
			.returning();

		return create[0];
	}

	async validateRecordType(type: RecordTypes, subDomainId: string) {
		// this function validates a new record type : return true if all good otherwise false
		// 	// checks if a record already exists : if 'A' already exist then it wont allow to create an another one
		// 	// checks if 'cname' already exists : if exist then it wont allow to create any other record on the name
		// 	// allows multiple txt record.
		const records = await this.getAllRecordsFromSubDomainId(subDomainId);

		// If no records exist → always allowed
		if (!records || records.length === 0) {
			return { success: true, message: undefined };
		}

		// 1. If CNAME exists → block ALL other types (including TXT)
		if (records.some((r) => r.type === "CNAME")) {
			return {
				success: false,
				message:
					"CNAME record already exists. No other records allowed.",
			};
		}

		// 2. If new type = CNAME → must be first record
		if (type === "CNAME") {
			return {
				success: false,
				message: "Cannot create CNAME: other records already exist.",
			};
		}

		// 3. If record of same type exists → block duplicates (except TXT)
		if (type !== "TXT" && records.some((r) => r.type === type)) {
			return {
				success: false,
				message: `${type} record already exists.`,
			};
		}

		// 4. TXT allowed freely (as long as no CNAME exists)
		return { success: true, message: undefined };
	}

	async validateRecordName(
		name: string,
		checkExisting: boolean = true
	): Promise<{ success: boolean; message?: string }> {
		// 1. Basic validation — ensure the user provided only the subdomain
		if (!name || typeof name !== "string") {
			return {
				success: false,
				message: "Name is required",
			};
		}

		// Allow: letters, digits, hyphens — standard subdomain rules
		const subdomainPattern = /^[a-zA-Z0-9-]+$/;

		if (!subdomainPattern.test(name)) {
			return {
				success: false,
				message:
					"Invalid subdomain. Only letters, numbers and hyphens are allowed",
			};
		}

		// 2. Compose actual full domain
		// const fullDomain = `${name}.coderz.space`;

		// 3. Check existence in DB
		const existing = await this.db.query.record.findFirst({
			where: (tbl, { eq }) => eq(tbl.name, name),
		});

		if (existing && checkExisting) {
			return {
				success: false,
				message: "This subdomain is already taken",
			};
		}

		// 4. Everything is valid
		return {
			success: true,
			message: "Valid subdomain",
		};
	}

	validateRecordContext(
		content: string,
		type: RecordTypes
	): { success: boolean; message: string | undefined } {
		// validate record content :
		// CNAME : should be a url
		// A : ipv4
		// AAAA : ipv6
		// TXT : string

		let parseResult: { success: boolean; error?: any } | undefined;

		switch (type) {
			case "A":
				parseResult = ipv4Schema.safeParse(content);
				break;
			case "AAAA":
				parseResult = ipv6Schema.safeParse(content);
				break;
			case "CNAME":
				parseResult = cnameContentSchema.safeParse(content);
				break;
			case "TXT":
				parseResult = txtSchema.safeParse(content);
				break;
			default:
				return { success: false, message: undefined };
		}

		if (!parseResult) {
			return { success: false, message: undefined };
		}

		if (parseResult.success) {
			return { success: true, message: undefined };
		}

		// try to extract a useful error message from the parser, fallback to generic message
		const errMessage =
			(parseResult.error &&
				(parseResult.error.message ||
					(Array.isArray(parseResult.error.issues) &&
						parseResult.error.issues[0]?.message))) ||
			"Invalid record content";
		return { success: false, message: String(errMessage) };
	}
}

export const recordRepo = new RecordRepo(db);
