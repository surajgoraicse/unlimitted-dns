import { db } from "@/db/db";
import { InsertVerificationRecord, verificationRecord } from "@/db/schema";
import { DB } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";

interface IVerification {
	createVerificationRecord(
		data: InsertVerificationRecord
	): Promise<InsertVerificationRecord | undefined>;
	getVerificationRecord(
		id: string
	): Promise<InsertVerificationRecord | undefined>;
	deleteVerificationRecord(
		id: string
	): Promise<InsertVerificationRecord | undefined>;
}

class VerificationRepository implements IVerification {
	db: DB;
	constructor(db: DB) {
		this.db = db;
	}
	async getVerificationRecord(
		id: string
	): Promise<InsertVerificationRecord | undefined> {
		return await this.db.query.verificationRecord.findFirst({
			where: eq(verificationRecord.id, id),
		});
	}

	async deleteVerificationRecord(
		id: string
	): Promise<InsertVerificationRecord | undefined> {
		const record = await this.db
			.delete(verificationRecord)
			.where(eq(verificationRecord.id, id))
			.returning();
		return record[0];
	}
	
	async createVerificationRecord(data: InsertVerificationRecord) {
		console.log(`data passed : ${data}`);
		const create = await db
			.insert(verificationRecord)
			.values({
				content: data.content,
				name: data.name,
				platform: data.platform,
				subDomainId: data.subDomainId,
				verificationType: data.verificationType,
				providerRecordId: data.providerRecordId,
				ttl: data.ttl,
				status: data.status,
			})
			.returning();
		return create[0];
	}
}

export const verificationRepo = new VerificationRepository(db);
