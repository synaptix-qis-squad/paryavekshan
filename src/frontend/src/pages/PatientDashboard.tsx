import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Monitor,
  Phone,
  UserPlus,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "../components/AppShell";
import { BackButton } from "../components/BackButton";
import { DeviceStatusBadge } from "../components/DeviceStatusBadge";
import { StatusBadge } from "../components/StatusBadge";
import { type FamilyMember, useApp } from "../context/AppContext";
import { formatDistanceToNow } from "../utils/formatTime";

export default function PatientDashboard() {
  const {
    currentUser,
    patients,
    nurses,
    caregivers,
    familyMembers,
    setFamilyMembers,
    setPatients,
    alerts,
    addAlert,
    setEmergencyLogs,
    devices,
  } = useApp();

  // Find current patient by name match
  const patient =
    patients.find((p) => p.name === currentUser?.name) || patients[0];
  const patientDevice = patient
    ? devices.find((d) => d.patientId === patient.id)
    : null;
  const nurse = nurses.find((n) => n.id === patient?.nurseId);
  const caregiver = caregivers.find((c) => c.id === patient?.caregiverId);
  const patientFamily = familyMembers.filter((f) =>
    patient?.familyMemberIds.includes(f.id),
  );
  const patientAlerts = alerts.filter(
    (a) => a.patientId === patient?.id && !a.resolved,
  );

  const navigate = useNavigate();
  const [emergencyConfirmOpen, setEmergencyConfirmOpen] = useState(false);
  const [emergencyState, setEmergencyState] = useState<"idle" | "sent">("idle");
  const [addFamilyOpen, setAddFamilyOpen] = useState(false);
  const [newFamily, setNewFamily] = useState({
    name: "",
    relation: "",
    contactNumber: "",
    photoPreview: "",
  });
  const familyPhotoInputRef = useRef<HTMLInputElement>(null);

  const handleEmergencyConfirm = () => {
    setEmergencyConfirmOpen(false);
    setEmergencyState("sent");
    if (patient) {
      addAlert({
        patientId: patient.id,
        alertType: "emergency_button",
        severity: "critical",
        resolved: false,
      });
      setEmergencyLogs((prev) => [
        ...prev,
        {
          id: `el${Date.now()}`,
          patientId: patient.id,
          triggeredBy: currentUser?.id || "",
          timestamp: new Date().toISOString(),
          notifiedUsers: [nurse?.id || "", caregiver?.id || ""].filter(Boolean),
        },
      ]);
    }
    toast.error("🆘 Emergency alert sent to all care staff!");
    setTimeout(() => setEmergencyState("idle"), 5000);
  };

  const handleAddFamily = () => {
    if (!newFamily.name || !newFamily.relation) {
      toast.error("Fill in all fields");
      return;
    }
    if (!patient) return;
    const newFM: FamilyMember = {
      id: `f${Date.now()}`,
      name: newFamily.name,
      relation: newFamily.relation,
      patientId: patient.id,
      contactNumber: newFamily.contactNumber || undefined,
      photoUrl: newFamily.photoPreview || undefined,
    };
    setFamilyMembers((prev) => [...prev, newFM]);
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patient.id
          ? { ...p, familyMemberIds: [...p.familyMemberIds, newFM.id] }
          : p,
      ),
    );
    setAddFamilyOpen(false);
    setNewFamily({
      name: "",
      relation: "",
      contactNumber: "",
      photoPreview: "",
    });
    toast.success("Family member added");
  };

  if (!patient)
    return (
      <AppShell>
        <div className="p-6 text-center text-muted-foreground">
          No patient data found
        </div>
      </AppShell>
    );

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
      <div className="p-4 md:p-6 space-y-5">
        <BackButton variant="inline" />
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            My Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            Your health monitoring overview
          </p>
        </div>

        {/* Profile Card */}
        <Card className="shadow-medical border-0 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-primary font-display font-bold text-xl">
                {patient.name
                  .split(" ")
                  .map((x) => x[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="flex-1">
                <h2 className="font-display text-lg font-bold text-foreground">
                  {patient.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Age {patient.age} · Blood: {patient.bloodGroup}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs font-mono">
                    {patient.uniqueCode}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Bed {patient.bedNumber}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Device Status Row */}
            <div className="mt-4 pt-4 border-t border-border/40">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                Monitoring Device
              </p>
              <DeviceStatusBadge device={patientDevice} variant="full" />
            </div>
          </CardContent>
        </Card>

        {/* View Monitoring Button */}
        <Button
          className="w-full gap-2"
          onClick={() => navigate({ to: "/patient/monitor" })}
          data-ocid="patient.view_monitoring_button"
        >
          <Monitor size={16} />
          View My Monitoring Dashboard
        </Button>

        {/* Alerts */}
        {patientAlerts.length > 0 && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-1.5">
              <AlertTriangle size={14} /> Active Alerts ({patientAlerts.length})
            </p>
            <div className="space-y-1">
              {patientAlerts.slice(0, 3).map((a) => (
                <p
                  key={a.id}
                  className="text-xs text-red-600 dark:text-red-400"
                >
                  {a.alertType === "saline_critical"
                    ? "🔴 Saline Critical"
                    : a.alertType === "saline_low"
                      ? "🟡 Saline Low"
                      : a.alertType === "posture_fall"
                        ? "⚠️ Fall Detected"
                        : "⚠️ Alert"}{" "}
                  · {formatDistanceToNow(a.timestamp)}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* EMERGENCY BUTTON */}
        <div className="flex flex-col items-center py-4">
          {emergencyState === "sent" ? (
            <div className="text-center animate-fade-in">
              <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
              <p className="font-display text-xl font-bold text-green-600 dark:text-green-400">
                Alert Sent!
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Medical staff have been notified
              </p>
            </div>
          ) : (
            <button
              type="button"
              className="w-36 h-36 rounded-full bg-red-600 hover:bg-red-700 text-white font-display font-bold text-lg shadow-lg emergency-pulse transition-colors flex flex-col items-center justify-center gap-1"
              onClick={() => setEmergencyConfirmOpen(true)}
              data-ocid="patient.emergency_button"
            >
              <AlertTriangle size={28} />
              <span className="text-sm">EMERGENCY</span>
            </button>
          )}
          <p className="text-xs text-muted-foreground mt-3 text-center max-w-[200px]">
            Press to notify your nurse, caregiver, and family
          </p>
        </div>

        {/* Confirm Dialog */}
        <Dialog
          open={emergencyConfirmOpen}
          onOpenChange={setEmergencyConfirmOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle size={18} /> Confirm Emergency Alert
              </DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              This will immediately notify your assigned nurse, caregiver, and
              family members. Are you sure you need emergency assistance?
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEmergencyConfirmOpen(false)}
                data-ocid="patient.emergency_cancel_button"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleEmergencyConfirm}
                data-ocid="patient.emergency_confirm_button"
              >
                🆘 Send Emergency Alert
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Status cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="shadow-medical border-0">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-2">Posture</p>
              <p
                className={cn(
                  "text-lg font-display font-bold",
                  patient.postureStatus === "Fallen" && "text-destructive",
                )}
              >
                {patient.postureStatus}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-medical border-0">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-2">Saline</p>
              <p className={cn("text-lg font-display font-bold", salineColor)}>
                {patient.salineLevel}%
              </p>
              <Progress
                value={patient.salineLevel}
                className={cn("h-1.5 mt-1", salineBarClass)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Nurse Card */}
        {nurse && (
          <Card className="shadow-medical border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Assigned Nurse</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-3 bg-teal-50 dark:bg-teal-950/20 rounded-lg">
                <Avatar>
                  <AvatarFallback className="bg-teal-200 dark:bg-teal-800/50 text-teal-700 dark:text-teal-300 font-bold text-sm">
                    {nurse.name
                      .split(" ")
                      .map((x) => x[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">
                    {nurse.name}
                  </p>
                  <StatusBadge
                    severity={nurse.isAvailable ? "normal" : "warning"}
                    label={nurse.isAvailable ? "Available" : "Busy"}
                  />
                </div>
                {nurse.phone && (
                  <a
                    href={`tel:${nurse.phone}`}
                    className="text-primary hover:text-primary/80"
                  >
                    <Phone size={16} />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Caregiver Card */}
        {caregiver && (
          <Card className="shadow-medical border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Assigned Caregiver</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <Avatar>
                  <AvatarFallback className="bg-purple-200 dark:bg-purple-800/50 text-purple-700 dark:text-purple-300 font-bold text-sm">
                    {caregiver.name
                      .split(" ")
                      .map((x) => x[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">
                    {caregiver.name}
                  </p>
                  <p className="text-xs text-muted-foreground">Caregiver</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Family Members */}
        <Card className="shadow-medical border-0">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                Family Members ({patientFamily.length})
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => setAddFamilyOpen(true)}
              >
                <UserPlus size={12} className="mr-1" /> Add
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {patientFamily.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No family members added yet
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {patientFamily.map((fm) => (
                  <div
                    key={fm.id}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors"
                  >
                    <Avatar className="w-14 h-14 ring-2 ring-orange-200 dark:ring-orange-800/50">
                      <AvatarImage
                        src={fm.photoUrl}
                        alt={fm.name}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-base font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                        {fm.name
                          .split(" ")
                          .map((x) => x[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-center min-w-0 w-full">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {fm.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {fm.relation}
                      </p>
                      {fm.contactNumber && (
                        <p className="text-xs text-primary flex items-center justify-center gap-1 mt-1">
                          <Phone size={10} />
                          <span className="truncate">{fm.contactNumber}</span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Family Dialog */}
        <Dialog
          open={addFamilyOpen}
          onOpenChange={(open) => {
            setAddFamilyOpen(open);
            if (!open)
              setNewFamily({
                name: "",
                relation: "",
                contactNumber: "",
                photoPreview: "",
              });
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Family Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {/* Photo upload */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0 border-2 border-dashed border-border">
                  {newFamily.photoPreview ? (
                    <img
                      src={newFamily.photoPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera size={20} className="text-muted-foreground" />
                  )}
                </div>
                <div>
                  <input
                    ref={familyPhotoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) =>
                        setNewFamily((f) => ({
                          ...f,
                          photoPreview: ev.target?.result as string,
                        }));
                      reader.readAsDataURL(file);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => familyPhotoInputRef.current?.click()}
                    data-ocid="patient.add_family.upload_button"
                  >
                    <Camera size={12} className="mr-1" />
                    {newFamily.photoPreview ? "Change Photo" : "Upload Photo"}
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Full Name *</Label>
                <Input
                  placeholder="Sunita Kumar"
                  value={newFamily.name}
                  onChange={(e) =>
                    setNewFamily((f) => ({ ...f, name: e.target.value }))
                  }
                  data-ocid="patient.add_family.name_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Relation *</Label>
                <Input
                  placeholder="Wife, Son, Daughter..."
                  value={newFamily.relation}
                  onChange={(e) =>
                    setNewFamily((f) => ({ ...f, relation: e.target.value }))
                  }
                  data-ocid="patient.add_family.relation_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1">
                  <Phone size={12} /> Contact Number
                </Label>
                <Input
                  placeholder="+91 98765 XXXXX"
                  value={newFamily.contactNumber}
                  onChange={(e) =>
                    setNewFamily((f) => ({
                      ...f,
                      contactNumber: e.target.value,
                    }))
                  }
                  data-ocid="patient.add_family.contact_input"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAddFamilyOpen(false)}
                data-ocid="patient.add_family.cancel_button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddFamily}
                data-ocid="patient.add_family.submit_button"
              >
                Add Member
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
