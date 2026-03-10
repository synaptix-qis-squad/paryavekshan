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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Camera,
  Check,
  Cpu,
  Heart,
  Monitor,
  Phone,
  Plus,
  Search,
  Stethoscope,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "../components/AppShell";
import { BackButton } from "../components/BackButton";
import { StatusBadge } from "../components/StatusBadge";
import {
  type Caregiver,
  type Device,
  type FamilyMember,
  type Nurse,
  useApp,
} from "../context/AppContext";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .map((x) => x[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ─── Assign Nurse Dialog ──────────────────────────────────────────────────────

interface AssignNurseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  currentNurseId?: string;
}

function AssignNurseDialog({
  open,
  onOpenChange,
  patientId,
  currentNurseId,
}: AssignNurseDialogProps) {
  const { nurses, setNurses, setPatients, hospitals } = useApp();
  const [tab, setTab] = useState<"existing" | "new">("existing");
  const [search, setSearch] = useState("");
  const [newNurseName, setNewNurseName] = useState("");

  const filtered = nurses.filter((n) =>
    n.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleConnect = (nurse: Nurse) => {
    // Remove from old nurse if any
    if (currentNurseId) {
      setNurses((prev) =>
        prev.map((n) =>
          n.id === currentNurseId
            ? {
                ...n,
                assignedPatientIds: n.assignedPatientIds.filter(
                  (id) => id !== patientId,
                ),
              }
            : n,
        ),
      );
    }
    // Assign to new nurse
    setNurses((prev) =>
      prev.map((n) =>
        n.id === nurse.id
          ? {
              ...n,
              assignedPatientIds: [
                ...new Set([...n.assignedPatientIds, patientId]),
              ],
            }
          : n,
      ),
    );
    setPatients((prev) =>
      prev.map((p) => (p.id === patientId ? { ...p, nurseId: nurse.id } : p)),
    );
    toast.success(`${nurse.name} assigned to patient`);
    onOpenChange(false);
  };

  const handleAddNew = () => {
    if (!newNurseName.trim()) {
      toast.error("Enter nurse name");
      return;
    }
    const newNurse: Nurse = {
      id: `n${Date.now()}`,
      name: newNurseName.trim(),
      hospitalId: hospitals[0]?.id || "h1",
      assignedPatientIds: [patientId],
      isAvailable: true,
    };
    // Remove from old nurse if any
    if (currentNurseId) {
      setNurses((prev) =>
        prev.map((n) =>
          n.id === currentNurseId
            ? {
                ...n,
                assignedPatientIds: n.assignedPatientIds.filter(
                  (id) => id !== patientId,
                ),
              }
            : n,
        ),
      );
    }
    setNurses((prev) => [...prev, newNurse]);
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId ? { ...p, nurseId: newNurse.id } : p,
      ),
    );
    toast.success(`Nurse ${newNurse.name} created and assigned`);
    setNewNurseName("");
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) {
          setSearch("");
          setNewNurseName("");
          setTab("existing");
        }
      }}
    >
      <DialogContent
        className="max-w-md"
        data-ocid="admin_patient.nurse_dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope size={18} className="text-teal-600" />
            Assign Nurse
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "existing" | "new")}
        >
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger
              value="existing"
              data-ocid="admin_patient.nurse_dialog.tab.1"
            >
              Select Existing
            </TabsTrigger>
            <TabsTrigger
              value="new"
              data-ocid="admin_patient.nurse_dialog.tab.2"
            >
              Add New
            </TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="mt-3 space-y-3">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search nurses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 text-sm"
                data-ocid="admin_patient.nurse_dialog.search_input"
              />
            </div>
            <ScrollArea className="h-64">
              <div className="space-y-2 pr-3">
                {filtered.length === 0 ? (
                  <div
                    className="text-center py-8 text-muted-foreground text-sm"
                    data-ocid="admin_patient.nurse_list.empty_state"
                  >
                    <Stethoscope
                      size={28}
                      className="mx-auto mb-2 opacity-30"
                    />
                    No nurses found
                  </div>
                ) : (
                  filtered.map((nurse, i) => {
                    const isConnected = nurse.id === currentNurseId;
                    return (
                      <div
                        key={nurse.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border transition-colors",
                          isConnected
                            ? "bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800"
                            : "bg-card border-border hover:bg-muted/40",
                        )}
                        data-ocid={`admin_patient.nurse_dialog.item.${i + 1}`}
                      >
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className="bg-teal-100 text-teal-700 text-xs font-bold dark:bg-teal-900/40 dark:text-teal-300">
                            {getInitials(nurse.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">
                            {nurse.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {nurse.assignedPatientIds.length} patients ·{" "}
                            <span
                              className={
                                nurse.isAvailable
                                  ? "text-green-600"
                                  : "text-orange-500"
                              }
                            >
                              {nurse.isAvailable ? "Available" : "Busy"}
                            </span>
                          </p>
                        </div>
                        {isConnected ? (
                          <Badge className="bg-teal-100 text-teal-700 border-0 text-xs dark:bg-teal-900/40 dark:text-teal-300 shrink-0">
                            <Check size={11} className="mr-1" /> Assigned
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs shrink-0"
                            onClick={() => handleConnect(nurse)}
                            data-ocid={`admin_patient.nurse_dialog.connect_button.${i + 1}`}
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="new" className="mt-3 space-y-3">
            <div className="space-y-1.5">
              <Label>Nurse Name *</Label>
              <Input
                placeholder="Dr. Anjali Singh"
                value={newNurseName}
                onChange={(e) => setNewNurseName(e.target.value)}
                data-ocid="admin_patient.nurse_dialog.name_input"
              />
            </div>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-ocid="admin_patient.nurse_dialog.cancel_button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddNew}
                data-ocid="admin_patient.nurse_dialog.submit_button"
              >
                <Plus size={14} className="mr-1" /> Add & Assign
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// ─── Assign Caregiver Dialog ──────────────────────────────────────────────────

interface AssignCaregiverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  currentCaregiverId?: string;
}

function AssignCaregiverDialog({
  open,
  onOpenChange,
  patientId,
  currentCaregiverId,
}: AssignCaregiverDialogProps) {
  const { caregivers, setCaregivers, setPatients, hospitals } = useApp();
  const [tab, setTab] = useState<"existing" | "new">("existing");
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");

  const filtered = caregivers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleConnect = (caregiver: Caregiver) => {
    if (currentCaregiverId) {
      setCaregivers((prev) =>
        prev.map((c) =>
          c.id === currentCaregiverId
            ? {
                ...c,
                assignedPatientIds: c.assignedPatientIds.filter(
                  (id) => id !== patientId,
                ),
              }
            : c,
        ),
      );
    }
    setCaregivers((prev) =>
      prev.map((c) =>
        c.id === caregiver.id
          ? {
              ...c,
              assignedPatientIds: [
                ...new Set([...c.assignedPatientIds, patientId]),
              ],
            }
          : c,
      ),
    );
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId ? { ...p, caregiverId: caregiver.id } : p,
      ),
    );
    toast.success(`${caregiver.name} assigned as caregiver`);
    onOpenChange(false);
  };

  const handleAddNew = () => {
    if (!newName.trim()) {
      toast.error("Enter caregiver name");
      return;
    }
    const newCaregiver: Caregiver = {
      id: `c${Date.now()}`,
      name: newName.trim(),
      hospitalId: hospitals[0]?.id || "h1",
      assignedPatientIds: [patientId],
    };
    if (currentCaregiverId) {
      setCaregivers((prev) =>
        prev.map((c) =>
          c.id === currentCaregiverId
            ? {
                ...c,
                assignedPatientIds: c.assignedPatientIds.filter(
                  (id) => id !== patientId,
                ),
              }
            : c,
        ),
      );
    }
    setCaregivers((prev) => [...prev, newCaregiver]);
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId ? { ...p, caregiverId: newCaregiver.id } : p,
      ),
    );
    toast.success(`Caregiver ${newCaregiver.name} created and assigned`);
    setNewName("");
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) {
          setSearch("");
          setNewName("");
          setTab("existing");
        }
      }}
    >
      <DialogContent
        className="max-w-md"
        data-ocid="admin_patient.caregiver_dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart size={18} className="text-purple-600" />
            Assign Caregiver
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "existing" | "new")}
        >
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger
              value="existing"
              data-ocid="admin_patient.caregiver_dialog.tab.1"
            >
              Select Existing
            </TabsTrigger>
            <TabsTrigger
              value="new"
              data-ocid="admin_patient.caregiver_dialog.tab.2"
            >
              Add New
            </TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="mt-3 space-y-3">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search caregivers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 text-sm"
                data-ocid="admin_patient.caregiver_dialog.search_input"
              />
            </div>
            <ScrollArea className="h-64">
              <div className="space-y-2 pr-3">
                {filtered.length === 0 ? (
                  <div
                    className="text-center py-8 text-muted-foreground text-sm"
                    data-ocid="admin_patient.caregiver_list.empty_state"
                  >
                    <Heart size={28} className="mx-auto mb-2 opacity-30" />
                    No caregivers found
                  </div>
                ) : (
                  filtered.map((caregiver, i) => {
                    const isConnected = caregiver.id === currentCaregiverId;
                    return (
                      <div
                        key={caregiver.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border transition-colors",
                          isConnected
                            ? "bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800"
                            : "bg-card border-border hover:bg-muted/40",
                        )}
                        data-ocid={`admin_patient.caregiver_dialog.item.${i + 1}`}
                      >
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarFallback className="bg-purple-100 text-purple-700 text-xs font-bold dark:bg-purple-900/40 dark:text-purple-300">
                            {getInitials(caregiver.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">
                            {caregiver.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {caregiver.assignedPatientIds.length} patients
                            assigned
                          </p>
                        </div>
                        {isConnected ? (
                          <Badge className="bg-purple-100 text-purple-700 border-0 text-xs dark:bg-purple-900/40 dark:text-purple-300 shrink-0">
                            <Check size={11} className="mr-1" /> Assigned
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs shrink-0"
                            onClick={() => handleConnect(caregiver)}
                            data-ocid={`admin_patient.caregiver_dialog.connect_button.${i + 1}`}
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="new" className="mt-3 space-y-3">
            <div className="space-y-1.5">
              <Label>Caregiver Name *</Label>
              <Input
                placeholder="Ravi Gupta"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                data-ocid="admin_patient.caregiver_dialog.name_input"
              />
            </div>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-ocid="admin_patient.caregiver_dialog.cancel_button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddNew}
                data-ocid="admin_patient.caregiver_dialog.submit_button"
              >
                <Plus size={14} className="mr-1" /> Add & Assign
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// ─── Add Family Member Dialog ─────────────────────────────────────────────────

interface AddFamilyMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  currentFamilyMemberIds: string[];
}

function AddFamilyMemberDialog({
  open,
  onOpenChange,
  patientId,
  currentFamilyMemberIds,
}: AddFamilyMemberDialogProps) {
  const { familyMembers, setFamilyMembers, setPatients } = useApp();
  const [tab, setTab] = useState<"existing" | "new">("existing");
  const [search, setSearch] = useState("");

  // New family member form
  const [newForm, setNewForm] = useState({
    name: "",
    relation: "",
    contactNumber: "",
    photoPreview: "",
  });
  const photoRef = useRef<HTMLInputElement>(null);

  // Filter out family members already linked to THIS patient
  // But show all registered family members for "connect" potential
  const filtered = familyMembers.filter((fm) =>
    fm.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleConnect = (fm: FamilyMember) => {
    const alreadyLinked = currentFamilyMemberIds.includes(fm.id);
    if (alreadyLinked) {
      toast.info(`${fm.name} is already linked to this patient`);
      return;
    }
    setFamilyMembers((prev) =>
      prev.map((f) => (f.id === fm.id ? { ...f, patientId } : f)),
    );
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? { ...p, familyMemberIds: [...p.familyMemberIds, fm.id] }
          : p,
      ),
    );
    toast.success(`${fm.name} connected to patient`);
    onOpenChange(false);
  };

  const handleAddNew = () => {
    if (!newForm.name.trim() || !newForm.relation.trim()) {
      toast.error("Name and relation are required");
      return;
    }
    const newFM: FamilyMember = {
      id: `f${Date.now()}`,
      name: newForm.name.trim(),
      relation: newForm.relation.trim(),
      patientId,
      photoUrl: newForm.photoPreview || undefined,
      contactNumber: newForm.contactNumber.trim() || undefined,
    };
    setFamilyMembers((prev) => [...prev, newFM]);
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? { ...p, familyMemberIds: [...p.familyMemberIds, newFM.id] }
          : p,
      ),
    );
    toast.success(`${newFM.name} added as family member`);
    setNewForm({ name: "", relation: "", contactNumber: "", photoPreview: "" });
    onOpenChange(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) =>
      setNewForm((f) => ({ ...f, photoPreview: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) {
          setSearch("");
          setNewForm({
            name: "",
            relation: "",
            contactNumber: "",
            photoPreview: "",
          });
          setTab("existing");
        }
      }}
    >
      <DialogContent
        className="max-w-md"
        data-ocid="admin_patient.family_dialog"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users size={18} className="text-blue-600" />
            Add Family Member
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "existing" | "new")}
        >
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger
              value="existing"
              data-ocid="admin_patient.family_dialog.tab.1"
            >
              Select Existing
            </TabsTrigger>
            <TabsTrigger
              value="new"
              data-ocid="admin_patient.family_dialog.tab.2"
            >
              Add New
            </TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="mt-3 space-y-3">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search family members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9 text-sm"
                data-ocid="admin_patient.family_dialog.search_input"
              />
            </div>
            <ScrollArea className="h-64">
              <div className="space-y-2 pr-3">
                {filtered.length === 0 ? (
                  <div
                    className="text-center py-8 text-muted-foreground text-sm"
                    data-ocid="admin_patient.family_list.empty_state"
                  >
                    <Users size={28} className="mx-auto mb-2 opacity-30" />
                    No registered family members found
                  </div>
                ) : (
                  filtered.map((fm, i) => {
                    const isLinked = currentFamilyMemberIds.includes(fm.id);
                    return (
                      <div
                        key={fm.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border transition-colors",
                          isLinked
                            ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                            : "bg-card border-border hover:bg-muted/40",
                        )}
                        data-ocid={`admin_patient.family_dialog.item.${i + 1}`}
                      >
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarImage src={fm.photoUrl} alt={fm.name} />
                          <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900/40 dark:text-blue-300">
                            {getInitials(fm.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">
                            {fm.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {fm.relation}
                            {fm.contactNumber && ` · ${fm.contactNumber}`}
                          </p>
                        </div>
                        {isLinked ? (
                          <Badge className="bg-blue-100 text-blue-700 border-0 text-xs dark:bg-blue-900/40 dark:text-blue-300 shrink-0">
                            <Check size={11} className="mr-1" /> Linked
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs shrink-0"
                            onClick={() => handleConnect(fm)}
                            data-ocid={`admin_patient.family_dialog.connect_button.${i + 1}`}
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="new" className="mt-3 space-y-3">
            {/* Photo upload */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0 border-2 border-dashed border-border">
                {newForm.photoPreview ? (
                  <img
                    src={newForm.photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera size={18} className="text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <input
                  ref={photoRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                  data-ocid="admin_patient.family_dialog.upload_button"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => photoRef.current?.click()}
                >
                  <Camera size={11} className="mr-1" />
                  {newForm.photoPreview ? "Change Photo" : "Upload Photo"}
                </Button>
                {newForm.photoPreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs h-6 text-destructive"
                    onClick={() => {
                      setNewForm((f) => ({ ...f, photoPreview: "" }));
                      if (photoRef.current) photoRef.current.value = "";
                    }}
                  >
                    <X size={11} className="mr-1" /> Remove
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Full Name *</Label>
                <Input
                  placeholder="Sunita Kumar"
                  value={newForm.name}
                  onChange={(e) =>
                    setNewForm((f) => ({ ...f, name: e.target.value }))
                  }
                  data-ocid="admin_patient.family_dialog.name_input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Relation *</Label>
                <Input
                  placeholder="Wife, Son..."
                  value={newForm.relation}
                  onChange={(e) =>
                    setNewForm((f) => ({ ...f, relation: e.target.value }))
                  }
                  data-ocid="admin_patient.family_dialog.relation_input"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1">
                <Phone size={12} /> Contact Number
              </Label>
              <Input
                placeholder="+91 98765 XXXXX"
                value={newForm.contactNumber}
                onChange={(e) =>
                  setNewForm((f) => ({ ...f, contactNumber: e.target.value }))
                }
                data-ocid="admin_patient.family_dialog.contact_input"
              />
            </div>

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-ocid="admin_patient.family_dialog.cancel_button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddNew}
                data-ocid="admin_patient.family_dialog.submit_button"
              >
                <Plus size={14} className="mr-1" /> Add Member
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPatientDetailPage() {
  const { id } = useParams({ from: "/admin/patient/$id" });
  const navigate = useNavigate();
  const {
    patients,
    nurses,
    caregivers,
    familyMembers,
    hospitals,
    devices,
    setDevices,
  } = useApp();

  const [nurseDialogOpen, setNurseDialogOpen] = useState(false);
  const [caregiverDialogOpen, setCaregiverDialogOpen] = useState(false);
  const [familyDialogOpen, setFamilyDialogOpen] = useState(false);
  const [deviceDialogOpen, setDeviceDialogOpen] = useState(false);
  const [deviceForm, setDeviceForm] = useState({ serialNumber: "", model: "" });

  const patient = patients.find((p) => p.id === id);

  if (!patient) {
    return (
      <AppShell>
        <div className="p-4 md:p-6">
          <BackButton variant="inline" />
          <div className="text-center py-16 text-muted-foreground">
            <AlertTriangle
              size={40}
              className="mx-auto mb-3 opacity-30 text-destructive"
            />
            <p className="font-medium">Patient not found</p>
            <p className="text-sm mt-1">
              The patient record could not be loaded.
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  const assignedNurse = nurses.find((n) => n.id === patient.nurseId);
  const assignedCaregiver = caregivers.find(
    (c) => c.id === patient.caregiverId,
  );
  const linkedFamilyMembers = familyMembers.filter((fm) =>
    patient.familyMemberIds.includes(fm.id),
  );
  const hospital = hospitals.find((h) => h.id === patient.hospitalId);
  const isCritical =
    patient.postureStatus === "Fallen" || patient.salineLevel < 5;
  const linkedDevice = devices.find((d) => d.patientId === patient.id);

  const handleSaveDevice = () => {
    if (!deviceForm.serialNumber.trim()) {
      toast.error("Serial number is required");
      return;
    }
    const newDevice: Device = {
      id: linkedDevice ? linkedDevice.id : `dev${Date.now()}`,
      patientId: patient.id,
      serialNumber: deviceForm.serialNumber.trim(),
      model: deviceForm.model.trim() || "Paryavekshan Monitor v1",
      status: "active",
      registeredAt: linkedDevice
        ? linkedDevice.registeredAt
        : new Date().toISOString(),
    };
    setDevices((prev) => [
      ...prev.filter((d) => d.patientId !== patient.id),
      newDevice,
    ]);
    setDeviceDialogOpen(false);
    setDeviceForm({ serialNumber: "", model: "" });
    toast.success(linkedDevice ? "Device updated" : "Device registered");
  };

  return (
    <AppShell>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <BackButton variant="inline" />
          <Button
            onClick={() => navigate({ to: `/admin/patient/${id}/monitor` })}
            className="flex items-center gap-2 shrink-0"
            data-ocid="admin_patient.view_monitoring_button"
          >
            <Monitor size={15} />
            View Monitoring
          </Button>
        </div>

        {/* ── Patient Header ── */}
        <Card
          className={cn(
            "shadow-medical border-0 overflow-hidden",
            isCritical && "ring-2 ring-destructive/40",
          )}
        >
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Avatar */}
              <div
                className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-lg overflow-hidden shrink-0",
                  isCritical ? "bg-red-500" : "bg-primary/80",
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
                  getInitials(patient.name)
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display text-xl font-bold text-foreground">
                    {patient.name}
                  </h1>
                  <StatusBadge
                    severity={isCritical ? "critical" : "normal"}
                    label={isCritical ? "Critical" : "Stable"}
                  />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-sm text-muted-foreground">
                  <span>Age {patient.age}</span>
                  <span>Bed {patient.bedNumber}</span>
                  <span className="font-medium text-foreground">
                    {patient.bloodGroup}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-xs",
                      isCritical ? "text-destructive" : "text-muted-foreground",
                    )}
                  >
                    {patient.uniqueCode}
                  </span>
                </div>
                {hospital && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {hospital.name}
                  </p>
                )}
              </div>

              {/* Alert banner inline */}
              {isCritical && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg text-destructive text-xs font-medium shrink-0">
                  <AlertTriangle size={13} className="animate-bounce" />
                  Immediate Attention
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Connection Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Nurse Card */}
          <Card className="shadow-medical border-0">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground font-medium">
                <Stethoscope size={15} className="text-teal-600" />
                Assigned Nurse
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {assignedNurse ? (
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-teal-100 text-teal-700 font-bold text-sm dark:bg-teal-900/40 dark:text-teal-300">
                      {getInitials(assignedNurse.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {assignedNurse.name}
                    </p>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs border-0 mt-0.5",
                        assignedNurse.isAvailable
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
                      )}
                    >
                      {assignedNurse.isAvailable ? "Available" : "Busy"}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div
                  className="flex items-center gap-2 py-3 text-muted-foreground text-sm mb-3"
                  data-ocid="admin_patient.nurse.empty_state"
                >
                  <UserCheck size={16} className="opacity-40" />
                  Not assigned
                </div>
              )}
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs h-8 gap-1"
                onClick={() => setNurseDialogOpen(true)}
                data-ocid="admin_patient.assign_nurse_button"
              >
                <UserPlus size={13} />
                {assignedNurse ? "Change Nurse" : "Assign Nurse"}
              </Button>
            </CardContent>
          </Card>

          {/* Caregiver Card */}
          <Card className="shadow-medical border-0">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground font-medium">
                <Heart size={15} className="text-purple-600" />
                Assigned Caregiver
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {assignedCaregiver ? (
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-purple-100 text-purple-700 font-bold text-sm dark:bg-purple-900/40 dark:text-purple-300">
                      {getInitials(assignedCaregiver.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {assignedCaregiver.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {assignedCaregiver.assignedPatientIds.length} patients
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  className="flex items-center gap-2 py-3 text-muted-foreground text-sm mb-3"
                  data-ocid="admin_patient.caregiver.empty_state"
                >
                  <UserCheck size={16} className="opacity-40" />
                  Not assigned
                </div>
              )}
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs h-8 gap-1"
                onClick={() => setCaregiverDialogOpen(true)}
                data-ocid="admin_patient.assign_caregiver_button"
              >
                <UserPlus size={13} />
                {assignedCaregiver ? "Change Caregiver" : "Assign Caregiver"}
              </Button>
            </CardContent>
          </Card>

          {/* Family Members Card */}
          <Card className="shadow-medical border-0">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground font-medium">
                <Users size={15} className="text-blue-600" />
                Family Members
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {linkedFamilyMembers.length > 0 ? (
                <div className="space-y-2 mb-3">
                  {linkedFamilyMembers.slice(0, 4).map((fm) => (
                    <div
                      key={fm.id}
                      className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-muted/40 transition-colors"
                    >
                      <Avatar className="h-9 w-9 shrink-0 ring-2 ring-blue-200/60 dark:ring-blue-800/40">
                        <AvatarImage
                          src={fm.photoUrl}
                          alt={fm.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold dark:bg-blue-900/40 dark:text-blue-300">
                          {getInitials(fm.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {fm.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {fm.relation}
                        </p>
                        {fm.contactNumber && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Phone size={9} />
                            <span className="truncate">{fm.contactNumber}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {linkedFamilyMembers.length > 4 && (
                    <p className="text-xs text-muted-foreground pl-1">
                      +{linkedFamilyMembers.length - 4} more
                    </p>
                  )}
                </div>
              ) : (
                <div
                  className="flex items-center gap-2 py-3 text-muted-foreground text-sm mb-3"
                  data-ocid="admin_patient.family.empty_state"
                >
                  <Users size={16} className="opacity-40" />
                  No family members
                </div>
              )}
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs h-8 gap-1"
                onClick={() => setFamilyDialogOpen(true)}
                data-ocid="admin_patient.add_family_button"
              >
                <UserPlus size={13} />
                Add Family Member
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ── Device Card ── */}
        <Card className="shadow-medical border-0">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground font-medium">
              <Cpu size={15} className="text-primary" />
              Monitoring Device
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {linkedDevice ? (
              <div className="space-y-3">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-green-700 dark:text-green-400 flex items-center gap-1.5">
                      <Cpu size={12} /> Device Active
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 font-medium capitalize">
                      {linkedDevice.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Serial Number</p>
                      <p className="font-mono font-semibold text-foreground mt-0.5">
                        {linkedDevice.serialNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Model</p>
                      <p className="font-medium text-foreground mt-0.5">
                        {linkedDevice.model}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Registered:{" "}
                    {new Date(linkedDevice.registeredAt).toLocaleDateString(
                      "en-IN",
                      { day: "2-digit", month: "short", year: "numeric" },
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground italic">
                    Provides: Saline level, Hand gesture, Live video, Unknown
                    person detection, Posture
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-xs h-8 gap-1"
                    onClick={() => {
                      setDeviceForm({
                        serialNumber: linkedDevice.serialNumber,
                        model: linkedDevice.model,
                      });
                      setDeviceDialogOpen(true);
                    }}
                    data-ocid="admin_patient.device.edit_button"
                  >
                    <Cpu size={13} /> Update Device
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="flex-1 text-xs h-8 gap-1 text-destructive hover:text-destructive"
                    onClick={() => {
                      setDevices((prev) =>
                        prev.filter((d) => d.patientId !== patient.id),
                      );
                      toast.success("Device removed");
                    }}
                    data-ocid="admin_patient.device.delete_button"
                  >
                    <X size={13} /> Remove
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div
                  className="flex items-center gap-2 py-3 text-muted-foreground text-sm"
                  data-ocid="admin_patient.device.empty_state"
                >
                  <Cpu size={16} className="opacity-40" />
                  No device assigned
                </div>
                <Button
                  size="sm"
                  className="w-full text-xs h-8 gap-1"
                  onClick={() => {
                    setDeviceForm({ serialNumber: "", model: "" });
                    setDeviceDialogOpen(true);
                  }}
                  data-ocid="admin_patient.device.add_button"
                >
                  <Cpu size={13} />
                  Add Monitoring Device
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Medical Info ── */}
        <Card className="shadow-medical border-0">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Medical History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {patient.medicalHistory}
            </p>
            {patient.emergencyContacts.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <Phone size={12} /> Emergency Contacts
                </p>
                <div className="space-y-1">
                  {patient.emergencyContacts.map((contact) => (
                    <p key={contact} className="text-xs text-muted-foreground">
                      {contact}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Status Info ── */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-medical border-0">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">
                Posture Status
              </p>
              <p
                className={cn(
                  "font-semibold text-sm",
                  patient.postureStatus === "Fallen"
                    ? "text-destructive"
                    : "text-foreground",
                )}
              >
                {patient.postureStatus === "Fallen" ? "🚨" : "🪑"}{" "}
                {patient.postureStatus}
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-medical border-0">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Saline Level</p>
              <p
                className={cn(
                  "font-semibold text-sm",
                  patient.salineLevel < 5
                    ? "text-destructive"
                    : patient.salineLevel < 20
                      ? "text-yellow-600"
                      : "text-green-600",
                )}
              >
                💧 {patient.salineLevel}%
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Dialogs ── */}
      <AssignNurseDialog
        open={nurseDialogOpen}
        onOpenChange={setNurseDialogOpen}
        patientId={patient.id}
        currentNurseId={patient.nurseId}
      />
      <AssignCaregiverDialog
        open={caregiverDialogOpen}
        onOpenChange={setCaregiverDialogOpen}
        patientId={patient.id}
        currentCaregiverId={patient.caregiverId}
      />
      <AddFamilyMemberDialog
        open={familyDialogOpen}
        onOpenChange={setFamilyDialogOpen}
        patientId={patient.id}
        currentFamilyMemberIds={patient.familyMemberIds}
      />

      {/* Device Dialog */}
      <Dialog
        open={deviceDialogOpen}
        onOpenChange={(o) => {
          setDeviceDialogOpen(o);
          if (!o) setDeviceForm({ serialNumber: "", model: "" });
        }}
      >
        <DialogContent
          className="max-w-sm"
          data-ocid="admin_patient.device_dialog"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cpu size={18} className="text-primary" />
              {linkedDevice ? "Update Device" : "Add Monitoring Device"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <p className="text-xs text-muted-foreground">
              This device provides saline level, hand gesture, live video,
              unknown person detection, and posture data. One device is
              dedicated per patient.
            </p>
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
                data-ocid="admin_patient.device_dialog.serial_input"
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
                data-ocid="admin_patient.device_dialog.model_input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeviceDialogOpen(false)}
              data-ocid="admin_patient.device_dialog.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveDevice}
              data-ocid="admin_patient.device_dialog.submit_button"
            >
              <Cpu size={14} className="mr-1" />
              {linkedDevice ? "Update Device" : "Register Device"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
