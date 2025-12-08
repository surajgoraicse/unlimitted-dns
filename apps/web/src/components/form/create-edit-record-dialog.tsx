"use client";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { InsertRecordSchema, SelectRecord } from "@/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

export const CreateRecordFormSchema = InsertRecordSchema.omit({
	id: true,
	createdAt: true,
	updatedAt: true,
	version: true,
});
export type CreateRecordForm = z.infer<typeof CreateRecordFormSchema>;

interface CreateEditRecordDialogProps {
	projectId: string;
	className?: string;
	mode: "create" | "edit" | null;
	selectedRecord: SelectRecord | null;
	onCreate: (data: CreateRecordForm) => Promise<void>;
	onEdit: (data: CreateRecordForm, recordId: string) => Promise<void>;
	onClose: () => void;
}

export function CreateEditRecordDialog({
	projectId,
	className,
	mode,
	selectedRecord,
	onCreate,
	onEdit,
	onClose,
}: CreateEditRecordDialogProps) {
	const open = mode != null;

	const form = useForm<CreateRecordForm>({
		resolver: zodResolver(CreateRecordFormSchema),
		defaultValues: {
			subDomainId: projectId,
			proxied: true,
			ttl: 300,
		},
	});

	useEffect(() => {
		if (mode === "edit" && selectedRecord) {
			form.reset({
				subDomainId: projectId,
				name: selectedRecord.name,
				type: selectedRecord.type,
				content: selectedRecord.content,
				ttl: selectedRecord.ttl,
				proxied: selectedRecord.proxied,
				comment: selectedRecord.comment,
			});
		} else {
			form.reset({
				subDomainId: projectId,
				proxied: true,
				ttl: 300,
			});
		}
	}, [mode, selectedRecord, projectId, form]);

	return (
		<div className={` ${className}`}>
			<Dialog open={open} onOpenChange={onClose}>
				<DialogContent className="sm:max-w-[425px]">
					<form
						onSubmit={form.handleSubmit(
							async (data) => {
								try {
									if (mode === "edit" && selectedRecord) {
										await onEdit(data, selectedRecord.id);
									} else if (mode === "create") {
										await onCreate(data);
									}

									form.reset();
									onClose();
								} catch (err) {
									console.error("Submit error:", err);
								}
							},
							(errors) => {
								console.log("Form validation errors:", errors);
							}
						)}
					>
						<DialogHeader>
							<DialogTitle>
								{mode == "edit"
									? "Edit Record"
									: "Create Record"}
							</DialogTitle>
							<DialogDescription>
								{mode == "edit"
									? "Edit a record for your subdomain."
									: "Create a record for your subdomain."}
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4">
							<div className="grid gap-3">
								<Controller
									name="type"
									control={form.control}
									render={({ field }) => (
										<Select
											defaultValue={field.value}
											onValueChange={field.onChange}
											name="type"
										>
											<SelectTrigger className="">
												<SelectValue placeholder="Type" />
											</SelectTrigger>
											<SelectContent>
												<SelectGroup>
													<SelectLabel>
														Record Type
													</SelectLabel>
													<SelectItem value="CNAME">
														CNAME
													</SelectItem>
													<SelectItem value="A">
														A
													</SelectItem>
													<SelectItem value="AAAA">
														AAAA
													</SelectItem>
													<SelectItem value="TXT">
														TXT
													</SelectItem>
												</SelectGroup>
											</SelectContent>
										</Select>
									)}
								/>
								{form.formState.errors.type && (
									<p className="text-red-500">
										{form.formState.errors.type.message}
									</p>
								)}
							</div>

							<div className="grid gap-3">
								<Input
									{...form.register("name")}
									placeholder="Subdomain Name"
								/>
								{form.formState.errors.name && (
									<p className="text-red-500">
										{form.formState.errors.name.message}
									</p>
								)}
							</div>
							<div className="grid gap-3">
								<Input
									{...form.register("content")}
									placeholder="Target Value"
								/>
								{form.formState.errors.content && (
									<p className="text-red-500">
										{form.formState.errors.content.message}
									</p>
								)}
							</div>
							<div className="flex gap-4 items-center">
								<div className="grid gap-3">
									<Controller
										name="ttl"
										control={form.control}
										render={({ field }) => (
											<Select
												value={String(
													field.value ?? 300
												)}
												onValueChange={(val) =>
													field.onChange(
														val == null
															? undefined
															: Number(val)
													)
												}
												name="ttl"
											>
												<SelectTrigger className="">
													<SelectValue placeholder="TTL" />
												</SelectTrigger>
												<SelectContent>
													<SelectGroup>
														<SelectLabel>
															TTL
														</SelectLabel>

														<SelectItem value="60">
															1 min
														</SelectItem>
														<SelectItem value="120">
															2 min
														</SelectItem>
														<SelectItem value="300">
															5 min
														</SelectItem>
														<SelectItem value="600">
															10 min
														</SelectItem>
														<SelectItem value="900">
															15 min
														</SelectItem>
														<SelectItem value="1800">
															30 min
														</SelectItem>
														<SelectItem value="3600">
															1 hr
														</SelectItem>
													</SelectGroup>
												</SelectContent>
											</Select>
										)}
									/>
									{form.formState.errors.ttl && (
										<p className="text-red-500">
											{form.formState.errors.ttl.message}
										</p>
									)}
								</div>
								<div className="flex items-center gap-4">
									<Label htmlFor="proxied">
										Cloudflare Proxy
									</Label>
									<Controller
										name="proxied"
										control={form.control}
										render={({ field }) => (
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
												onBlur={field.onBlur}
												className="scale-150"
											/>
										)}
									/>
								</div>
							</div>

							<div className="grid gap-3">
								<Input
									{...form.register("comment")}
									placeholder="COMMENT"
								/>
							</div>
						</div>
						<DialogFooter className="mt-5">
							<DialogClose asChild>
								<Button variant="outline">Cancel</Button>
							</DialogClose>
							<Button
								disabled={form.formState.isSubmitting}
								type="submit"
							>
								{form.formState.isSubmitting
									? "Submitting..."
									: "Submit"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
