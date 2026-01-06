"use client";

import { Dialog } from "@/ui/dialog";

interface CoachDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function CoachDialog({ open, onOpenChange, children }: CoachDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  );
}
