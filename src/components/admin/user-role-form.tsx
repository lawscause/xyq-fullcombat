"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface UserRoleFormProps {
  userId: string;
  currentRole: string;
}

const ALL_ROLES = [
  { value: "admin", label: "Admin", description: "Full access — billing, users, manage instructors, all content", adminOnly: true },
  { value: "instructor", label: "Instructor", description: "Upload content, manage events, moderate students", adminOnly: true },
  { value: "member", label: "Member", description: "Full content access (paid subscription)", adminOnly: false },
  { value: "trial", label: "Trial", description: "Limited beginner content only", adminOnly: false },
];

export function UserRoleForm({ userId, currentRole }: UserRoleFormProps) {
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (role === currentRole) return;

    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      const res = await fetch("/api/admin/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update role");
      }

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Access Level</Label>
        <div className="space-y-2">
          {ALL_ROLES.map((r) => (
            <label
              key={r.value}
              className={`flex items-start gap-3 rounded-md border p-3 cursor-pointer transition-colors ${
                role === r.value ? "border-primary bg-accent" : "hover:bg-muted/50"
              }`}
            >
              <input
                type="radio"
                name="role"
                value={r.value}
                checked={role === r.value}
                onChange={(e) => setRole(e.target.value)}
                className="mt-0.5"
              />
              <div>
                <span className="text-sm font-medium">{r.label}</span>
                {r.adminOnly && (
                  <span className="ml-1.5 text-[10px] text-muted-foreground bg-muted rounded px-1 py-0.5">
                    admin only
                  </span>
                )}
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
        <p className="text-sm text-green-700">Role updated successfully.</p>
      )}

      <Button type="submit" disabled={saving || role === currentRole}>
        {saving ? "Updating..." : "Update Role"}
      </Button>
    </form>
  );
}
