import { db } from "@/db/db";
import { InsertRecord, record, SelectRecord } from "@/db/schema";
import { RecordTypes } from "@/types/constants";
import {
	cnameContentSchema,
	ipv4Schema,
	ipv6Schema,
	txtSchema,
} from "@/types/zodSchemas";
import { ZodError } from "zod";

interface IRecordRepository {
	getAllRecordsFromSubDomainId(id: string): Promise<SelectRecord[] | null>;
	getAllRecordsIdFromSubDomainId(id: string): Promise<{ id: string }[]>;
	createRecordDb(data: InsertRecord): Promise<SelectRecord | null>;
	validateRecordType(): Promise<boolean>;
	validateRecordName(): Promise<boolean>;
	validateRecordContext(): Promise<boolean>;
}

export async function getAllRecordsFromSubDomainId(id: string) {
	if (!id) {
		throw new Error("Bad Request : ID pass karo lawdee");
	}
	const records = await db.query.record.findMany({
		where: (records, { eq }) => eq(records.subDomainId, id),
		columns: {
			id: true,
		},
	});
	return records;
}

// this function validates a new record : return true if all good otherwise false
// checks if a record already exists : if 'A' already exist then it wont allow to create an another one
// checks if 'cname' already exists : if exist then it wont allow to create any other record on the name
// allows multiple txt record.
export async function validateRecordName(
	type: RecordTypes,
	subDomainId: string
) {
	const records = await getAllRecordsFromSubDomainId(subDomainId);
	const exist = records.some(
		(record) =>
			(record.type === type && record.type !== "TXT") ||
			record.type === "CNAME"
	);
	return exist;
}

// validate record content :
// CNAME : should be a url
// A : ipv4
// AAAA : ipv6
// TXT : string
export async function validateRecordContent(
	content: string,
	type: RecordTypes
): Promise<{ success: boolean; error: ZodError | undefined }> {
	let parseResult;

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
			return { success: false, error: undefined };
	}
	return { success: parseResult.success, error: parseResult.error };
}

export async function createRecordDb(data: CreateRecord) {
	const create = await db
		.insert(record)
		.values({
			subDomainId: data.subDomainId,
			providerRecordId: data.providerRecordId,
			type: data.type,
			content: data.content,
			ttl: data.ttl,
			proxied: data.proxied,
			raw: data?.raw,
			status: data.status,
			version: data.version,
		})
		.returning();
	console.log("record create : ", create);
	return create[0];
}
