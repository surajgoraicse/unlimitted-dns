"use client";
import { authClient } from "@/lib/auth-client";

const Dashboard = () => {
	const {
		data: session,
		isPending, //loading state
		error, //error object
		refetch, //refetch the session
	} = authClient.useSession();

	return isPending ? (
		<div>Dashboard</div>
	) : (
		<div>{JSON.stringify(session)}</div>
	);
};

export default Dashboard;
