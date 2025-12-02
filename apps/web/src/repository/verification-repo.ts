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
		return await this.db.query.verificationRecord
			.findFirst()
			.where(eq(verificationRecord.id, id));
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
	// async getVerificationRecord(
	// 	id: string
	// ): Promise<InsertVerificationRecord | undefined> {
	// 	return await this.db.query.verificationRecord.findFirst({
	// 		where: (table: typeof verificationRecord, { eq }) =>
	// 			eq(table.id, id),
	// 	});
	// }
	async createVerificationRecord(data: InsertVerificationRecord) {
		const create = await db
			.insert(verificationRecord)
			.values(data)
			.returning();
		return create[0];
	}
}

export const verificationRepo = new VerificationRepository(db);
