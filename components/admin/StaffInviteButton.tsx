// UI: Button that shows a toast simulating a staff invite email.

"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function StaffInviteButton() {
  return (
    <Button
      type="button"
      onClick={() => toast.success("Invite email queued (demo)")}
    >
      Invite staff
    </Button>
  );
}
