import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Login — XYQ Full Combat",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Member Login
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Access your training materials and community.
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground">
          New student?{" "}
          <Link
            href="/register"
            className="text-foreground underline underline-offset-4"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
