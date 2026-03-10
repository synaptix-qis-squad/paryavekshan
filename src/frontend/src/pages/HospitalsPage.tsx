import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  BedDouble,
  Bell,
  Building2,
  Edit2,
  Heart,
  Plus,
  Stethoscope,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "../components/AppShell";
import { BackButton } from "../components/BackButton";
import { type Hospital, useApp } from "../context/AppContext";

export default function HospitalsPage() {
  const { hospitals, setHospitals, patients, nurses, caregivers, alerts } =
    useApp();

  // Add hospital dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", address: "" });

  // Edit hospital dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Hospital | null>(null);
  const [editForm, setEditForm] = useState({ name: "", address: "" });

  const handleAddHospital = () => {
    if (!addForm.name.trim() || !addForm.address.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    const newHospital: Hospital = {
      id: `h${Date.now()}`,
      name: addForm.name.trim(),
      address: addForm.address.trim(),
      adminId: "u1",
    };
    setHospitals((prev) => [...prev, newHospital]);
    setAddForm({ name: "", address: "" });
    setAddOpen(false);
    toast.success(`${newHospital.name} added successfully`);
  };

  const openEdit = (hospital: Hospital) => {
    setEditTarget(hospital);
    setEditForm({ name: hospital.name, address: hospital.address });
    setEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editTarget) return;
    if (!editForm.name.trim() || !editForm.address.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setHospitals((prev) =>
      prev.map((h) =>
        h.id === editTarget.id
          ? {
              ...h,
              name: editForm.name.trim(),
              address: editForm.address.trim(),
            }
          : h,
      ),
    );
    setEditOpen(false);
    setEditTarget(null);
    toast.success("Hospital updated successfully");
  };

  const getHospitalStats = (hospitalId: string) => {
    const patientCount = patients.filter(
      (p) => p.hospitalId === hospitalId,
    ).length;
    const nurseCount = nurses.filter((n) => n.hospitalId === hospitalId).length;
    const caregiverCount = caregivers.filter(
      (c) => c.hospitalId === hospitalId,
    ).length;
    const hospitalPatientIds = patients
      .filter((p) => p.hospitalId === hospitalId)
      .map((p) => p.id);
    const activeAlerts = alerts.filter(
      (a) => !a.resolved && hospitalPatientIds.includes(a.patientId),
    ).length;
    return { patientCount, nurseCount, caregiverCount, activeAlerts };
  };

  return (
    <AppShell>
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <BackButton variant="inline" />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Hospitals
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage all registered hospitals in the system
            </p>
          </div>

          {/* Add Hospital Dialog */}
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="gap-1.5 shrink-0"
                data-ocid="hospitals.add_hospital_button"
              >
                <Plus size={14} />
                Add Hospital
              </Button>
            </DialogTrigger>
            <DialogContent data-ocid="hospitals.hospital_dialog">
              <DialogHeader>
                <DialogTitle>Add New Hospital</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="hosp-name">Hospital Name</Label>
                  <Input
                    id="hosp-name"
                    placeholder="City General Hospital"
                    value={addForm.name}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, name: e.target.value }))
                    }
                    data-ocid="hospitals.hospital_dialog.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="hosp-address">Address</Label>
                  <Textarea
                    id="hosp-address"
                    placeholder="123 Healthcare Ave, Mumbai, MH 400001"
                    value={addForm.address}
                    onChange={(e) =>
                      setAddForm((f) => ({ ...f, address: e.target.value }))
                    }
                    rows={3}
                    data-ocid="hospitals.hospital_dialog.textarea"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAddOpen(false);
                    setAddForm({ name: "", address: "" });
                  }}
                  data-ocid="hospitals.hospital_dialog.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddHospital}
                  data-ocid="hospitals.hospital_dialog.confirm_button"
                >
                  Add Hospital
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Hospital Dialog (outside map to avoid nested dialogs) */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent data-ocid="hospitals.edit_dialog">
            <DialogHeader>
              <DialogTitle>Edit Hospital</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-hosp-name">Hospital Name</Label>
                <Input
                  id="edit-hosp-name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, name: e.target.value }))
                  }
                  data-ocid="hospitals.edit_dialog.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-hosp-address">Address</Label>
                <Textarea
                  id="edit-hosp-address"
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, address: e.target.value }))
                  }
                  rows={3}
                  data-ocid="hospitals.edit_dialog.textarea"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setEditOpen(false);
                  setEditTarget(null);
                }}
                data-ocid="hospitals.edit_dialog.cancel_button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                data-ocid="hospitals.edit_dialog.save_button"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Hospital Cards */}
        {hospitals.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            data-ocid="hospitals.empty_state"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Building2 size={28} className="text-muted-foreground/50" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              No hospitals yet
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add the first hospital to get started.
            </p>
            <Button
              size="sm"
              onClick={() => setAddOpen(true)}
              data-ocid="hospitals.empty_state.add_hospital_button"
            >
              <Plus size={14} className="mr-1" />
              Add Hospital
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hospitals.map((hospital, index) => {
              const stats = getHospitalStats(hospital.id);
              const isPrimary = index === 0;

              return (
                <Card
                  key={hospital.id}
                  className="shadow-medical border-0 overflow-hidden"
                  data-ocid={`hospitals.hospital.item.${index + 1}`}
                >
                  {/* Card top accent bar for primary */}
                  {isPrimary && (
                    <div className="h-1 w-full bg-gradient-to-r from-primary to-primary/60" />
                  )}
                  <CardContent className="p-5">
                    {/* Header row */}
                    <div className="flex items-start gap-3 mb-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                          isPrimary
                            ? "bg-primary/15"
                            : "bg-blue-50 dark:bg-blue-900/20"
                        }`}
                      >
                        <Building2
                          size={22}
                          className={
                            isPrimary
                              ? "text-primary"
                              : "text-blue-600 dark:text-blue-400"
                          }
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-foreground text-sm leading-tight">
                            {hospital.name}
                          </h3>
                          {isPrimary && (
                            <Badge
                              className="text-[10px] h-4 px-1.5 bg-primary/15 text-primary border-primary/20 font-semibold"
                              variant="outline"
                            >
                              Primary
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {hospital.address}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                        onClick={() => openEdit(hospital)}
                        data-ocid={`hospitals.hospital.item.${index + 1}.edit_button`}
                      >
                        <Edit2 size={14} />
                      </Button>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-muted/40 rounded-lg p-2.5 flex flex-col items-center gap-1">
                        <BedDouble
                          size={14}
                          className="text-green-600 dark:text-green-400"
                        />
                        <span className="font-bold text-base text-foreground leading-none">
                          {stats.patientCount}
                        </span>
                        <span className="text-[10px] text-muted-foreground text-center leading-tight">
                          Patients
                        </span>
                      </div>
                      <div className="bg-muted/40 rounded-lg p-2.5 flex flex-col items-center gap-1">
                        <Stethoscope
                          size={14}
                          className="text-teal-600 dark:text-teal-400"
                        />
                        <span className="font-bold text-base text-foreground leading-none">
                          {stats.nurseCount}
                        </span>
                        <span className="text-[10px] text-muted-foreground text-center leading-tight">
                          Nurses
                        </span>
                      </div>
                      <div className="bg-muted/40 rounded-lg p-2.5 flex flex-col items-center gap-1">
                        <Heart
                          size={14}
                          className="text-purple-600 dark:text-purple-400"
                        />
                        <span className="font-bold text-base text-foreground leading-none">
                          {stats.caregiverCount}
                        </span>
                        <span className="text-[10px] text-muted-foreground text-center leading-tight">
                          Carers
                        </span>
                      </div>
                      <div
                        className={`rounded-lg p-2.5 flex flex-col items-center gap-1 ${
                          stats.activeAlerts > 0
                            ? "bg-red-50 dark:bg-red-950/30"
                            : "bg-muted/40"
                        }`}
                      >
                        {stats.activeAlerts > 0 ? (
                          <AlertTriangle
                            size={14}
                            className="text-red-600 dark:text-red-400"
                          />
                        ) : (
                          <Bell
                            size={14}
                            className="text-muted-foreground/60"
                          />
                        )}
                        <span
                          className={`font-bold text-base leading-none ${
                            stats.activeAlerts > 0
                              ? "text-red-600 dark:text-red-400"
                              : "text-foreground"
                          }`}
                        >
                          {stats.activeAlerts}
                        </span>
                        <span className="text-[10px] text-muted-foreground text-center leading-tight">
                          Alerts
                        </span>
                      </div>
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
