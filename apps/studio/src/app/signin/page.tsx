import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function SignIn() {
	const defaultView = "sign-in";
	return redirect(`/signin/${defaultView}`);
}
