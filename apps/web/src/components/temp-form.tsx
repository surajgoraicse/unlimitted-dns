"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const FormSchema = z.object({
	message: z.string().trim(),
	name: z.string().trim(),
});
type FormData = z.infer<typeof FormSchema>;

function handleSubmit(data: FormData) {
	console.log("data : ", JSON.stringify(data));
}

const TempForm = () => {
	const form = useForm({
		resolver: zodResolver(FormSchema),
	});

	return (
		<div className="max-w-lg">
			<form onSubmit={form.handleSubmit(handleSubmit)}>
				<div>
					<Label htmlFor="name">Name</Label>
					<Input type="text" id="name" {...form.register("name")} />
					{form.formState.errors.name && (
						<p className="text-red-500">
							{form.formState.errors.name.message}
						</p>
					)}
				</div>
				<div>
					<Label htmlFor="message">Message</Label>
					<Input
						type="text"
						id="message"
						{...form.register("message")}
					/>
					{form.formState.errors.message && (
						<p className="text-red-500">
							{form.formState.errors.message.message}
						</p>
					)}
				</div>
				<Button type="submit">Submit</Button>
			</form>
		</div>
	);
};

export default TempForm;
