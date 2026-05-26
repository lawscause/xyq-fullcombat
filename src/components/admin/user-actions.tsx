"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface UserActionsProps {
  userId: string;
  isDisabled: boolean;
  canDelete: boolean;
}

export function UserActions({ userId, isDisabled, canDelete }: UserActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleAction(action: "disable" | "enable" | "delete") {
    setError(null);
    setLoading(action);

    try {
      const res = await fetch("/api/admin/manage-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Failed to ${action} user`);
      }

      if (action === "delete") {
        router.push("/admin/users");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} user`);
    } finally {
      setLoading(null);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Disable / Enable */}
      <div>
        {isDisabled ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              This user is currently disabled and cannot log in.
            </p>
            <Button
              variant="outline"
              onClick={() => handleAction("enable")}
              disabled={loading !== null}
            >
              {loading === "enable" ? "Enabling..." : "Re-enable Account"}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Disabling prevents the user from logging in. Their data is preserved.
            </p>
            <Button
              variant="outline"
              onClick={() => handleAction("disable")}
              disabled={loading !== null}
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              {loading === "disable" ? "Disabling..." : "Disable Account"}
            </Button>
          </div>
        )}
      </div>

      {/* Delete — only for users who never confirmed */}
      {canDelete && (
        <div className="border-t pt-4">
          {confirmDelete ? (
            <div className="space-y-2">
              <p className="text-sm text-destructive font-medium">
                Are you sure? This permanently removes the user and cannot be undone.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleAction("delete")}
                  disabled={loading !== null}
                >
                  {loading === "delete" ? "Deleting..." : "Yes, Delete"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDelete(false)}
                  disabled={loading !== null}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                This user has never confirmed their email or logged in.
                You can permanently delete their account.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                Delete Account
              </Button>
            </div>
          )}
        </div>
      )}

      {!canDelete && (
        <div className="border-t pt-4">
          <p className="text-xs text-muted-foreground">
            This user has confirmed their email or logged in. They can be disabled but not deleted.
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">{error}</p>
      )}
    </div>
  );
}
