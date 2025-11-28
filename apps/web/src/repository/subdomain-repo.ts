// src/repository/subdomain.ts (or similar)
import { db } from "@/db/db";
import { InsertSubDomain, SelectSubDomain, subDomain } from "@/db/schema";
import { CreateSubdomain } from "@/types/zodSchemas";


interface ISubDomainRepository{
	createSubdomain() : Promise<SelectSubDomain | null>
	checkSubDomainExistFromName(name : string) : Promise<boolean>
	checkSubDomainExistFromSubName(subName : string) : Promise<boolean>
	
}


export async function createSubDomain(data: CreateSubdomain) {
	const { name, ownerId, fqdn } = data;

	// 1. MUST use .returning() to get the inserted data as a clean array of objects
	const insertedRows = await db
		.insert(subDomain)
		.values({
			name,
			ownerId,
			fqdn,
		})
		.returning(); // 👈 ADD THIS BACK

	console.log("..... inserted row............");
	console.log(insertedRows);
	console.log(".......inserted row..........");

	// 2. Return the first inserted object (the plain data)
	return insertedRows[0];
}

export async function checkSubDomainExist(name: string) {
	const find = await db.query.subDomain.findFirst({
		where: (subdoman, { eq }) => eq(subdoman.name, name),
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
		where: (subDomain, { eq }) => eq(subDomain.subDomainName, subName),
	});
	return find;
}
