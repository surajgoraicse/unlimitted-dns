// src/repository/subdomain.ts (or similar)
import { db } from "@/db/db";
import { InsertSubDomain, SelectSubDomain, subDomain } from "@/db/schema";
import { DB } from "@/types/types";
import { CreateSubDomain } from "@/types/zod-schema";
import { eq } from "drizzle-orm";

type ErrorType = {
	message: string;
	error: any;
};

interface ISubDomainRepository {
	createSubDomainDb(
		subDomainValue: CreateSubDomain
	): Promise<SelectSubDomain | null>;
	checkSubDomainExistFromName(name: string): Promise<boolean>;
	checkSubDomainExistFromSubName(subName: string): Promise<boolean>;
	deleteSubDomainDb(id: string): Promise<SelectSubDomain | null>;
	getSubDomainFromId(id: string): Promise<SelectSubDomain | null>;
}

class SubDomainRepository implements ISubDomainRepository {
	db: DB;
	constructor(db: DB) {
		this.db = db;
	}
	async createSubDomainDb(subDomainValue: CreateSubDomain) {
		// const session = await getUserSession();
		// if (!session) {
		// 	return { message: "Session Not Found", error: undefined };
		// }
		// const ownerId = session.user.id
		// if (!ownerId) {
		// 	return { message: "Owner Id Not Found", error: undefined };
		// }
		const create = await this.db
			.insert(subDomain)
			.values(subDomainValue)
			.returning();
		return create[0];
	}
	async checkSubDomainExistFromName(name: string): Promise<boolean> {
		throw new Error("Method not implemented.");
	}
	async checkSubDomainExistFromSubName(subName: string): Promise<boolean> {
		throw new Error("Method not implemented.");
	}
	async deleteSubDomainDb(id: string): Promise<SelectSubDomain | null> {
		try {
			const deletedSubDomain = await db
				.delete(subDomain)
				.where(eq(subDomain.id, id))
				.returning();
			if (deletedSubDomain.length === 0) {
				return null;
			}
			return deletedSubDomain[0];
		} catch (error) {
			console.log(error);
			return null;
		}
	}

	async getSubDomainFromId(id: string): Promise<SelectSubDomain | null> {
		try {
			const find = await db.query.subDomain.findFirst({
				where: (subdoman, { eq }) => eq(subdoman.id, id),
			});
			if (!find) {
				return null;
			} else {
				return find;
			}
		} catch (error) {
			console.log(error);
			return null;
		}
	}
}

export const subDomainRepo = new SubDomainRepository(db);

export async function insertSubDomain(data: InsertSubDomain) {
	const { name, ownerId } = data;

	// 1. MUST use .returning() to get the inserted data as a clean array of objects
	const insertedRows = await db.insert(subDomain).values(data).returning(); // 👈 ADD THIS BACK

	console.log("..... inserted row............");
	console.log(insertedRows);
	console.log(".......inserted row..........");

	// 2. Return the first inserted object (the plain data)
	return insertedRows[0];
}

export async function checkSubDomainProjectNameExist(projectName: string) {
	const find = await db.query.subDomain.findFirst({
		where: (subdoman, { eq }) => eq(subdoman.projectName, projectName),
	});
	return !!find;
}

export async function getSubDomainFromId(id: string) {
	const find = await db.query.subDomain.findFirst({
		where: (subdoman, { eq }) => eq(subdoman.id, id),
	});
	return find;
}
export async function getSubDomainFromSubName(subName: string) {
	const find = await db.query.subDomain.findFirst({
		where: (subDomain, { eq }) => eq(subDomain.subName, subName),
	});
	return find;
}

export function getSubNameFromName(name: string) {
	let nameArr = name.trim().split(".");
	nameArr.pop();
	nameArr.pop();
	return nameArr.join(".");
}
// utils/domain-validator.ts
export class DomainValidator {
	private readonly baseDomain: string;

	constructor(baseDomain: string) {
		if (!baseDomain) {
			throw new Error("Base domain is required");
		}

		// Normalize to lowercase (DNS is case-insensitive)
		this.baseDomain = baseDomain.toLowerCase();
	}

	validate(fullDomain: string): boolean {
		if (!fullDomain) return false;

		const domain = fullDomain.toLowerCase().trim();
		const base = `.${this.baseDomain}`;

		// Must end with ".coderz.space"
		if (!domain.endsWith(base)) return false;

		// Extract the subdomain part before ".coderz.space"
		const sub = domain.slice(0, domain.length - base.length);

		if (!sub) return false;

		// Disallow ".."
		if (sub.includes("..")) return false;

		// Split by dot
		const labels = sub.split(".");

		// RFC 1035 compliant label regex:
		// - 1–63 chars
		// - alphanumeric or hyphen
		// - cannot start/end with hyphen
		const labelRegex = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

		for (const label of labels) {
			if (!labelRegex.test(label)) {
				return false;
			}
		}

		// Total length must not exceed 253 chars (DNS rule)
		if (domain.length > 253) return false;

		return true;
	}
}
export const nameValidator = new DomainValidator(
	process.env.DOMAIN || "coderz.space"
);
