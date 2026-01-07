import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContextMenuButtonProps {
  icon: LucideIcon;
  children: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive";
}

export function ContextMenuButton({ icon: Icon, children, onClick, variant = "default" }: ContextMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition-colors",
        variant === "destructive" ? "text-red-600 hover:bg-red-50" : "text-gray-900 hover:bg-gray-100",
      )}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}
