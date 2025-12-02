import { db } from "@/db/db";

export type DB = typeof db;

export interface Context {
	params: {
		id: string; // Dynamic segment [id] will be a string
	};
}
