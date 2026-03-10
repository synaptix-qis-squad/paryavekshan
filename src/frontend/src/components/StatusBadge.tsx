import { cn } from "@/lib/utils";

type Severity = "low" | "medium" | "high" | "critical" | "normal" | "warning";

const SEVERITY_STYLES: Record<Severity, string> = {
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  normal:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  warning:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
};

export function StatusBadge({
  severity,
  label,
  className,
}: {
  severity: Severity;
  label?: string;
  className?: string;
}) {
  const displayLabel =
    label || severity.charAt(0).toUpperCase() + severity.slice(1);
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold",
        SEVERITY_STYLES[severity],
        className,
      )}
    >
      {displayLabel}
    </span>
  );
}

export function AlertTypeIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    posture_fall: "🤸",
    saline_critical: "🚨",
    saline_low: "💧",
    hand_gesture: "✋",
    unknown_person: "👁",
    emergency_button: "🆘",
  };
  return <span className="text-base">{icons[type] || "⚠️"}</span>;
}

export function AlertTypeLabel({ type }: { type: string }) {
  const labels: Record<string, string> = {
    posture_fall: "Fall Detected",
    saline_critical: "Saline Critical",
    saline_low: "Saline Low",
    hand_gesture: "Hand Gesture Alert",
    unknown_person: "Unknown Person",
    emergency_button: "Emergency Button",
  };
  return <span>{labels[type] || type}</span>;
}
