import { redirect } from "next/navigation";

export default function SignupRedirectPage() {
  // Employees sign up with Google on the employee login page — first-time
  // OAuth completes account creation automatically. Admins use /signup/admin.
  redirect("/login/employee");
}
