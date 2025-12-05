import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import Container from "./container";
import { LoginButtons, LogOut } from "./handle-auth-button";
import { AnimatedThemeToggler } from "./ui/animated-theme-toggler";
import { Button } from "./ui/button";

const Navbar = async () => {
	const session = await auth.api.getSession({
		headers: await headers(), // you need to pass the headers object.
	});

	return (
		<Container className="flex justify-between py-3">
			<Link href={"/"} className="font-bold">
				Coderz
			</Link>
			<div className="flex gap-2">
				<Link href={"/project"}>
					<Button variant={"outline"}>Projects</Button>
				</Link>
				<Link className="lowercase" href={"/about"}>
					<Button variant={"outline"}>About</Button>
				</Link>
			</div>
			<div className="flex items-center gap-5">
				{!session ? <LoginButtons /> : <LogOut />}
				<span className="flex items-center justify-center border p-1 rounded-full">
					<AnimatedThemeToggler />
				</span>
			</div>
		</Container>
	);
};

export default Navbar;
