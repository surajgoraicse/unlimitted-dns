import { CFRecord } from "@/types/zod-schema";
import Cloudflare from "cloudflare";

export const cloudflareClient = new Cloudflare({
	apiToken: process.env.CLOUDFLARE_TOKEN!,
});
const client = cloudflareClient;

interface ICloudflareService {
	findCFRecord(
		recordId: string
	): Promise<Cloudflare.DNS.Records.RecordResponse>;
	createCFRecord(
		record: CFRecord
	): Promise<Cloudflare.DNS.Records.RecordResponse>;
	updateCFRecord(
		record: CFRecord,
		recordId: string
	): Promise<Cloudflare.DNS.Records.RecordResponse>;
	listAllCFRecords(): Promise<Cloudflare.DNS.Records.RecordResponse[]>;
	deleteCFRecord(
		recordId: string
	): Promise<Cloudflare.DNS.Records.RecordDeleteResponse>;
	createVercelVerificationRecord(content: {
		content: string;
	}): Promise<Cloudflare.DNS.Records.RecordResponse>;
}

class CloudflareService implements ICloudflareService {
	zone_id: string;
	constructor(zone_id: string) {
		this.zone_id = zone_id;
	}
	async createVercelVerificationRecord(content: {
		content: string;
	}): Promise<Cloudflare.DNS.Records.RecordResponse> {
		try {
			return await client.dns.records.create({
				zone_id: this.zone_id,
				name: "_vercel",
				ttl: 60,
				type: "TXT",
				content: content.content,
			});
		} catch (error) {
			console.error("Cloudflare API Error:", error);
			throw new Error("Failed to create DNS record via Cloudflare.");
		}
	}

	async findCFRecord(recordId: string) {
		console.log("cccccc ", recordId);
		try {
			return await client.dns.records.get(recordId, {
				zone_id: this.zone_id,
			});
		} catch (error) {
			console.log(error);
			throw error;
		}
	}

	async createCFRecord(record: CFRecord) {
		return await client.dns.records.create({
			name: record.name,
			zone_id: this.zone_id,
			type: record.type,
			ttl: record.ttl,
			proxied: record.proxied,
			content: record.content,
			comment: record.comment || "",
		});
	}

	async listAllCFRecords() {
		const recordList = [];
		for await (const recordResponse of cloudflareClient.dns.records.list({
			zone_id: this.zone_id,
		})) {
			recordList.push(recordResponse);
			console.log(recordResponse);
		}
		return recordList;
	}
	async updateCFRecord(record: CFRecord, recordId: string) {
		if (!this.zone_id) {
			throw new Error("Missing Cloudflare zone_id");
		}

		return await client.dns.records.update(recordId, {
			zone_id: this.zone_id,
			name: record.name,
			type: record.type,
			ttl: record.ttl,
			proxied: record.proxied,
			content: record.content,
			comment: record.comment || "",
		});
	}
	async updateCFRecord2(record: CFRecord, recordId: string) {
		if (!this.zone_id) {
			throw new Error("Missing Cloudflare zone_id");
		}

		return await client.dns.records.update(recordId, {
			zone_id: this.zone_id,
			name: record.name,
			type: record.type,
			ttl: record.ttl,
			proxied: record.proxied,
			content: record.content,
			comment: record.comment || "",
		});
	}

	async deleteCFRecord(recordId: string) {
		return await client.dns.records.delete(recordId, {
			zone_id: this.zone_id,
		});
	}
}

const cloudflareService = new CloudflareService(process.env.ZONE_ID!);
export default cloudflareService;
