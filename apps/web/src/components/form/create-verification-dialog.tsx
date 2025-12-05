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
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { PLATFORM } from "@/types/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Spinner } from "../ui/spinner";

async function handleSubmit(
	data: ProjectFormData,
	setOpen: Dispatch<SetStateAction<boolean>>,
	setIsSubmitting: Dispatch<SetStateAction<boolean>>
) {
	setIsSubmitting(true);
	const res = await fetch("/api/v1/verification-record", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			subDomainId: data.projectId,
			platform: data.platform,
			content: data.content,
		}),
	});
	const apiData = await res.json();
	if (apiData.statusCode != 201) {
		toast.error(apiData.message);
		console.log(apiData);
	} else {
		toast.success("Project Created Successfully");
		console.log(`success : ${JSON.stringify(apiData)}`);
		setOpen(false);
	}
	setIsSubmitting(false);
}
const formSchema = z.object({
	content: z.string().trim(),
	projectId: z.uuid(),
	platform: z.enum(PLATFORM),
});
type ProjectFormData = z.infer<typeof formSchema>;

export function CreateVerificationDialog({ projectId }: { projectId: string }) {
	const [open, setOpen] = useState<boolean>(false);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	const form = useForm<ProjectFormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			platform: "VERCEL",
			content: "",
			projectId: projectId,
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">Add Verification Record</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<form
					onSubmit={form.handleSubmit((data) => {
						handleSubmit(data, setOpen, setIsSubmitting);
						form.reset();
					})}
				>
					<DialogHeader className="mb-4">
						<DialogTitle>Verification Record</DialogTitle>
						<DialogDescription>
							Add Your Platfrom Verification Record.
						</DialogDescription>
					</DialogHeader>
					<div className=" flex flex-col gap-2 mb-2  ">
						<div className="grid gap-3">
							<Controller
								name="platform"
								control={form.control}
								render={({ field }) => (
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
									>
										<SelectTrigger>
											<SelectValue placeholder="Platform" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="VERCEL">
												Vercel
											</SelectItem>
										</SelectContent>
									</Select>
								)}
							/>
						</div>

						<div className="grid gap-3 w-full">
							<Input
								className=""
								placeholder="Target Value"
								type="text"
								id="name-1"
								{...form.register("content")}
							/>
							<p className="text-red-500">
								{form.formState.errors.content && (
									<p className="text-red-500">
										{form.formState.errors.content.message}
									</p>
								)}
							</p>
						</div>
					</div>
					<DialogFooter>
						<DialogClose asChild>
							<Button variant="outline">Cancel</Button>
						</DialogClose>
						<Button
							disabled={form.formState.isSubmitting}
							type="submit"
						>
							{form.formState.isSubmitting || isSubmitting ? (
								<span className="flex items-center justify-center gap-2">
									<Spinner /> Submitting...
								</span>
							) : (
								"Submit"
							)}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
