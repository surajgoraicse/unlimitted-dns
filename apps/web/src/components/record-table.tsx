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
import { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import ActionMenu from "./ActionMenu";
import { CreateRecordDialog } from "./form/create-record-dialog";

const CreateRecordFormSchema = InsertRecordSchema.omit({
	id: true,
	createdAt: true,
	providerRecordId: true,
	updatedAt: true,
	version: true,
});
type CreateRecordForm = z.infer<typeof CreateRecordFormSchema>;

function handleCreateRecord(
	data: CreateRecordForm,
	setOpen: Dispatch<SetStateAction<boolean>>
) {
	console.log(JSON.stringify(data));
	setOpen(false);
}

interface IRecordTable {
	projectId: string;
	records: SelectRecord[];
	updateRecord: () => Promise<void>;
	deleteRecord: (recordId: string) => Promise<void>;
	refreshRecord: () => Promise<void>;
}

export function RecordTable({
	projectId,
	records,
	refreshRecord,
	updateRecord,
	deleteRecord,
}: IRecordTable) {
	const form = useForm({
		resolver: zodResolver(CreateRecordFormSchema),
		defaultValues: {
			subDomainId: projectId,
			proxied: true,
		},
	});

	return (
		<div className="mt-10">
			<div className="text-right">
				<CreateRecordDialog projectId={projectId} />
			</div>
			<Table className="mt-5 ">
				<TableCaption>A list of your Records.</TableCaption>
				<TableHeader>
					<TableRow>
						{/* 1. Give small columns a fixed width so they don't shift */}
						<TableHead className="w-[100px]">Type</TableHead>
						<TableHead>Name</TableHead>

						{/* 2. Allow Target to take available space, optionally max-width if needed */}
						<TableHead>Target</TableHead>

						{/* 3. Headers are text-right... */}
						<TableHead className="text-center">TTL</TableHead>
						<TableHead className="text-center">Proxied</TableHead>

						{/* 4. Settings Icon */}
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
									onEdit={updateRecord}
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
		</div>
	);
}
