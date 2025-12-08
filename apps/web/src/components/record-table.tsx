"use client";
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { InsertRecordSchema, SelectRecord } from "@/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Settings } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import ActionMenu from "./ActionMenu";
import { CreateEditRecordDialog } from "./form/create-edit-record-dialog";
import { Button } from "./ui/button";

const CreateRecordFormSchema = InsertRecordSchema.omit({
	id: true,
	createdAt: true,
	providerRecordId: true,
	updatedAt: true,
	version: true,
});
type CreateRecordForm = z.infer<typeof CreateRecordFormSchema>;


interface IRecordTable {
	projectId: string;
	records: SelectRecord[];
	deleteRecord: (recordId: string) => Promise<void>;
	refreshRecord: () => Promise<void>;
	createRecord: (data: CreateRecordForm) => Promise<void>;
	editRecord: (data: CreateRecordForm, recordId: string) => Promise<void>;
	className?: string;
}

export function RecordTable({
	projectId,
	records,
	refreshRecord,
	deleteRecord,
	createRecord,
	editRecord,
	className,
}: IRecordTable) {
	const [selectedRecord, setSelectedRecord] = useState<SelectRecord | null>(null);
	const [mode, setMode] = useState<"create" | "edit" | null>(null);


	function onClose() {
		setMode(null);
		setSelectedRecord(null);
	}

	function openEdit(record: SelectRecord) {
		setMode("edit");
		setSelectedRecord(record);
	}

	const openCreate = () => {
		setMode("create");
		setSelectedRecord(null);
	};

	return (
		<div className={`${className}`}>
			<div className="flex flex-row-reverse gap-2">
				<Button onClick={openCreate}>Create Record</Button>
			</div>
			<Table className="">
				<TableCaption>A list of your Records.</TableCaption>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[100px]">Type</TableHead>
						<TableHead>Name</TableHead>

						<TableHead>Target</TableHead>

						<TableHead className="text-center">TTL</TableHead>
						<TableHead className="text-center">Proxied</TableHead>

						<TableHead className=" w-[50px]">
							<Settings className=" mx-auto h-4 w-4" />
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{records.map((record) => (
						<TableRow key={record.id}>
							<TableCell className="font-medium">
								{record.type}
							</TableCell>
							<TableCell>{record.name}</TableCell>

							{/* Optional: Add 'truncate max-w-[200px]' if Target URLs get too long */}
							<TableCell
								className="truncate max-w-[300px]"
								title={record.content}
							>
								{record.content}
							</TableCell>

							{/* 5. ...So Body cells MUST also be text-right to match */}
							<TableCell className="text-center">
								{(record.ttl / 60).toFixed(0) + " min"}
							</TableCell>
							<TableCell className="text-center">
								{record.proxied ? "Yes" : "No"}
							</TableCell>

							{/* 6. Align the Edit action to the right */}
							<TableCell>
								<ActionMenu
									onRefresh={refreshRecord}
									onEdit={() => {
										openEdit(record);
									}}
									onDelete={() => {
										deleteRecord(record.id);
									}}
									className="text-center border rounded-md"
								/>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
			<CreateEditRecordDialog
				mode={mode}
				selectedRecord={selectedRecord || null}
				onCreate={createRecord}
				onEdit={editRecord}
				projectId={projectId}
				onClose={onClose}
			/>
		</div>
	);
}
