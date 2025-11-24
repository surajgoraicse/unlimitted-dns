import { auth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";

console.log("running the social auth dynamic route 🥂");

export const { POST, GET } = toNextJsHandler(auth);
