import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const session = await auth.api.getSession({
	headers: await headers(), // you need to pass the headers object.
});
console.log(JSON.stringify(session));

const page = () => {
	return <div>{JSON.stringify(session)}</div>;
};

export default page;
