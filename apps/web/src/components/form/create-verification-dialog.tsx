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
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

async function handleSubmit(
	data: ProjectFormData,
	setOpen: Dispatch<SetStateAction<boolean>>
) {
	const res = await fetch("/api/v1/subdomain", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			projectName: data.projectName,
			comment: data.comment,
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
}
const formSchema = z.object({
	comment: z.string().trim(),
	projectName: z.string().trim().min(2),
});
type ProjectFormData = z.infer<typeof formSchema>;

export function CreateVerificationDialog() {
	const [open, setOpen] = useState(false);

	const form = useForm<ProjectFormData>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			comment: "",
			projectName: "",
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">Create Project</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<form
					onSubmit={form.handleSubmit((data) => {
						handleSubmit(data, setOpen);
					})}
				>
					<DialogHeader>
						<DialogTitle>Project</DialogTitle>
						<DialogDescription>
							Create a project for your subdomain.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4">
						<div className="grid gap-3">
							<Label htmlFor="name-1">Name</Label>
							<Input
								type="text"
								id="name-1"
								{...form.register("projectName")}
							/>
							<p className="text-red-500">
								{form.formState.errors.projectName && (
									<p className="text-red-500">
										{
											form.formState.errors.projectName
												.message
										}
									</p>
								)}
							</p>
						</div>
						<div className="grid gap-3">
							<Label htmlFor="comment">Comment</Label>
							<Input
								id="comment"
								type="text"
								{...form.register("comment")}
							/>
							{form.formState.errors.comment && (
								<p className="text-red-500">
									{form.formState.errors.comment.message}
								</p>
							)}
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
							Save changes
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
