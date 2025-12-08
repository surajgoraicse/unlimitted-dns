"use client";

import Container from "@/components/container";
import { ClickableCard } from "@/components/project-card";
import { SelectSubDomain } from "@/db/schema/sub-domain";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreateProjectDialog } from "../../components/form/create-project-dialog";

async function fetchProjects() {
	const res = await fetch("/api/v1/subdomain");
	const data = await res.json();
	return data.data || [];
}

async function deleteProject(id: string) {
	const res = await fetch(`/api/v1/subdomain/${id}`, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
	});
	const data = await res.json();
	toast(data.message);
}

const Page = () => {
	const [projects, setProjects] = useState<SelectSubDomain[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		setIsLoading(true);
		(async function fetchApi() {
			const data = await fetchProjects();
			setProjects(data);
			console.log("projects ", projects);
			setIsLoading(false);
		})();
	}, []);

	if (isLoading) {
		return <div>loading...</div>;
	}

	return (
		<Container>
			<div>
				{/* Create Project Dialog */}
				<CreateProjectDialog />
			</div>

			<ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{projects.map((project) => (
					<ClickableCard
						key={project.id}
						title={project.projectName}
						description={project.comment || undefined}
						status={project.status!}
						href={`/dashboard/${project.id}`}
						onEdit={() => console.log("Edit")}
						onDelete={() => deleteProject(project.id)}
						onRefresh={() => console.log("Refresh")}
					/>
				))}
			</ul>
		</Container>
	);
};

export default Page;
