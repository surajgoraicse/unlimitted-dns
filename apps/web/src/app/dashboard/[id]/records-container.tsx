"use client";
import { CreateRecordForm } from "@/components/form/create-edit-record-dialog";
import { RecordTable } from "@/components/record-table";
import { SelectRecord } from "@/db/schema";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// fetch all records of a project
async function fetchProjectRecords(projectId: string) {
	const res = await (
		await fetch(`/api/v1/subdomain/record/${projectId}`)
	).json();
	if (res.statusCode != 200) {
		toast.error(res.message);
		return [];
	}
	return res.data;
}

// create a record
async function refreshRecord() {
	console.log("create record");
}

const RecordsContainer = ({ id }: { id: string }) => {
	const [loading, setIsLoading] = useState<boolean>(false);
	const [records, setRecords] = useState<SelectRecord[]>([]);

	// create a record
	async function createRecord(data: CreateRecordForm) {
		console.log(JSON.stringify(data));
		const res = await fetch("/api/v1/record", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				subDomainId: id,
				name: data.name,
				type: data.type,
				content: data.content,
				ttl: data.ttl,
				proxied: data.proxied,
				comment: data.comment,
			}),
		});
		const apiData = await res.json();
		console.log(` create apiData : ${JSON.stringify(apiData)}}`);
		if (apiData.statusCode != 201) {
			toast.error(apiData.message);
		} else {
			toast.success("Record Created Successfully");
		}
	}

	// delete a record
	async function deleteRecord(recordId: string) {
		const res = await fetch(`/api/v1/record/${recordId}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
		});
		const data = await res.json();
		console.log(data);
		if (data.statusCode != 200) {
			toast.error(data.message);
			return;
		}
		toast.success(data.message);
	}

	// edit a Record
	async function editRecord(data: CreateRecordForm, recordId: string) {
		const res = await fetch(`/api/v1/record/${recordId}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				subDomainId: data.providerRecordId,
				name: data.name,
				type: data.type,
				content: data.content,
				ttl: data.ttl,
				proxied: data.proxied,
				comment: data.comment,
			}),
		});
		const apiData = await res.json();
		console.log(`edit apiData : ${JSON.stringify(apiData)}}`);
		if (apiData.statusCode != 200) {
			toast.error(apiData.message);
		} else {
			toast.success("Record Edited Successfully");
		}
	}

	async function handleRefreshRecord() {
		setIsLoading(true);
		const data = await fetchProjectRecords(id);
		setRecords(data);
		setIsLoading(false);
	}

	useEffect(() => {
		handleRefreshRecord();
	}, []);

	useEffect(() => {
		(async function fetchData() {
			setIsLoading(true);
			const data = await fetchProjectRecords(id);
			console.log(data);
			setRecords(data);
			setIsLoading(false);
		})();
	}, []);

	if (loading) {
		return <div>Loading...</div>;
	}
	return (
		<div>
			<RecordTable
				projectId={id}
				records={records}
				deleteRecord={deleteRecord}
				refreshRecord={refreshRecord}
				editRecord={editRecord}
				createRecord={createRecord}
			/>
		</div>
	);
};

export default RecordsContainer;
