import Cloudflare from "cloudflare";

export const cloudflareClient = new Cloudflare({
	apiToken: process.env.CLOUDFLARE_TOKEN!,
});
const client = cloudflareClient;

interface ICloudflareService {
	createCFRecord(): Promise<Cloudflare.DNS.Records.RecordResponse>;
	updateCFRecord(): Promise<Cloudflare.DNS.Records.RecordResponse>;
	listAllCFRecords(): Promise<Cloudflare.DNS.Records.RecordResponse>;
	deleteCFRecord(): Promise<Cloudflare.DNS.Records.RecordDeleteResponse>;
}

// class CloudflareService implements ICloudflareService {

// }

export async function createCloudflareRecord() {
	const recordResponse = await cloudflareClient.dns.records.create({
		zone_id: "023e105f4ecef8ad9ca31a8372d0c353",
		name: "example.com",
		ttl: 3600,
		type: "A",
	});
	return recordResponse;
}

async function temp() {
	return await client.dns.records.delete("023e105f4ecef8ad9ca31a8372d0c353", {
		zone_id: "023e105f4ecef8ad9ca31a8372d0c353",
	});
}
