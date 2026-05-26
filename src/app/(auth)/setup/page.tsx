import type { Metadata } from "next";
import { SetPasswordForm } from "@/components/auth/set-password-form";

export const metadata: Metadata = {
  title: "Set Your Password — XYQ Full Combat",
};

export default function SetupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome to the Community
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Set a password for your account so you can sign in anytime.
          </p>
        </div>
        <SetPasswordForm />
      </div>
    </div>
  );
}
