import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertTriangle, Bell, Check, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "../components/AppShell";
import { BackButton } from "../components/BackButton";
import {
  AlertTypeIcon,
  AlertTypeLabel,
  StatusBadge,
} from "../components/StatusBadge";
import { useApp } from "../context/AppContext";
import { formatDateTime, formatDistanceToNow } from "../utils/formatTime";

const FILTER_OPTIONS = [
  { id: "all", label: "All" },
  { id: "unresolved", label: "Unresolved" },
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
  { id: "critical", label: "Critical" },
];

const ALERT_TYPES = [
  "posture_fall",
  "saline_critical",
  "saline_low",
  "hand_gesture",
  "unknown_person",
  "emergency_button",
];

export default function AlertsPage() {
  const { alerts, patients, resolveAlert, addAlert } = useApp();
  const [filter, setFilter] = useState("all");

  // Auto-simulate new alert every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const randomPatient =
        patients[Math.floor(Math.random() * patients.length)];
      const randomType =
        ALERT_TYPES[Math.floor(Math.random() * ALERT_TYPES.length)];
      const severities: ("low" | "medium" | "high" | "critical")[] = [
        "low",
        "medium",
        "high",
        "critical",
      ];
      const severity =
        severities[Math.floor(Math.random() * severities.length)];
      addAlert({
        patientId: randomPatient.id,
        alertType: randomType,
        severity,
        resolved: false,
      });
      toast.warning(`New alert: ${randomType} for ${randomPatient.name}`, {
        duration: 3000,
      });
    }, 30000);
    return () => clearInterval(timer);
  }, [patients, addAlert]);

  const filtered = alerts.filter((a) => {
    if (filter === "unresolved") return !a.resolved;
    if (filter === "all") return true;
    return a.severity === filter;
  });

  const unresolvedCount = alerts.filter((a) => !a.resolved).length;
  const criticalCount = alerts.filter(
    (a) => a.severity === "critical" && !a.resolved,
  ).length;

  const handleSimulate = () => {
    const randomPatient = patients[Math.floor(Math.random() * patients.length)];
    const randomType =
      ALERT_TYPES[Math.floor(Math.random() * ALERT_TYPES.length)];
    const severities: ("low" | "medium" | "high" | "critical")[] = [
      "medium",
      "high",
      "critical",
    ];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    addAlert({
      patientId: randomPatient.id,
      alertType: randomType,
      severity,
      resolved: false,
    });
    toast.warning(`⚠️ Simulated: ${randomType} for ${randomPatient.name}`);
  };

  return (
    <AppShell>
      <div className="p-4 md:p-6">
        <BackButton variant="inline" />
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
              <Bell size={22} />
              Alerts
              {unresolvedCount > 0 && (
                <Badge className="text-xs h-5 min-w-5 bg-destructive text-destructive-foreground">
                  {unresolvedCount}
                </Badge>
              )}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {filtered.length} alerts · {criticalCount} critical unresolved
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={handleSimulate}
          >
            <RefreshCw size={12} className="mr-1" /> Simulate Alert
          </Button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            {
              label: "Total",
              value: alerts.length,
              color: "text-foreground",
              bg: "bg-muted/60",
            },
            {
              label: "Unresolved",
              value: unresolvedCount,
              color: "text-red-600 dark:text-red-400",
              bg: "bg-red-50 dark:bg-red-950/20",
            },
            {
              label: "Critical",
              value: criticalCount,
              color: "text-red-700 dark:text-red-300",
              bg: "bg-red-100 dark:bg-red-950/30",
            },
            {
              label: "Resolved",
              value: alerts.filter((a) => a.resolved).length,
              color: "text-green-600 dark:text-green-400",
              bg: "bg-green-50 dark:bg-green-950/20",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={cn("rounded-xl p-3 text-center", s.bg)}
            >
              <p className={cn("font-display text-2xl font-bold", s.color)}>
                {s.value}
              </p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {FILTER_OPTIONS.map((opt) => (
            <Button
              key={opt.id}
              variant={filter === opt.id ? "default" : "outline"}
              size="sm"
              className="text-xs shrink-0 h-8"
              onClick={() => setFilter(opt.id)}
              data-ocid="alerts.filter_tab"
            >
              {opt.label}
              {opt.id === "unresolved" && unresolvedCount > 0 && (
                <span className="ml-1.5 bg-destructive/20 text-destructive px-1.5 rounded-full">
                  {unresolvedCount}
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* Alert List */}
        {filtered.length === 0 ? (
          <div className="text-center py-16" data-ocid="alerts.empty_state">
            <Bell size={40} className="mx-auto mb-3 text-muted-foreground/20" />
            <p className="text-muted-foreground">
              No alerts matching this filter
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((alert, i) => {
              const patient = patients.find((p) => p.id === alert.patientId);
              return (
                <Card
                  key={alert.id}
                  className={cn(
                    "shadow-xs border transition-all",
                    alert.resolved
                      ? "opacity-60"
                      : alert.severity === "critical"
                        ? "border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/10"
                        : "border-border bg-card",
                  )}
                  data-ocid={`alerts.alert.item.${i + 1}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="text-xl shrink-0">
                        <AlertTypeIcon type={alert.alertType} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground">
                            <AlertTypeLabel type={alert.alertType} />
                          </p>
                          <StatusBadge severity={alert.severity as any} />
                          {alert.resolved && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0"
                            >
                              <Check size={10} className="mr-1" /> Resolved
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {patient?.name || "Unknown"} · Bed{" "}
                          {patient?.bedNumber} ·{" "}
                          {formatDistanceToNow(alert.timestamp)}
                        </p>
                        {alert.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5 italic">
                            {alert.notes}
                          </p>
                        )}
                      </div>
                      {!alert.resolved && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs shrink-0"
                          onClick={() => {
                            resolveAlert(alert.id, "Resolved by staff");
                            toast.success("Alert resolved");
                          }}
                          data-ocid={`alerts.resolve_button.${i + 1}`}
                        >
                          <Check size={12} className="mr-1" /> Resolve
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Auto-simulate notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            🔄 New alerts auto-simulate every 30 seconds for demo purposes
          </p>
        </div>
      </div>
    </AppShell>
  );
}
