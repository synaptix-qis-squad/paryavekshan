import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, BedDouble, Search } from "lucide-react";
import { useState } from "react";
import { AppShell } from "../components/AppShell";
import { BackButton } from "../components/BackButton";
import { DeviceStatusBadge } from "../components/DeviceStatusBadge";
import { StatusBadge } from "../components/StatusBadge";
import { useApp } from "../context/AppContext";

export default function FamilyDashboard() {
  const { currentUser, patients, familyMembers, alerts, devices } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  // Find the family member record matching the current user, then get linked patients
  const familyMemberRecord = familyMembers.find(
    (f) => f.name === currentUser?.name,
  );
  const linkedPatients = familyMemberRecord
    ? patients.filter((p) => p.familyMemberIds.includes(familyMemberRecord.id))
    : // For demo login, show all patients that have family members
      patients.filter((p) => p.familyMemberIds.length > 0);

  // Fallback: if no linked patients found, show first patient
  const visiblePatients =
    linkedPatients.length > 0 ? linkedPatients : patients.slice(0, 1);

  const filteredPatients = visiblePatients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.bedNumber.toLowerCase().includes(search.toLowerCase()),
  );

  const getPatientAlertStatus = (patientId: string) =>
    alerts.some((a) => a.patientId === patientId && !a.resolved);

  return (
    <AppShell>
      <div className="p-4 md:p-6">
        <BackButton variant="inline" />
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Welcome, {currentUser?.name?.split(" ")[0] || "Family"} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {visiblePatients.length} patient
            {visiblePatients.length !== 1 ? "s" : ""} · View-only access
          </p>
        </div>

        {/* Critical alert banner */}
        {visiblePatients.some(
          (p) => p.postureStatus === "Fallen" || p.salineLevel < 20,
        ) && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle
                size={16}
                className="text-red-600 animate-bounce"
              />
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                Urgent Attention Required
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {visiblePatients
                .filter(
                  (p) => p.postureStatus === "Fallen" || p.salineLevel < 5,
                )
                .map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => navigate({ to: `/family/patient/${p.id}` })}
                    className="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 px-3 py-1.5 rounded-full font-medium hover:bg-red-200 transition-colors"
                  >
                    ⚠️ {p.name} —{" "}
                    {p.postureStatus === "Fallen"
                      ? "FALLEN"
                      : "SALINE CRITICAL"}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search patients by name or bed..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-10 text-sm"
            data-ocid="family.patient_search_input"
          />
        </div>

        {/* Patient Grid */}
        {filteredPatients.length === 0 ? (
          <div
            className="text-center py-16"
            data-ocid="family.patient_list.empty_state"
          >
            <BedDouble
              size={40}
              className="mx-auto mb-3 text-muted-foreground/30"
            />
            <p className="text-muted-foreground text-sm">No patients found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredPatients.map((patient, i) => {
              const hasAlert =
                getPatientAlertStatus(patient.id) ||
                patient.postureStatus === "Fallen" ||
                patient.salineLevel < 20;
              const isCritical =
                patient.postureStatus === "Fallen" || patient.salineLevel < 5;

              return (
                <Card
                  key={patient.id}
                  className={cn(
                    "shadow-medical border-0 cursor-pointer hover:shadow-medical-lg transition-all duration-200 hover:-translate-y-0.5",
                    isCritical && "ring-2 ring-destructive/50",
                  )}
                  onClick={() =>
                    navigate({ to: `/family/patient/${patient.id}` })
                  }
                  data-ocid={`family.patient.item.${i + 1}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center text-white font-display font-bold text-base overflow-hidden",
                          isCritical
                            ? "bg-red-500"
                            : hasAlert
                              ? "bg-orange-400"
                              : "bg-primary",
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
                            .toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-foreground text-sm truncate">
                          {patient.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Age {patient.age} · Bed {patient.bedNumber}
                        </p>
                        {patient.bloodGroup && (
                          <p className="text-xs text-muted-foreground">
                            Blood: {patient.bloodGroup}
                          </p>
                        )}
                      </div>
                      <StatusBadge
                        severity={
                          isCritical ? "critical" : hasAlert ? "high" : "normal"
                        }
                        label={
                          isCritical
                            ? "Critical"
                            : hasAlert
                              ? "Alert"
                              : "Normal"
                        }
                      />
                    </div>

                    {/* Posture & Saline */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div
                        className={cn(
                          "rounded-lg p-2 text-xs",
                          patient.postureStatus === "Fallen"
                            ? "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
                            : "bg-muted/40",
                        )}
                      >
                        <p className="text-muted-foreground mb-0.5">Posture</p>
                        <p
                          className={cn(
                            "font-semibold",
                            patient.postureStatus === "Fallen" &&
                              "text-destructive",
                          )}
                        >
                          {patient.postureStatus === "Fallen"
                            ? "⚠️ FALLEN"
                            : patient.postureStatus}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "rounded-lg p-2 text-xs",
                          patient.salineLevel < 5
                            ? "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
                            : patient.salineLevel < 20
                              ? "bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800"
                              : "bg-muted/40",
                        )}
                      >
                        <p className="text-muted-foreground mb-0.5">Saline</p>
                        <p
                          className={cn(
                            "font-semibold",
                            patient.salineLevel < 5
                              ? "text-destructive"
                              : patient.salineLevel < 20
                                ? "text-yellow-600 dark:text-yellow-500"
                                : "text-green-600 dark:text-green-500",
                          )}
                        >
                          {patient.salineLevel}%
                        </p>
                      </div>
                    </div>

                    {/* Saline progress bar */}
                    <Progress
                      value={patient.salineLevel}
                      className={cn(
                        "h-1.5",
                        patient.salineLevel < 5
                          ? "[&>div]:bg-red-500"
                          : patient.salineLevel < 20
                            ? "[&>div]:bg-yellow-500"
                            : "[&>div]:bg-green-500",
                      )}
                    />

                    {/* Device Status */}
                    <div className="mt-3">
                      <DeviceStatusBadge
                        device={devices.find((d) => d.patientId === patient.id)}
                        variant="compact"
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
