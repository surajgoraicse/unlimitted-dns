import {
	handleGithubSignIn,
	handleGoogleSignIn,
	signOut,
} from "@/lib/auth-client";
import { Button } from "./ui/button";

const SignInForm = () => {
	return (
		<div>
			<Button onClick={handleGithubSignIn}>Github</Button>
			<Button onClick={handleGoogleSignIn}>Google</Button>
			<Button onClick={signOut}>Logout</Button>
		</div>
	);
};

export default SignInForm;


