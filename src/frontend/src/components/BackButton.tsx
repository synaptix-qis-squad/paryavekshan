import { useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  className?: string;
  /** Use "fixed" for standalone pages (no sidebar). Use "inline" for pages inside AppShell. */
  variant?: "fixed" | "inline";
}

/**
 * A back button that navigates to the previous browser history entry.
 * - "fixed" variant: positioned fixed top-left, ideal for full-screen standalone pages.
 * - "inline" variant: rendered inline at the top of page content, ideal for AppShell pages.
 */
export function BackButton({ className, variant = "fixed" }: BackButtonProps) {
  const router = useRouter();

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={() => router.history.back()}
        data-ocid="nav.back_button"
        aria-label="Go back"
        className={`inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 group ${className ?? ""}`}
      >
        <span className="flex items-center justify-center w-7 h-7 rounded-full border border-border bg-card group-hover:bg-muted group-hover:border-border/80 transition-all duration-150">
          <ArrowLeft size={14} strokeWidth={2.5} />
        </span>
        <span className="font-medium">Back</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => router.history.back()}
      data-ocid="nav.back_button"
      aria-label="Go back"
      className={`fixed top-4 left-4 z-50 flex items-center justify-center w-9 h-9 rounded-full bg-card/90 backdrop-blur-sm border border-border shadow-sm text-muted-foreground hover:text-foreground hover:bg-card hover:shadow-md transition-all duration-150 ${className ?? ""}`}
    >
      <ArrowLeft size={16} strokeWidth={2.5} />
    </button>
  );
}
