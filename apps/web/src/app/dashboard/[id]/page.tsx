// "use client";
// import Container from "@/components/container";
// import { SelectRecord } from "@/db/schema/record";
// import { use, useEffect, useState } from "react";
// import { CreateRecordDialog } from "../../../components/create-record-dialog";

// async function fetchProjects(id: string) {
// 	const res = await fetch("/api/v1/subdomain/record/" + id);
// 	const data = await res.json();
// 	console.log(data);
// 	return data.data || [];
// }

// const Page = ({ params }: { params: Promise<{ id: string }> }) => {
// 	const { id } = use(params);
// 	const [records, setRecords] = useState<SelectRecord[]>([]);
// 	const [isLoading, setIsLoading] = useState<boolean>(false);

// 	useEffect(() => {
// 		setIsLoading(true);
// 		(async function fetchApi() {
// 			const data = await fetchProjects(id);
// 			setRecords(data);
// 			console.log("records ", records);
// 			setIsLoading(false);
// 		})();
// 	}, []);

// 	if (isLoading) {
// 		return <div>loading...</div>;
// 	}
// 	return (
// 		<Container>
// 			<CreateRecordDialog />
// 			{records.map((record) => (
// 				<li key={record.id}>{JSON.stringify(record)}</li>
// 			))}
// 		</Container>
// 	);
// };

// export default Page;
"use client";

import Container from "@/components/container";
import { CreateRecordDialog } from "@/components/form/create-record-dialog";
import { CreateVerificationDialog } from "@/components/form/create-verification-dialog";
import { RecordTable } from "@/components/record-table";
import { SelectRecord } from "@/db/schema";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";

// fetch all records of a project
async function fetchProjectRecords(projectId: string) {
	const res = await (
		await fetch(`/api/v1/subdomain/record/${projectId}`)
	).json();
	console.log(`fetch project records : ${JSON.stringify(res)}`);
	if (res.statusCode != 200) {
		toast.error(res.message);
		return [];
	}
	return res.data;
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

// update a record
async function updateRecord() {
	console.log("update record");
}
// create a record
async function refreshRecord() {
	console.log("create record");
}

const Page = ({ params }: { params: Promise<{ id: string }> }) => {
	const { id } = use(params);
	const [loading, setIsLoading] = useState<boolean>(false);
	const [records, setRecords] = useState<SelectRecord[]>([]);

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
		<Container>
			<div className="flex flex-row-reverse gap-2">
				<CreateRecordDialog projectId={id} />
				<CreateVerificationDialog projectId={id} />
			</div>
			<RecordTable
				projectId={id}
				records={records}
				deleteRecord={deleteRecord}
				updateRecord={updateRecord}
				refreshRecord={refreshRecord}
			/>
		</Container>
	);
};

export default Page;
