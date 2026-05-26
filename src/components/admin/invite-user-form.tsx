"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InviteUserFormProps {
  /** The role of the person doing the inviting — controls which roles they can assign */
  callerRole: string;
}

const ROLES = [
  { value: "admin", label: "Admin", description: "Full platform access", minCaller: "admin" },
  { value: "instructor", label: "Instructor", description: "Content management + moderation", minCaller: "admin" },
  { value: "member", label: "Member", description: "Full content access", minCaller: "instructor" },
  { value: "trial", label: "Trial", description: "Limited beginner content", minCaller: "instructor" },
];

export function InviteUserForm({ callerRole }: InviteUserFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("member");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter roles based on caller's permissions
  const availableRoles = ROLES.filter((r) => {
    if (callerRole === "admin") return true;
    return r.minCaller === "instructor";
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const res = await fetch("/api/admin/invite-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullName, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to invite user");
      }

      setSuccess(`Invitation sent to ${email}`);
      setEmail("");
      setFullName("");
      setRole("member");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to invite user");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="invite-email">Email</Label>
          <Input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="invite-name">Name (optional)</Label>
          <Input
            id="invite-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Role</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {availableRoles.map((r) => (
            <label
              key={r.value}
              className={`flex items-start gap-3 rounded-md border p-3 cursor-pointer transition-colors ${
                role === r.value ? "border-primary bg-accent" : "hover:bg-muted/50"
              }`}
            >
              <input
                type="radio"
                name="invite-role"
                value={r.value}
                checked={role === r.value}
                onChange={(e) => setRole(e.target.value)}
                className="mt-0.5"
              />
              <div>
                <span className="text-sm font-medium">{r.label}</span>
                <p className="text-xs text-muted-foreground">{r.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">{error}</p>
      )}
      {success && (
        <p className="text-sm text-green-700">{success}</p>
      )}

      <Button type="submit" disabled={saving}>
        {saving ? "Sending invite..." : "Send Invitation"}
      </Button>
    </form>
  );
}
