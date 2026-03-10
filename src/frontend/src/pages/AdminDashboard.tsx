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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  BedDouble,
  Bell,
  Camera,
  Check,
  ChevronRight,
  Cpu,
  Heart,
  Phone,
  Plus,
  Search,
  Stethoscope,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "../components/AppShell";
import { BackButton } from "../components/BackButton";
import {
  AlertTypeIcon,
  AlertTypeLabel,
  StatusBadge,
} from "../components/StatusBadge";
import {
  type Device,
  type FamilyMember,
  type Hospital,
  type Nurse,
  type Patient,
  useApp,
} from "../context/AppContext";

import { formatDistanceToNow } from "../utils/formatTime";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function AdminDashboard() {
  const {
    patients,
    alerts,
    nurses,
    caregivers,
    hospitals,
    familyMembers,
    currentUser,
    setPatients,
    setNurses,
    setFamilyMembers,
    assignments,
    setAssignments,
    devices,
    setDevices,
  } = useApp();

  const adminHospital = hospitals.find((h) => h.id === currentUser?.hospitalId);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Modal states
  const [addPatientOpen, setAddPatientOpen] = useState(false);
  const [addNurseOpen, setAddNurseOpen] = useState(false);
  const [addAssignmentOpen, setAddAssignmentOpen] = useState(false);

  // Add Device
  const [addDeviceOpen, setAddDeviceOpen] = useState(false);
  const [addDevicePatientId, setAddDevicePatientId] = useState<string>("");
  const [deviceForm, setDeviceForm] = useState({ serialNumber: "", model: "" });

  // Add family member to existing patient
  const [addFamilyToPatientOpen, setAddFamilyToPatientOpen] = useState(false);
  const [targetPatientId, setTargetPatientId] = useState<string>("");
  const [addFamilyForm, setAddFamilyForm] = useState({
    name: "",
    relation: "",
    contactNumber: "",
    photoPreview: "",
  });
  const addFamilyPhotoRef = useRef<HTMLInputElement>(null);

  // Patient photo
  const [patientPhotoPreview, setPatientPhotoPreview] = useState<string>("");
  const patientPhotoInputRef = useRef<HTMLInputElement>(null);

  // Family members form state
  type FamilyMemberFormEntry = {
    formId: string;
    name: string;
    relation: string;
    contactNumber: string;
    photoPreview: string;
  };
  const [familyMembersFormEntries, setFamilyMembersFormEntries] = useState<
    FamilyMemberFormEntry[]
  >([
    {
      formId: `fm-${Date.now()}`,
      name: "",
      relation: "",
      contactNumber: "",
      photoPreview: "",
    },
  ]);
  const familyPhotoInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Forms
  const [nurseForm, setNurseForm] = useState({ name: "", hospitalId: "h1" });
  const [patientForm, setPatientForm] = useState({
    name: "",
    age: "",
    bloodGroup: "O+",
    bedNumber: "",
    hospitalId: "h1",
    medicalHistory: "",
    emergencyContact: "",
  });
  const [assignmentForm, setAssignmentForm] = useState({
    patientId: "",
    nurseId: "",
    caregiverId: "",
  });

  const handlePatientPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPatientPhotoPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFamilyPhotoChange = (
    formId: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFamilyMembersFormEntries((prev) =>
        prev.map((entry) =>
          entry.formId === formId
            ? { ...entry, photoPreview: ev.target?.result as string }
            : entry,
        ),
      );
    };
    reader.readAsDataURL(file);
  };

  const addFamilyMemberEntry = () => {
    setFamilyMembersFormEntries((prev) => [
      ...prev,
      {
        formId: `fm-${Date.now()}`,
        name: "",
        relation: "",
        contactNumber: "",
        photoPreview: "",
      },
    ]);
  };

  const removeFamilyMemberEntry = (formId: string) => {
    setFamilyMembersFormEntries((prev) =>
      prev.filter((e) => e.formId !== formId),
    );
  };

  const updateFamilyMemberEntry = (
    formId: string,
    field: keyof FamilyMemberFormEntry,
    value: string,
  ) => {
    setFamilyMembersFormEntries((prev) =>
      prev.map((entry) =>
        entry.formId === formId ? { ...entry, [field]: value } : entry,
      ),
    );
  };

  const resetPatientDialog = () => {
    setPatientPhotoPreview("");
    setFamilyMembersFormEntries([
      {
        formId: `fm-${Date.now()}`,
        name: "",
        relation: "",
        contactNumber: "",
        photoPreview: "",
      },
    ]);
    setPatientForm({
      name: "",
      age: "",
      bloodGroup: "O+",
      bedNumber: "",
      hospitalId: "h1",
      medicalHistory: "",
      emergencyContact: "",
    });
  };

  const handleAddDevice = () => {
    if (!deviceForm.serialNumber.trim()) {
      toast.error("Serial number is required");
      return;
    }
    const newDevice: Device = {
      id: `dev${Date.now()}`,
      patientId: addDevicePatientId,
      serialNumber: deviceForm.serialNumber.trim(),
      model: deviceForm.model.trim() || "Paryavekshan Monitor v1",
      status: "active",
      registeredAt: new Date().toISOString(),
    };
    // Remove any existing device for this patient first (one device per patient)
    setDevices((prev) => [
      ...prev.filter((d) => d.patientId !== addDevicePatientId),
      newDevice,
    ]);
    setAddDeviceOpen(false);
    setDeviceForm({ serialNumber: "", model: "" });
    setAddDevicePatientId("");
    toast.success("Device registered for patient");
  };

  const unresolvedAlerts = alerts.filter((a) => !a.resolved);
  const _criticalAlerts = alerts.filter((a) => a.severity === "critical");
  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.bedNumber.toLowerCase().includes(search.toLowerCase()),
  );

  const generateUniqueCode = () =>
    `PKR-${new Date().getFullYear()}-${String(patients.length + 1).padStart(3, "0")}`;

  const handleAddNurse = () => {
    if (!nurseForm.name) {
      toast.error("Enter nurse name");
      return;
    }
    const newN: Nurse = {
      id: `n${Date.now()}`,
      name: nurseForm.name,
      hospitalId: nurseForm.hospitalId,
      assignedPatientIds: [],
      isAvailable: true,
    };
    setNurses((prev) => [...prev, newN]);
    setAddNurseOpen(false);
    setNurseForm({ name: "", hospitalId: "h1" });
    toast.success("Nurse added successfully");
  };

  const handleAddFamilyToPatient = () => {
    if (!addFamilyForm.name.trim() || !addFamilyForm.relation.trim()) {
      toast.error("Name and relation are required");
      return;
    }
    const newFM: FamilyMember = {
      id: `f${Date.now()}`,
      name: addFamilyForm.name.trim(),
      relation: addFamilyForm.relation.trim(),
      patientId: targetPatientId,
      photoUrl: addFamilyForm.photoPreview || undefined,
      contactNumber: addFamilyForm.contactNumber.trim() || undefined,
    };
    setFamilyMembers((prev) => [...prev, newFM]);
    setPatients((prev) =>
      prev.map((p) =>
        p.id === targetPatientId
          ? { ...p, familyMemberIds: [...p.familyMemberIds, newFM.id] }
          : p,
      ),
    );
    setAddFamilyToPatientOpen(false);
    setAddFamilyForm({
      name: "",
      relation: "",
      contactNumber: "",
      photoPreview: "",
    });
    setTargetPatientId("");
    toast.success("Family member added to patient");
  };

  const handleAddPatient = () => {
    if (!patientForm.name || !patientForm.age || !patientForm.bedNumber) {
      toast.error("Fill in required fields");
      return;
    }

    const patientId = `p${Date.now()}`;

    // Build family member objects for valid entries
    const validFamilyEntries = familyMembersFormEntries.filter((fm) =>
      fm.name.trim(),
    );
    const newFamilyMembers: FamilyMember[] = validFamilyEntries.map(
      (fm, idx) => ({
        id: `f${Date.now()}_${idx}`,
        name: fm.name.trim(),
        relation: fm.relation.trim() || "Family",
        patientId,
        photoUrl: fm.photoPreview || undefined,
        contactNumber: fm.contactNumber.trim() || undefined,
      }),
    );

    const newP: Patient = {
      id: patientId,
      name: patientForm.name,
      age: Number.parseInt(patientForm.age),
      photoUrl: patientPhotoPreview || undefined,
      bedNumber: patientForm.bedNumber,
      hospitalId: patientForm.hospitalId,
      bloodGroup: patientForm.bloodGroup,
      medicalHistory:
        patientForm.medicalHistory || "No medical history provided.",
      familyMemberIds: newFamilyMembers.map((fm) => fm.id),
      salineLevel: 100,
      postureStatus: "Sitting",
      uniqueCode: generateUniqueCode(),
      emergencyContacts: patientForm.emergencyContact
        ? [patientForm.emergencyContact]
        : [],
      isActive: true,
    };

    setPatients((prev) => [...prev, newP]);
    if (newFamilyMembers.length > 0) {
      setFamilyMembers((prev) => [...prev, ...newFamilyMembers]);
    }
    setAddPatientOpen(false);
    resetPatientDialog();
    toast.success(`Patient ${newP.name} added with code ${newP.uniqueCode}`);
  };

  const handleAddAssignment = () => {
    if (!assignmentForm.patientId || !assignmentForm.nurseId) {
      toast.error("Select patient and nurse");
      return;
    }
    const newAssignment = {
      id: `as${Date.now()}`,
      patientId: assignmentForm.patientId,
      nurseId: assignmentForm.nurseId,
      caregiverId: assignmentForm.caregiverId || undefined,
      status: "accepted" as const,
      createdAt: new Date().toISOString(),
    };
    setAssignments((prev) => [...prev, newAssignment]);
    setAddAssignmentOpen(false);
    setAssignmentForm({ patientId: "", nurseId: "", caregiverId: "" });
    toast.success("Assignment created successfully");
  };

  return (
    <AppShell>
      <div className="p-4 md:p-6">
        <BackButton variant="inline" />
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-foreground">
            {adminHospital ? adminHospital.name : "Admin Dashboard"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Hospital management and patient oversight
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full overflow-x-auto flex-nowrap justify-start h-auto p-1 mb-6 gap-1">
            <TabsTrigger
              value="overview"
              className="text-xs px-3"
              data-ocid="admin.overview_tab"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="nurses"
              className="text-xs px-3"
              data-ocid="admin.nurses_tab"
            >
              Nurses
            </TabsTrigger>
            <TabsTrigger
              value="patients"
              className="text-xs px-3"
              data-ocid="admin.patients_tab"
            >
              Patients
            </TabsTrigger>
            <TabsTrigger value="caregivers" className="text-xs px-3">
              Caregivers
            </TabsTrigger>
            <TabsTrigger value="assignments" className="text-xs px-3">
              Assignments
            </TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs px-3">
              Alerts
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6 mt-0">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                {
                  label: "Total Patients",
                  value: patients.length,
                  icon: <BedDouble size={20} />,
                  color: "text-green-600",
                  bg: "bg-green-50 dark:bg-green-900/20",
                },
                {
                  label: "Total Nurses",
                  value: nurses.length,
                  icon: <Stethoscope size={20} />,
                  color: "text-teal-600",
                  bg: "bg-teal-50 dark:bg-teal-900/20",
                },
                {
                  label: "Active Alerts",
                  value: unresolvedAlerts.length,
                  icon: <Bell size={20} />,
                  color: "text-red-600",
                  bg: "bg-red-50 dark:bg-red-900/20",
                  urgent: unresolvedAlerts.length > 0,
                },
              ].map((stat) => (
                <Card
                  key={stat.label}
                  className={cn(
                    "border-0 shadow-medical",
                    stat.urgent && "ring-2 ring-destructive/30",
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {stat.label}
                        </p>
                        <p
                          className={cn(
                            "text-3xl font-display font-bold",
                            stat.urgent
                              ? "text-destructive"
                              : "text-foreground",
                          )}
                        >
                          {stat.value}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          stat.bg,
                        )}
                      >
                        <span className={stat.color}>{stat.icon}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Critical patients */}
            {patients.some(
              (p) => p.postureStatus === "Fallen" || p.salineLevel < 5,
            ) && (
              <Card className="border-destructive/30 bg-red-50/50 dark:bg-red-950/20 shadow-medical">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-destructive flex items-center gap-2">
                    <AlertTriangle size={16} className="animate-bounce" />
                    Critical Patients — Immediate Attention Required
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {patients
                    .filter(
                      (p) => p.postureStatus === "Fallen" || p.salineLevel < 5,
                    )
                    .map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-3 bg-red-100/50 dark:bg-red-900/20 rounded-lg"
                      >
                        <div>
                          <p className="font-semibold text-sm text-foreground">
                            {p.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Bed {p.bedNumber}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {p.postureStatus === "Fallen" && (
                            <StatusBadge severity="critical" label="FALLEN" />
                          )}
                          {p.salineLevel < 5 && (
                            <StatusBadge
                              severity="critical"
                              label="SALINE CRITICAL"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            )}

            {/* Recent Alerts */}
            <Card className="shadow-medical border-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">
                    Recent Alerts
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setActiveTab("alerts")}
                  >
                    View all <ChevronRight size={12} className="ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {alerts.slice(0, 5).map((alert) => {
                    const patient = patients.find(
                      (p) => p.id === alert.patientId,
                    );
                    return (
                      <div
                        key={alert.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/40"
                      >
                        <AlertTypeIcon type={alert.alertType} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            <AlertTypeLabel type={alert.alertType} /> —{" "}
                            {patient?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(alert.timestamp)}
                          </p>
                        </div>
                        <StatusBadge severity={alert.severity as any} />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NURSES TAB */}
          <TabsContent value="nurses" className="mt-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">
                Nurses ({nurses.length})
              </h2>
              <Dialog open={addNurseOpen} onOpenChange={setAddNurseOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" data-ocid="admin.add_nurse_button">
                    <Plus size={14} className="mr-1" /> Add Nurse
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Nurse</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    <div className="space-y-1.5">
                      <Label>Nurse Name</Label>
                      <Input
                        placeholder="Dr. Anjali Singh"
                        value={nurseForm.name}
                        onChange={(e) =>
                          setNurseForm({ ...nurseForm, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Hospital</Label>
                      <Select
                        value={nurseForm.hospitalId}
                        onValueChange={(v) =>
                          setNurseForm({ ...nurseForm, hospitalId: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {hospitals.map((h) => (
                            <SelectItem key={h.id} value={h.id}>
                              {h.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setAddNurseOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddNurse}>Add Nurse</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nurses.map((n, i) => (
                <Card
                  key={n.id}
                  className="shadow-medical border-0"
                  data-ocid={`admin.nurse.item.${i + 1}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                        <span className="text-sm font-bold text-teal-700 dark:text-teal-400">
                          {n.name
                            .split(" ")
                            .map((x) => x[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground text-sm">
                          {n.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {hospitals.find((h) => h.id === n.hospitalId)?.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {n.assignedPatientIds.length} patients assigned
                        </p>
                      </div>
                      <Badge
                        variant={n.isAvailable ? "default" : "secondary"}
                        className={cn(
                          "text-xs",
                          n.isAvailable
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0"
                            : "",
                        )}
                      >
                        {n.isAvailable ? "Available" : "Busy"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* PATIENTS TAB */}
          <TabsContent value="patients" className="mt-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
              <div className="relative flex-1 w-full">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Search patients..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9 text-sm"
                  data-ocid="admin.patient_search_input"
                />
              </div>
              <Dialog
                open={addPatientOpen}
                onOpenChange={(open) => {
                  setAddPatientOpen(open);
                  if (!open) resetPatientDialog();
                }}
              >
                <DialogTrigger asChild>
                  <Button size="sm" data-ocid="admin.add_patient_button">
                    <Plus size={14} className="mr-1" /> Add Patient
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add New Patient</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2 max-h-[80vh] overflow-y-auto pr-1">
                    {/* Patient Photo Upload */}
                    <div className="space-y-2">
                      <Label>Patient Photo</Label>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0 border-2 border-dashed border-border">
                          {patientPhotoPreview ? (
                            <img
                              src={patientPhotoPreview}
                              alt="Patient preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Camera
                              size={20}
                              className="text-muted-foreground"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <input
                            ref={patientPhotoInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePatientPhotoChange}
                            data-ocid="admin.patient_photo.upload_button"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() =>
                              patientPhotoInputRef.current?.click()
                            }
                          >
                            <Camera size={12} className="mr-1.5" />
                            {patientPhotoPreview
                              ? "Change Photo"
                              : "Upload Photo"}
                          </Button>
                          {patientPhotoPreview && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-xs text-destructive ml-2"
                              onClick={() => {
                                setPatientPhotoPreview("");
                                if (patientPhotoInputRef.current)
                                  patientPhotoInputRef.current.value = "";
                              }}
                            >
                              <X size={12} className="mr-1" /> Remove
                            </Button>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            JPG, PNG up to 5MB
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Full Name *</Label>
                        <Input
                          placeholder="Ramesh Kumar"
                          value={patientForm.name}
                          onChange={(e) =>
                            setPatientForm({
                              ...patientForm,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Age *</Label>
                        <Input
                          type="number"
                          placeholder="65"
                          value={patientForm.age}
                          onChange={(e) =>
                            setPatientForm({
                              ...patientForm,
                              age: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Blood Group</Label>
                        <Select
                          value={patientForm.bloodGroup}
                          onValueChange={(v) =>
                            setPatientForm({ ...patientForm, bloodGroup: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {BLOOD_GROUPS.map((bg) => (
                              <SelectItem key={bg} value={bg}>
                                {bg}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Bed Number *</Label>
                        <Input
                          placeholder="A-101"
                          value={patientForm.bedNumber}
                          onChange={(e) =>
                            setPatientForm({
                              ...patientForm,
                              bedNumber: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Hospital</Label>
                      <Select
                        value={patientForm.hospitalId}
                        onValueChange={(v) =>
                          setPatientForm({ ...patientForm, hospitalId: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {hospitals.map((h) => (
                            <SelectItem key={h.id} value={h.id}>
                              {h.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Medical History</Label>
                      <Textarea
                        placeholder="Known conditions, allergies, medications..."
                        value={patientForm.medicalHistory}
                        onChange={(e) =>
                          setPatientForm({
                            ...patientForm,
                            medicalHistory: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Emergency Contact</Label>
                      <Input
                        placeholder="Name: +91 98765 XXXXX"
                        value={patientForm.emergencyContact}
                        onChange={(e) =>
                          setPatientForm({
                            ...patientForm,
                            emergencyContact: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Family Members Section */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">
                          Family Members
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 gap-1"
                          onClick={addFamilyMemberEntry}
                          data-ocid="admin.family_member.add_button"
                        >
                          <UserPlus size={12} />
                          Add Member
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {familyMembersFormEntries.map((fm, idx) => (
                          <div
                            key={fm.formId}
                            className="rounded-xl border border-border bg-muted/30 p-3 space-y-3"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-medium text-muted-foreground">
                                Family Member {idx + 1}
                              </p>
                              {familyMembersFormEntries.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                  onClick={() =>
                                    removeFamilyMemberEntry(fm.formId)
                                  }
                                  data-ocid={`admin.family_member.remove_button.${idx + 1}`}
                                >
                                  <Trash2 size={12} />
                                </Button>
                              )}
                            </div>

                            {/* Photo */}
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center overflow-hidden shrink-0 border-2 border-dashed border-border">
                                {fm.photoPreview ? (
                                  <img
                                    src={fm.photoPreview}
                                    alt={`Family member ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Camera
                                    size={14}
                                    className="text-muted-foreground"
                                  />
                                )}
                              </div>
                              <div>
                                <input
                                  ref={(el) => {
                                    familyPhotoInputRefs.current[idx] = el;
                                  }}
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) =>
                                    handleFamilyPhotoChange(fm.formId, e)
                                  }
                                  data-ocid={`admin.family_member.photo.upload_button.${idx + 1}`}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-7"
                                  onClick={() =>
                                    familyPhotoInputRefs.current[idx]?.click()
                                  }
                                >
                                  <Camera size={10} className="mr-1" />
                                  {fm.photoPreview ? "Change" : "Upload Photo"}
                                </Button>
                              </div>
                            </div>

                            {/* Name + Relation */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <Label className="text-xs">Name</Label>
                                <Input
                                  placeholder="Sunita Kumar"
                                  value={fm.name}
                                  onChange={(e) =>
                                    updateFamilyMemberEntry(
                                      fm.formId,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                  className="h-8 text-xs"
                                  data-ocid={`admin.family_member.name_input.${idx + 1}`}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Relation</Label>
                                <Input
                                  placeholder="Wife, Son..."
                                  value={fm.relation}
                                  onChange={(e) =>
                                    updateFamilyMemberEntry(
                                      fm.formId,
                                      "relation",
                                      e.target.value,
                                    )
                                  }
                                  className="h-8 text-xs"
                                />
                              </div>
                            </div>

                            {/* Contact Number */}
                            <div className="space-y-1">
                              <Label className="text-xs flex items-center gap-1">
                                <Phone size={10} />
                                Contact Number
                              </Label>
                              <Input
                                placeholder="+91 98765 XXXXX"
                                value={fm.contactNumber}
                                onChange={(e) =>
                                  updateFamilyMemberEntry(
                                    fm.formId,
                                    "contactNumber",
                                    e.target.value,
                                  )
                                }
                                className="h-8 text-xs"
                                data-ocid={`admin.family_member.contact_input.${idx + 1}`}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-muted/40 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">
                        Unique Code will be auto-generated:{" "}
                        <span className="font-mono font-semibold text-foreground">
                          {generateUniqueCode()}
                        </span>
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAddPatientOpen(false);
                        resetPatientDialog();
                      }}
                      data-ocid="admin.patient_dialog.cancel_button"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddPatient}
                      data-ocid="admin.patient_dialog.confirm_button"
                    >
                      Add Patient
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {filteredPatients.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="admin.patient_list.empty_state"
              >
                <BedDouble size={36} className="mx-auto mb-3 opacity-30" />
                <p>No patients found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredPatients.map((patient, i) => {
                  const isAlert =
                    patient.postureStatus === "Fallen" ||
                    patient.salineLevel < 20;
                  const nurse = nurses.find((n) => n.id === patient.nurseId);
                  return (
                    <Card
                      key={patient.id}
                      className={cn(
                        "shadow-medical border-0 cursor-pointer hover:shadow-medical-lg transition-all",
                        isAlert && "ring-1 ring-destructive/30",
                      )}
                      onClick={() =>
                        navigate({ to: `/admin/patient/${patient.id}` })
                      }
                      data-ocid={`admin.patient.item.${i + 1}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={cn(
                              "w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold overflow-hidden shrink-0",
                              isAlert ? "bg-red-500" : "bg-primary/80",
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
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground truncate">
                              {patient.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Age {patient.age} · Bed {patient.bedNumber}
                            </p>
                          </div>
                          <StatusBadge
                            severity={isAlert ? "critical" : "normal"}
                            label={isAlert ? "Alert" : "Normal"}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-muted/40 rounded-lg p-2">
                            <p className="text-muted-foreground">Posture</p>
                            <p
                              className={cn(
                                "font-medium mt-0.5",
                                patient.postureStatus === "Fallen" &&
                                  "text-destructive",
                              )}
                            >
                              {patient.postureStatus}
                            </p>
                          </div>
                          <div className="bg-muted/40 rounded-lg p-2">
                            <p className="text-muted-foreground">Saline</p>
                            <p
                              className={cn(
                                "font-medium mt-0.5",
                                patient.salineLevel < 5
                                  ? "text-destructive"
                                  : patient.salineLevel < 20
                                    ? "text-yellow-600"
                                    : "text-green-600",
                              )}
                            >
                              {patient.salineLevel}%
                            </p>
                          </div>
                        </div>
                        {nurse && (
                          <p className="text-xs text-muted-foreground mt-2 truncate">
                            👩‍⚕️ {nurse.name}
                          </p>
                        )}

                        {/* Family Members strip */}
                        {(() => {
                          const patientFamily = familyMembers.filter((fm) =>
                            patient.familyMemberIds.includes(fm.id),
                          );
                          if (patientFamily.length === 0) return null;
                          const visible = patientFamily.slice(0, 4);
                          const extra = patientFamily.length - visible.length;
                          return (
                            <div className="mt-2 pt-2 border-t border-border/60 flex items-center gap-1.5">
                              <span className="text-xs text-muted-foreground font-medium">
                                Family:
                              </span>
                              <div className="flex items-center">
                                {visible.map((fm, fmIdx) => (
                                  <Avatar
                                    key={fm.id}
                                    className={`h-6 w-6 border-2 border-background ${fmIdx > 0 ? "-ml-2" : ""}`}
                                    title={`${fm.name} (${fm.relation})`}
                                  >
                                    <AvatarImage
                                      src={fm.photoUrl}
                                      alt={fm.name}
                                      className="object-cover"
                                    />
                                    <AvatarFallback className="text-[8px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                                      {fm.name
                                        .split(" ")
                                        .map((x) => x[0])
                                        .join("")
                                        .slice(0, 2)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                                {extra > 0 && (
                                  <div className="h-6 w-6 -ml-2 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                                    +{extra}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}

                        <div className="flex gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs h-7 gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate({ to: `/admin/patient/${patient.id}` });
                            }}
                            data-ocid={`admin.patient.manage_button.${i + 1}`}
                          >
                            <UserPlus size={12} /> Manage
                          </Button>
                          {(() => {
                            const patientDevice = devices.find(
                              (d) => d.patientId === patient.id,
                            );
                            return (
                              <Button
                                size="sm"
                                variant={
                                  patientDevice ? "secondary" : "default"
                                }
                                className="flex-1 text-xs h-7 gap-1"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAddDevicePatientId(patient.id);
                                  setDeviceForm({
                                    serialNumber:
                                      patientDevice?.serialNumber || "",
                                    model: patientDevice?.model || "",
                                  });
                                  setAddDeviceOpen(true);
                                }}
                                data-ocid={`admin.patient.add_device_button.${i + 1}`}
                              >
                                <Cpu size={12} />
                                {patientDevice ? "View Device" : "Add Device"}
                              </Button>
                            );
                          })()}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* CAREGIVERS TAB */}
          <TabsContent value="caregivers" className="mt-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">
                Caregivers ({caregivers.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {caregivers.map((c, i) => (
                <Card
                  key={c.id}
                  className="shadow-medical border-0"
                  data-ocid={`admin.caregiver.item.${i + 1}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Heart
                          size={18}
                          className="text-purple-600 dark:text-purple-400"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground text-sm">
                          {c.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {hospitals.find((h) => h.id === c.hospitalId)?.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {c.assignedPatientIds.length} patients assigned
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ASSIGNMENTS TAB */}
          <TabsContent value="assignments" className="mt-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">
                Assignments ({assignments.length})
              </h2>
              <Dialog
                open={addAssignmentOpen}
                onOpenChange={setAddAssignmentOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus size={14} className="mr-1" /> Create Assignment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Assignment</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    <div className="space-y-1.5">
                      <Label>Patient</Label>
                      <Select
                        value={assignmentForm.patientId}
                        onValueChange={(v) =>
                          setAssignmentForm({ ...assignmentForm, patientId: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select patient" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} — Bed {p.bedNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Nurse</Label>
                      <Select
                        value={assignmentForm.nurseId}
                        onValueChange={(v) =>
                          setAssignmentForm({ ...assignmentForm, nurseId: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select nurse" />
                        </SelectTrigger>
                        <SelectContent>
                          {nurses.map((n) => (
                            <SelectItem key={n.id} value={n.id}>
                              {n.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Caregiver (optional)</Label>
                      <Select
                        value={assignmentForm.caregiverId}
                        onValueChange={(v) =>
                          setAssignmentForm({
                            ...assignmentForm,
                            caregiverId: v,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select caregiver" />
                        </SelectTrigger>
                        <SelectContent>
                          {caregivers.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setAddAssignmentOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddAssignment}>Create</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Nurse</TableHead>
                    <TableHead>Caregiver</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((a, i) => {
                    const patient = patients.find((p) => p.id === a.patientId);
                    const nurse = nurses.find((n) => n.id === a.nurseId);
                    const caregiver = caregivers.find(
                      (c) => c.id === a.caregiverId,
                    );
                    return (
                      <TableRow
                        key={a.id}
                        data-ocid={`admin.assignment.item.${i + 1}`}
                      >
                        <TableCell className="font-medium text-sm">
                          {patient?.name || "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {nurse?.name || "—"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {caregiver?.name || "—"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            severity={
                              a.status === "accepted"
                                ? "normal"
                                : a.status === "pending"
                                  ? "warning"
                                  : "critical"
                            }
                            label={a.status}
                          />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDistanceToNow(a.createdAt)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* ALERTS TAB */}
          <TabsContent value="alerts" className="mt-0">
            <AlertsTabContent />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Family Member to Patient Dialog */}
      <Dialog
        open={addFamilyToPatientOpen}
        onOpenChange={(open) => {
          setAddFamilyToPatientOpen(open);
          if (!open) {
            setAddFamilyForm({
              name: "",
              relation: "",
              contactNumber: "",
              photoPreview: "",
            });
            setTargetPatientId("");
          }
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
                {addFamilyForm.photoPreview ? (
                  <img
                    src={addFamilyForm.photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera size={20} className="text-muted-foreground" />
                )}
              </div>
              <div>
                <input
                  ref={addFamilyPhotoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) =>
                      setAddFamilyForm((f) => ({
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
                  onClick={() => addFamilyPhotoRef.current?.click()}
                  data-ocid="admin.add_family_modal.upload_button"
                >
                  <Camera size={12} className="mr-1" />
                  {addFamilyForm.photoPreview ? "Change Photo" : "Upload Photo"}
                </Button>
              </div>
            </div>
            {/* Name */}
            <div className="space-y-1.5">
              <Label>Full Name *</Label>
              <Input
                placeholder="Sunita Kumar"
                value={addFamilyForm.name}
                onChange={(e) =>
                  setAddFamilyForm((f) => ({ ...f, name: e.target.value }))
                }
                data-ocid="admin.add_family_modal.name_input"
              />
            </div>
            {/* Relation */}
            <div className="space-y-1.5">
              <Label>Relation *</Label>
              <Input
                placeholder="Wife, Son, Daughter..."
                value={addFamilyForm.relation}
                onChange={(e) =>
                  setAddFamilyForm((f) => ({ ...f, relation: e.target.value }))
                }
                data-ocid="admin.add_family_modal.relation_input"
              />
            </div>
            {/* Contact */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1">
                <Phone size={12} /> Contact Number
              </Label>
              <Input
                placeholder="+91 98765 XXXXX"
                value={addFamilyForm.contactNumber}
                onChange={(e) =>
                  setAddFamilyForm((f) => ({
                    ...f,
                    contactNumber: e.target.value,
                  }))
                }
                data-ocid="admin.add_family_modal.contact_input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddFamilyToPatientOpen(false)}
              data-ocid="admin.add_family_modal.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddFamilyToPatient}
              data-ocid="admin.add_family_modal.submit_button"
            >
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add / Edit Device Dialog ── */}
      <Dialog
        open={addDeviceOpen}
        onOpenChange={(o) => {
          setAddDeviceOpen(o);
          if (!o) {
            setDeviceForm({ serialNumber: "", model: "" });
            setAddDevicePatientId("");
          }
        }}
      >
        <DialogContent className="max-w-sm" data-ocid="admin.device_dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cpu size={18} className="text-primary" />
              {devices.find((d) => d.patientId === addDevicePatientId)
                ? "Update Device"
                : "Add Monitoring Device"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <p className="text-xs text-muted-foreground">
              This device provides saline level, hand gesture, live video,
              unknown person detection, and posture data. One device is
              dedicated per patient.
            </p>
            {/* Show existing device info if present */}
            {(() => {
              const existing = devices.find(
                (d) => d.patientId === addDevicePatientId,
              );
              if (!existing) return null;
              return (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 space-y-1">
                  <p className="text-xs font-semibold text-green-700 dark:text-green-400 flex items-center gap-1.5">
                    <Cpu size={12} /> Device Registered
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Serial:{" "}
                    <span className="font-mono font-semibold text-foreground">
                      {existing.serialNumber}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Model: {existing.model}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Status:{" "}
                    <span className="capitalize text-green-600 font-medium">
                      {existing.status}
                    </span>
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 text-destructive hover:text-destructive mt-1"
                    onClick={() => {
                      setDevices((prev) =>
                        prev.filter((d) => d.patientId !== addDevicePatientId),
                      );
                      setAddDeviceOpen(false);
                      toast.success("Device removed");
                    }}
                    data-ocid="admin.device_dialog.delete_button"
                  >
                    <X size={12} className="mr-1" /> Remove Device
                  </Button>
                </div>
              );
            })()}
            <div className="space-y-1.5">
              <Label>
                Serial Number <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="e.g. PRV-2024-A001"
                value={deviceForm.serialNumber}
                onChange={(e) =>
                  setDeviceForm((f) => ({
                    ...f,
                    serialNumber: e.target.value,
                  }))
                }
                data-ocid="admin.device_dialog.serial_input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Device Model</Label>
              <Input
                placeholder="Paryavekshan Monitor v1"
                value={deviceForm.model}
                onChange={(e) =>
                  setDeviceForm((f) => ({ ...f, model: e.target.value }))
                }
                data-ocid="admin.device_dialog.model_input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddDeviceOpen(false)}
              data-ocid="admin.device_dialog.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddDevice}
              data-ocid="admin.device_dialog.submit_button"
            >
              <Cpu size={14} className="mr-1" />
              {devices.find((d) => d.patientId === addDevicePatientId)
                ? "Update Device"
                : "Register Device"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function AlertsTabContent() {
  const { alerts, patients, resolveAlert: resolveAlertFn } = useApp();
  const [filter, setFilter] = useState("all");

  const filtered = alerts.filter((a) => {
    if (filter === "unresolved") return !a.resolved;
    if (filter === "critical")
      return a.severity === "critical" || a.severity === "high";
    return true;
  });

  return (
    <div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {["all", "unresolved", "critical"].map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            className="text-xs capitalize shrink-0"
            onClick={() => setFilter(f)}
            data-ocid="alerts.filter_tab"
          >
            {f === "all"
              ? "All"
              : f === "unresolved"
                ? "Unresolved"
                : "High/Critical"}
          </Button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.map((alert, i) => {
          const patient = patients.find((p) => p.id === alert.patientId);
          return (
            <div
              key={alert.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border",
                alert.resolved ? "bg-muted/20 opacity-70" : "bg-card shadow-xs",
              )}
              data-ocid={`admin.alert.item.${i + 1}`}
            >
              <AlertTypeIcon type={alert.alertType} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  <AlertTypeLabel type={alert.alertType} />
                </p>
                <p className="text-xs text-muted-foreground">
                  {patient?.name} · {formatDistanceToNow(alert.timestamp)}
                </p>
                {alert.notes && (
                  <p className="text-xs text-muted-foreground mt-0.5 italic">
                    {alert.notes}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge severity={alert.severity as any} />
                {!alert.resolved ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={() => {
                      resolveAlertFn(alert.id, "Resolved by admin");
                      toast.success("Alert resolved");
                    }}
                    data-ocid={`alerts.resolve_button.${i + 1}`}
                  >
                    <Check size={12} className="mr-1" /> Resolve
                  </Button>
                ) : (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0"
                  >
                    <Check size={10} className="mr-1" /> Resolved
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
