import { createAuthClient } from "better-auth/react";
import { redirect } from "next/navigation";
import { toast } from "sonner";
export const authClient = createAuthClient({
	/** The base URL of the server (optional if you're using the same domain) */
	baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
});

export const { signIn, signUp, useSession } = authClient;

// signout user
export const signOut = async () => {
	await authClient.signOut({
		fetchOptions: {
			onSuccess: () => {
				console.log("signout user successfully");
				toast.success("Signed out successfully");
				redirect("/signin");
			},
		},
	});
};

// signin user :
export const handleGoogleSignIn = async () => {
	try {
		await authClient.signIn.social(
			{
				provider: "google",
				callbackURL: "/",
				errorCallbackURL: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/error`,
				newUserCallbackURL: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/welcome`,
			},
			{
				onSuccess: () => {
					console.log("signout user successfully");
					toast.success("Logged In Successfully");
				},
			}
		);
	} catch (error: any) {
		// toast.error(error?.message || "Failed to start Google sign-in");
		console.log("failed to start google sign in");
	}
};

export const handleGithubSignIn = async () => {
	const { error } = await authClient.signIn.social(
		{
			provider: "github",
			callbackURL: "/",
			errorCallbackURL: "/auth/error",
		},
		{
			onSuccess: () => {
				console.log("signout user successfully");
				toast.success("Logged In Successfully");
			},
		}
	);
	if (error) {
		// toast.error(error.code);
		console.log("error sign in ", error);
		return;
	} else {
		// wait for 2 sec
		new Promise((resolve) => {
			setTimeout(resolve, 2000);
		});
		// toast.success("Signed in successfully");
		console.log("signed in successfully");
	}
};
