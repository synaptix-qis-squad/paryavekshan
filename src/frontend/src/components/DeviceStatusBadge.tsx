import { cn } from "@/lib/utils";
import type { Device } from "../context/AppContext";

type DeviceStatus = Device["status"] | "none";

const STATUS_CONFIG: Record<
  DeviceStatus,
  { dot: string; text: string; badge: string }
> = {
  active: {
    dot: "bg-green-500",
    text: "Device Active",
    badge:
      "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800/50",
  },
  inactive: {
    dot: "bg-red-500",
    text: "Device Inactive",
    badge:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/50",
  },
  pending: {
    dot: "bg-yellow-500",
    text: "Device Pending",
    badge:
      "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800/50",
  },
  none: {
    dot: "bg-gray-400",
    text: "No Device",
    badge:
      "bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-900/30 dark:text-gray-500 dark:border-gray-700",
  },
};

interface DeviceStatusBadgeProps {
  device?: Device | null;
  /** When 'compact', shows only the dot + text inline (for patient cards). */
  variant?: "compact" | "full";
  className?: string;
}

export function DeviceStatusBadge({
  device,
  variant = "compact",
  className,
}: DeviceStatusBadgeProps) {
  const status: DeviceStatus = device ? device.status : "none";
  const config = STATUS_CONFIG[status];

  if (variant === "compact") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
          config.badge,
          className,
        )}
      >
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full shrink-0",
            config.dot,
            status === "active" && "animate-pulse",
          )}
        />
        {config.text}
      </span>
    );
  }

  // Full variant — shows serial + model as well
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-xl border",
        config.badge,
        className,
      )}
    >
      <span
        className={cn(
          "mt-1 w-2 h-2 rounded-full shrink-0",
          config.dot,
          status === "active" && "animate-pulse",
        )}
      />
      <div className="min-w-0">
        <p className="text-xs font-semibold">{config.text}</p>
        {device ? (
          <p className="text-[10px] opacity-70 mt-0.5 truncate">
            {device.serialNumber} · {device.model}
          </p>
        ) : (
          <p className="text-[10px] opacity-70 mt-0.5">No device registered</p>
        )}
      </div>
    </div>
  );
}
