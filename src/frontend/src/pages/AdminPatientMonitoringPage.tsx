import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useParams } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  Droplet,
  Eye,
  FileText,
  Hand,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "../components/AppShell";
import { BackButton } from "../components/BackButton";
import { StatusBadge } from "../components/StatusBadge";
import { AlertTypeIcon, AlertTypeLabel } from "../components/StatusBadge";
import { useApp } from "../context/AppContext";
import { formatDistanceToNow } from "../utils/formatTime";

const POSTURE_OPTIONS = ["Sitting", "Standing", "Sleeping", "Fallen"] as const;

const POSTURE_ICONS: Record<string, string> = {
  Sitting: "🪑",
  Standing: "🧍",
  Sleeping: "🛌",
  Fallen: "🚨",
};

export default function AdminPatientMonitoringPage() {
  const { id } = useParams({ from: "/admin/patient/$id/monitor" });
  const {
    patients,
    nurses,
    caregivers,
    familyMembers,
    alerts,
    addAlert,
    updatePatientSaline,
    updatePatientPosture,
  } = useApp();

  const patient = patients.find((p) => p.id === id);
  const nurse = nurses.find((n) => n.id === patient?.nurseId);
  const caregiver = caregivers.find((c) => c.id === patient?.caregiverId);
  const patientFamily = familyMembers.filter((f) =>
    patient?.familyMemberIds.includes(f.id),
  );
  const patientAlerts = alerts.filter((a) => a.patientId === id);

  const [gestureHistory] = useState([
    {
      time: new Date(Date.now() - 3600000).toISOString(),
      type: "Continuous waving",
      responded: true,
    },
    {
      time: new Date(Date.now() - 86400000).toISOString(),
      type: "Distress signal",
      responded: true,
    },
  ]);
  const [unknownDetections] = useState([
    {
      time: new Date(Date.now() - 7200000).toISOString(),
      resolved: true,
      note: "Visitor identified",
    },
  ]);
  const [feedActive] = useState(true);

  const handleSalineChange = useCallback(
    (val: number[]) => {
      if (!patient) return;
      const level = val[0];
      updatePatientSaline(patient.id, level);
      if (level < 5) {
        addAlert({
          patientId: patient.id,
          alertType: "saline_critical",
          severity: "critical",
          resolved: false,
        });
        toast.error(`🚨 CRITICAL: Saline almost empty for ${patient.name}!`);
      } else if (level < 20) {
        addAlert({
          patientId: patient.id,
          alertType: "saline_low",
          severity: "high",
          resolved: false,
        });
        toast.warning(`⚠️ Saline low for ${patient.name}`);
      }
    },
    [patient, updatePatientSaline, addAlert],
  );

  const handlePostureChange = useCallback(
    (posture: (typeof POSTURE_OPTIONS)[number]) => {
      if (!patient) return;
      updatePatientPosture(patient.id, posture);
      if (posture === "Fallen") {
        addAlert({
          patientId: patient.id,
          alertType: "posture_fall",
          severity: "critical",
          resolved: false,
        });
        toast.error(`🚨 FALL DETECTED: ${patient.name} has fallen!`);
      } else {
        toast.success(`Posture updated: ${posture}`);
      }
    },
    [patient, updatePatientPosture, addAlert],
  );

  const handleGestureAlert = useCallback(() => {
    if (!patient) return;
    addAlert({
      patientId: patient.id,
      alertType: "hand_gesture",
      severity: "high",
      resolved: false,
    });
    toast.warning(`✋ Hand gesture alert from ${patient.name}!`);
  }, [patient, addAlert]);

  if (!patient) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-64">
          <p className="text-muted-foreground">Patient not found</p>
        </div>
      </AppShell>
    );
  }

  const salineColor =
    patient.salineLevel < 5
      ? "text-destructive"
      : patient.salineLevel < 20
        ? "text-yellow-600 dark:text-yellow-500"
        : "text-green-600 dark:text-green-500";
  const salineBarClass =
    patient.salineLevel < 5
      ? "[&>div]:bg-red-500"
      : patient.salineLevel < 20
        ? "[&>div]:bg-yellow-500"
        : "[&>div]:bg-green-500";

  return (
    <AppShell>
      <div className="p-4 md:p-6">
        <BackButton variant="inline" />

        <div className="flex items-center gap-3 mb-6">
          <div
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-display font-bold overflow-hidden shrink-0",
              patient.postureStatus === "Fallen" ? "bg-red-500" : "bg-primary",
              patient.photoUrl && "bg-transparent",
            )}
          >
            {patient.photoUrl ? (
              <img
                src={patient.photoUrl}
                alt={patient.name}
                className="w-full h-full object-cover"
              />
            ) : (
              patient.name
                .split(" ")
                .map((x) => x[0])
                .join("")
                .slice(0, 2)
            )}
          </div>
          <div className="flex-1">
            <h1 className="font-display text-xl font-bold text-foreground">
              {patient.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Bed {patient.bedNumber} · Age {patient.age} · {patient.bloodGroup}
            </p>
          </div>
          {patient.postureStatus === "Fallen" && (
            <StatusBadge
              severity="critical"
              label="CRITICAL"
              className="ml-auto"
            />
          )}
        </div>

        <Tabs defaultValue="live">
          <TabsList className="w-full overflow-x-auto flex justify-start h-auto p-1 gap-0.5 mb-5">
            <TabsTrigger
              value="live"
              className="text-xs px-2.5 py-1.5"
              data-ocid="admin.monitoring.live_tab"
            >
              <Camera size={12} className="mr-1" />
              Live
            </TabsTrigger>
            <TabsTrigger
              value="posture"
              className="text-xs px-2.5 py-1.5"
              data-ocid="admin.monitoring.posture_tab"
            >
              <Activity size={12} className="mr-1" />
              Posture
            </TabsTrigger>
            <TabsTrigger
              value="gesture"
              className="text-xs px-2.5 py-1.5"
              data-ocid="admin.monitoring.gesture_tab"
            >
              <Hand size={12} className="mr-1" />
              Gesture
            </TabsTrigger>
            <TabsTrigger
              value="unknown"
              className="text-xs px-2.5 py-1.5"
              data-ocid="admin.monitoring.unknown_tab"
            >
              <Eye size={12} className="mr-1" />
              Unknown
            </TabsTrigger>
            <TabsTrigger
              value="saline"
              className="text-xs px-2.5 py-1.5"
              data-ocid="admin.monitoring.saline_tab"
            >
              <Droplet size={12} className="mr-1" />
              Saline
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="text-xs px-2.5 py-1.5"
              data-ocid="admin.monitoring.history_tab"
            >
              <FileText size={12} className="mr-1" />
              History
            </TabsTrigger>
          </TabsList>

          {/* LIVE FEED TAB */}
          <TabsContent value="live" className="mt-0">
            <Card className="shadow-medical border-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Live Camera Feed</h3>
                  <Badge
                    className={cn(
                      "text-xs",
                      feedActive
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0"
                        : "bg-gray-100 text-gray-600",
                    )}
                  >
                    {feedActive ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse inline-block" />
                        Live
                      </>
                    ) : (
                      "Offline"
                    )}
                  </Badge>
                </div>
                <div className="aspect-video bg-slate-900 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage:
                        "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                      backgroundSize: "30px 30px",
                    }}
                  />
                  <Camera size={48} className="text-slate-600 mb-3" />
                  <p className="text-slate-400 text-sm">
                    Camera Feed — {patient.name}
                  </p>
                  <p className="text-slate-600 text-xs mt-1">
                    Room {patient.bedNumber}
                  </p>
                  {feedActive && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-red-600/90 text-white text-xs px-2 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      REC
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Last updated: just now · AI Analysis: Active
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* POSTURE TAB */}
          <TabsContent value="posture" className="mt-0 space-y-4">
            {patient.postureStatus === "Fallen" && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 alert-pulse">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle size={18} className="text-red-600" />
                  <p className="font-bold text-red-700 dark:text-red-400">
                    ⚠️ FALL DETECTED
                  </p>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400">
                  Alert has been sent to nursing staff. Immediate assistance
                  required.
                </p>
              </div>
            )}

            <Card className="shadow-medical border-0">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <span className="text-6xl mb-3 block">
                    {POSTURE_ICONS[patient.postureStatus]}
                  </span>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {patient.postureStatus}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Current detected posture
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Simulate Posture (Demo)
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {POSTURE_OPTIONS.map((posture) => (
                      <Button
                        key={posture}
                        variant={
                          patient.postureStatus === posture
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        className={cn(
                          "text-xs h-9",
                          posture === "Fallen" &&
                            patient.postureStatus !== posture &&
                            "border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400",
                        )}
                        onClick={() => handlePostureChange(posture)}
                        data-ocid="admin.monitoring.posture_simulate_button"
                      >
                        {POSTURE_ICONS[posture]} {posture}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-medical border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Posture History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {patientAlerts.filter((a) => a.alertType === "posture_fall")
                    .length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No fall events recorded
                    </p>
                  ) : (
                    patientAlerts
                      .filter((a) => a.alertType === "posture_fall")
                      .map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center gap-3 p-2 bg-red-50 dark:bg-red-950/20 rounded-lg"
                        >
                          <AlertTriangle
                            size={14}
                            className="text-red-500 shrink-0"
                          />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-foreground">
                              Fall Detected
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(a.timestamp)}
                            </p>
                          </div>
                          <StatusBadge
                            severity={a.resolved ? "normal" : "critical"}
                            label={a.resolved ? "Resolved" : "Active"}
                          />
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GESTURE TAB */}
          <TabsContent value="gesture" className="mt-0 space-y-4">
            <Card className="shadow-medical border-0">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <span className="text-5xl mb-3 block">✋</span>
                  <p className="font-semibold text-foreground">
                    Gesture Detection Active
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    AI monitoring continuous hand movements
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-orange-300 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400"
                  onClick={handleGestureAlert}
                  data-ocid="admin.monitoring.gesture_simulate_button"
                >
                  ✋ Simulate Hand Gesture Alert (Demo)
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-medical border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  Emergency Call History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {gestureHistory.map((g) => (
                    <div
                      key={g.time}
                      className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg"
                    >
                      <Clock
                        size={14}
                        className="text-muted-foreground shrink-0"
                      />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-foreground">
                          {g.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(g.time)}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0"
                      >
                        <CheckCircle2 size={10} className="mr-1" /> Responded
                      </Badge>
                    </div>
                  ))}
                  {patientAlerts
                    .filter((a) => a.alertType === "hand_gesture")
                    .map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg"
                      >
                        <AlertTriangle
                          size={14}
                          className="text-orange-500 shrink-0"
                        />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-foreground">
                            Hand Gesture Alert
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(a.timestamp)}
                          </p>
                        </div>
                        <StatusBadge
                          severity={a.resolved ? "normal" : "high"}
                          label={a.resolved ? "Resolved" : "Active"}
                        />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* UNKNOWN PERSON TAB */}
          <TabsContent value="unknown" className="mt-0 space-y-4">
            <Card className="shadow-medical border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  Registered Family Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patientFamily.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No family members registered
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    {patientFamily.map((fm) => (
                      <div
                        key={fm.id}
                        className="flex flex-col items-center gap-1.5 max-w-[80px]"
                      >
                        <Avatar className="w-14 h-14">
                          {fm.photoUrl && (
                            <AvatarImage
                              src={fm.photoUrl}
                              alt={fm.name}
                              className="object-cover"
                            />
                          )}
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                            {fm.name
                              .split(" ")
                              .map((x) => x[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-xs text-foreground font-medium text-center leading-tight">
                          {fm.name}
                        </p>
                        <p className="text-xs text-muted-foreground text-center">
                          {fm.relation}
                        </p>
                        {fm.contactNumber && (
                          <p className="text-xs text-primary text-center font-mono leading-tight">
                            {fm.contactNumber}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-medical border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">
                  Unknown Person Detection Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {unknownDetections.map((d) => (
                    <div
                      key={d.time}
                      className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg"
                    >
                      <Eye size={14} className="text-orange-500 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-foreground">
                          Unknown visitor detected
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(d.time)} · {d.note}
                        </p>
                      </div>
                      <StatusBadge severity="normal" label="Resolved" />
                    </div>
                  ))}
                  {patientAlerts
                    .filter((a) => a.alertType === "unknown_person")
                    .map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg"
                      >
                        <Eye size={14} className="text-orange-500 shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-foreground">
                            Unknown person detected
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(a.timestamp)}
                          </p>
                        </div>
                        <StatusBadge
                          severity={a.resolved ? "normal" : "high"}
                          label={a.resolved ? "Resolved" : "Active"}
                        />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SALINE TAB */}
          <TabsContent value="saline" className="mt-0 space-y-4">
            {patient.salineLevel < 5 && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 alert-pulse">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-600" />
                  <p className="font-bold text-red-700 dark:text-red-400">
                    🔴 CRITICAL: Saline almost empty!
                  </p>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  Immediate refill required. Continuous alerts sent.
                </p>
              </div>
            )}
            {patient.salineLevel >= 5 && patient.salineLevel < 20 && (
              <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-yellow-600" />
                  <p className="font-bold text-yellow-700 dark:text-yellow-500">
                    ⚠️ Saline Low — Refill required
                  </p>
                </div>
                <p className="text-sm text-yellow-600 dark:text-yellow-500 mt-1">
                  Saline level below 20%. Please arrange refill soon.
                </p>
              </div>
            )}

            <Card className="shadow-medical border-0">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <span className="text-6xl mb-2 block">💧</span>
                  <p
                    className={cn(
                      "font-display text-5xl font-bold",
                      salineColor,
                    )}
                  >
                    {patient.salineLevel}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Current Saline Level
                  </p>
                </div>

                <div className="mb-6">
                  <Progress
                    value={patient.salineLevel}
                    className={cn("h-4 rounded-full", salineBarClass)}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                    <span className="text-red-500">Critical &lt;5%</span>
                    <span className="text-yellow-600">Low &lt;20%</span>
                    <span className="text-green-600">Safe ≥20%</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Simulate Level (Demo)
                  </p>
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[patient.salineLevel]}
                    onValueChange={handleSalineChange}
                    className="w-full"
                    data-ocid="admin.monitoring.saline_slider"
                  />
                  <div className="flex justify-between">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 text-red-600 border-red-300"
                      onClick={() => handleSalineChange([3])}
                    >
                      Set Critical (3%)
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 text-yellow-600 border-yellow-300"
                      onClick={() => handleSalineChange([15])}
                    >
                      Set Low (15%)
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 text-green-600 border-green-300"
                      onClick={() => handleSalineChange([80])}
                    >
                      Set Full (80%)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-medical border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Saline Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                {patientAlerts.filter(
                  (a) =>
                    a.alertType === "saline_low" ||
                    a.alertType === "saline_critical",
                ).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No saline alerts recorded
                  </p>
                ) : (
                  <div className="space-y-2">
                    {patientAlerts
                      .filter(
                        (a) =>
                          a.alertType === "saline_low" ||
                          a.alertType === "saline_critical",
                      )
                      .map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg"
                        >
                          <AlertTypeIcon type={a.alertType} />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-foreground">
                              <AlertTypeLabel type={a.alertType} />
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(a.timestamp)}
                            </p>
                          </div>
                          <StatusBadge
                            severity={
                              a.resolved ? "normal" : (a.severity as any)
                            }
                            label={a.resolved ? "Resolved" : "Active"}
                          />
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* MEDICAL HISTORY TAB */}
          <TabsContent value="history" className="mt-0 space-y-4">
            <Card className="shadow-medical border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Patient Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: "Full Name", value: patient.name },
                    { label: "Age", value: `${patient.age} years` },
                    { label: "Blood Group", value: patient.bloodGroup },
                    { label: "Bed Number", value: patient.bedNumber },
                    { label: "Unique Code", value: patient.uniqueCode },
                    {
                      label: "Status",
                      value: patient.isActive ? "Active" : "Inactive",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-muted/40 rounded-lg p-3"
                    >
                      <p className="text-xs text-muted-foreground mb-0.5">
                        {item.label}
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-medical border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Medical History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground leading-relaxed">
                  {patient.medicalHistory}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-medical border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Care Team</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {nurse && (
                  <div className="flex items-center gap-3 p-3 bg-teal-50 dark:bg-teal-950/20 rounded-lg">
                    <div className="w-9 h-9 rounded-full bg-teal-200 dark:bg-teal-800/50 flex items-center justify-center">
                      <span className="text-xs font-bold text-teal-700 dark:text-teal-300">
                        {nurse.name
                          .split(" ")
                          .map((x) => x[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {nurse.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Assigned Nurse
                      </p>
                    </div>
                  </div>
                )}
                {caregiver && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <div className="w-9 h-9 rounded-full bg-purple-200 dark:bg-purple-800/50 flex items-center justify-center">
                      <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                        {caregiver.name
                          .split(" ")
                          .map((x) => x[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {caregiver.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Assigned Caregiver
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {patientFamily.length > 0 && (
              <Card className="shadow-medical border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Family Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {patientFamily.map((fm) => (
                      <div
                        key={fm.id}
                        className="flex items-center gap-3 p-2 rounded-lg bg-muted/40"
                      >
                        <Avatar className="w-8 h-8 shrink-0">
                          {fm.photoUrl && (
                            <AvatarImage
                              src={fm.photoUrl}
                              alt={fm.name}
                              className="object-cover"
                            />
                          )}
                          <AvatarFallback className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                            {fm.name
                              .split(" ")
                              .map((x) => x[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {fm.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {fm.relation}
                            {fm.contactNumber && (
                              <span className="ml-2 font-mono text-primary">
                                {fm.contactNumber}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {patient.emergencyContacts.length > 0 && (
              <Card className="shadow-medical border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Emergency Contacts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {patient.emergencyContacts.map((contact) => (
                      <div
                        key={contact}
                        className="flex items-center gap-2 p-2 bg-muted/40 rounded-lg"
                      >
                        <span className="text-base">📞</span>
                        <p className="text-sm text-foreground">{contact}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* All Alerts */}
            <Card className="shadow-medical border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">All Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                {patientAlerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No alerts recorded
                  </p>
                ) : (
                  <div className="space-y-2">
                    {patientAlerts.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg"
                      >
                        <AlertTypeIcon type={a.alertType} />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-foreground">
                            <AlertTypeLabel type={a.alertType} />
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(a.timestamp)}
                          </p>
                        </div>
                        <StatusBadge
                          severity={a.resolved ? "normal" : (a.severity as any)}
                          label={a.resolved ? "Resolved" : "Active"}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
