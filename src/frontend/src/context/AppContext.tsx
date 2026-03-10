import type React from "react";
import { createContext, useCallback, useContext, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────

export type Role = "admin" | "nurse" | "patient" | "caregiver" | "familyMember";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  hospitalId: string;
  phone?: string;
  profilePhotoUrl?: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  adminId: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  photoUrl?: string;
  bedNumber: string;
  hospitalId: string;
  bloodGroup: string;
  medicalHistory: string;
  nurseId?: string;
  caregiverId?: string;
  familyMemberIds: string[];
  salineLevel: number;
  postureStatus: "Sitting" | "Standing" | "Sleeping" | "Fallen";
  lastGestureAlert?: string;
  uniqueCode: string;
  emergencyContacts: string[];
  isActive: boolean;
}

export interface Nurse {
  id: string;
  name: string;
  hospitalId: string;
  assignedPatientIds: string[];
  isAvailable: boolean;
  email?: string;
  phone?: string;
}

export interface Caregiver {
  id: string;
  name: string;
  hospitalId: string;
  assignedPatientIds: string[];
  email?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  patientId: string;
  photoUrl?: string;
  contactNumber?: string;
}

export interface AlertItem {
  id: string;
  patientId: string;
  alertType: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: string;
  resolved: boolean;
  notes?: string;
}

export interface Assignment {
  id: string;
  patientId: string;
  nurseId: string;
  caregiverId?: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface EmergencyLog {
  id: string;
  patientId: string;
  triggeredBy: string;
  timestamp: string;
  notifiedUsers: string[];
}

export interface Device {
  id: string;
  patientId: string;
  serialNumber: string;
  model: string;
  status: "active" | "inactive" | "pending";
  registeredAt: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────

export const MOCK_HOSPITALS: Hospital[] = [
  {
    id: "h1",
    name: "City General Hospital",
    address: "123 Healthcare Ave, Mumbai, MH 400001",
    adminId: "u1",
  },
  {
    id: "h2",
    name: "Metro Medical Center",
    address: "456 Medical Blvd, Delhi, DL 110001",
    adminId: "u1",
  },
];

export const MOCK_NURSES: Nurse[] = [
  {
    id: "n1",
    name: "Dr. Anjali Singh",
    hospitalId: "h1",
    assignedPatientIds: ["p1", "p2", "p3"],
    isAvailable: true,
    email: "anjali.singh@cityhospital.com",
    phone: "+91 98765 43210",
  },
  {
    id: "n2",
    name: "Nurse Kavita Reddy",
    hospitalId: "h1",
    assignedPatientIds: ["p4", "p5"],
    isAvailable: false,
    email: "kavita.reddy@cityhospital.com",
    phone: "+91 98765 43211",
  },
];

export const MOCK_CAREGIVERS: Caregiver[] = [
  {
    id: "c1",
    name: "Ravi Gupta",
    hospitalId: "h1",
    assignedPatientIds: ["p1", "p2"],
    email: "ravi.gupta@cityhospital.com",
  },
  {
    id: "c2",
    name: "Meena Pillai",
    hospitalId: "h1",
    assignedPatientIds: ["p3", "p4", "p5"],
    email: "meena.pillai@cityhospital.com",
  },
];

export const MOCK_FAMILY_MEMBERS: FamilyMember[] = [
  { id: "f1", name: "Sunita Kumar", relation: "Wife", patientId: "p1" },
  { id: "f2", name: "Rohan Kumar", relation: "Son", patientId: "p1" },
  { id: "f3", name: "Amit Sharma", relation: "Husband", patientId: "p2" },
  { id: "f4", name: "Pooja Mehta", relation: "Daughter", patientId: "p3" },
  { id: "f5", name: "Kiran Singh", relation: "Wife", patientId: "p5" },
];

export const MOCK_PATIENTS: Patient[] = [
  {
    id: "p1",
    name: "Ramesh Kumar",
    age: 65,
    bedNumber: "A-101",
    hospitalId: "h1",
    bloodGroup: "O+",
    medicalHistory:
      "Type 2 Diabetes, Hypertension. Patient has been on insulin therapy for 8 years. Regular check-ups every 3 months. Allergic to penicillin. Recent surgery for appendicitis (recovered well).",
    nurseId: "n1",
    caregiverId: "c1",
    familyMemberIds: ["f1", "f2"],
    salineLevel: 72,
    postureStatus: "Sitting",
    uniqueCode: "PKR-2024-001",
    emergencyContacts: [
      "Sunita Kumar: +91 98765 11111",
      "Rohan Kumar: +91 98765 22222",
    ],
    isActive: true,
  },
  {
    id: "p2",
    name: "Priya Sharma",
    age: 45,
    bedNumber: "B-203",
    hospitalId: "h1",
    bloodGroup: "A+",
    medicalHistory:
      "Chronic kidney disease stage 3. Currently on dialysis 3x per week. Mild anemia. No known drug allergies. History of UTI infections. Currently on antibiotics course.",
    nurseId: "n1",
    caregiverId: "c1",
    familyMemberIds: ["f3"],
    salineLevel: 15,
    postureStatus: "Sleeping",
    lastGestureAlert: new Date(Date.now() - 3600000).toISOString(),
    uniqueCode: "PKR-2024-002",
    emergencyContacts: ["Amit Sharma: +91 98765 33333"],
    isActive: true,
  },
  {
    id: "p3",
    name: "Arjun Mehta",
    age: 78,
    bedNumber: "C-105",
    hospitalId: "h1",
    bloodGroup: "B+",
    medicalHistory:
      "Post-stroke recovery (3 months). Mild cognitive impairment. Physiotherapy ongoing. High fall risk - special monitoring required. Blood pressure medication daily. No food allergies.",
    nurseId: "n1",
    caregiverId: "c2",
    familyMemberIds: ["f4"],
    salineLevel: 3,
    postureStatus: "Fallen",
    lastGestureAlert: new Date(Date.now() - 7200000).toISOString(),
    uniqueCode: "PKR-2024-003",
    emergencyContacts: ["Pooja Mehta: +91 98765 44444"],
    isActive: true,
  },
  {
    id: "p4",
    name: "Sunita Devi",
    age: 58,
    bedNumber: "A-302",
    hospitalId: "h1",
    bloodGroup: "AB-",
    medicalHistory:
      "Post-operative care after hip replacement surgery. Physical therapy daily. Mild osteoporosis. Calcium supplements prescribed. No major allergies. Good recovery progress.",
    nurseId: "n2",
    caregiverId: "c2",
    familyMemberIds: [],
    salineLevel: 88,
    postureStatus: "Standing",
    uniqueCode: "PKR-2024-004",
    emergencyContacts: ["Daughter: +91 98765 55555"],
    isActive: true,
  },
  {
    id: "p5",
    name: "Vikram Singh",
    age: 32,
    bedNumber: "D-201",
    hospitalId: "h2",
    bloodGroup: "O-",
    medicalHistory:
      "Accident-related injuries. Multiple fractures healing well. Regular pain management. Physiotherapy started. No prior major medical conditions. Expected discharge in 2 weeks.",
    nurseId: "n2",
    caregiverId: "c2",
    familyMemberIds: ["f5"],
    salineLevel: 45,
    postureStatus: "Sitting",
    uniqueCode: "PKR-2024-005",
    emergencyContacts: ["Kiran Singh: +91 98765 66666"],
    isActive: true,
  },
];

export const MOCK_ALERTS: AlertItem[] = [
  {
    id: "a1",
    patientId: "p3",
    alertType: "posture_fall",
    severity: "critical",
    timestamp: new Date(Date.now() - 900000).toISOString(),
    resolved: false,
  },
  {
    id: "a2",
    patientId: "p3",
    alertType: "saline_critical",
    severity: "critical",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    resolved: false,
  },
  {
    id: "a3",
    patientId: "p2",
    alertType: "saline_low",
    severity: "high",
    timestamp: new Date(Date.now() - 2700000).toISOString(),
    resolved: false,
  },
  {
    id: "a4",
    patientId: "p2",
    alertType: "hand_gesture",
    severity: "high",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    resolved: true,
    notes: "Nurse responded within 2 minutes",
  },
  {
    id: "a5",
    patientId: "p1",
    alertType: "unknown_person",
    severity: "medium",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    resolved: true,
    notes: "Visitor identified as family friend",
  },
  {
    id: "a6",
    patientId: "p5",
    alertType: "emergency_button",
    severity: "high",
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    resolved: true,
    notes: "Pain medication requested",
  },
  {
    id: "a7",
    patientId: "p4",
    alertType: "hand_gesture",
    severity: "medium",
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    resolved: true,
    notes: "Needed assistance getting up",
  },
  {
    id: "a8",
    patientId: "p1",
    alertType: "saline_low",
    severity: "low",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    resolved: true,
    notes: "Saline replaced",
  },
];

export const MOCK_DEVICES: Device[] = [
  {
    id: "dev1",
    patientId: "p1",
    serialNumber: "PRV-001-A",
    model: "Paryavekshan Sensor v1",
    status: "active",
    registeredAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "dev2",
    patientId: "p2",
    serialNumber: "PRV-002-B",
    model: "Paryavekshan Sensor v1",
    status: "inactive",
    registeredAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "dev3",
    patientId: "p3",
    serialNumber: "PRV-003-C",
    model: "Paryavekshan Sensor v2",
    status: "active",
    registeredAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: "as1",
    patientId: "p1",
    nurseId: "n1",
    caregiverId: "c1",
    status: "accepted",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "as2",
    patientId: "p2",
    nurseId: "n1",
    caregiverId: "c1",
    status: "accepted",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "as3",
    patientId: "p3",
    nurseId: "n1",
    caregiverId: "c2",
    status: "accepted",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "as4",
    patientId: "p4",
    nurseId: "n2",
    caregiverId: "c2",
    status: "accepted",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "as5",
    patientId: "p5",
    nurseId: "n2",
    caregiverId: "c2",
    status: "accepted",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const MOCK_USERS: Record<Role, CurrentUser> = {
  admin: {
    id: "u1",
    name: "Admin Dr. Rajesh Kumar",
    email: "admin@paryavekshan.com",
    role: "admin",
    hospitalId: "h1",
    phone: "+91 99999 00001",
  },
  nurse: {
    id: "u2",
    name: "Dr. Anjali Singh",
    email: "anjali@paryavekshan.com",
    role: "nurse",
    hospitalId: "h1",
    phone: "+91 98765 43210",
  },
  patient: {
    id: "u3",
    name: "Ramesh Kumar",
    email: "ramesh@example.com",
    role: "patient",
    hospitalId: "h1",
    phone: "+91 98765 11111",
  },
  caregiver: {
    id: "u4",
    name: "Ravi Gupta",
    email: "ravi@paryavekshan.com",
    role: "caregiver",
    hospitalId: "h1",
    phone: "+91 98765 77777",
  },
  familyMember: {
    id: "u5",
    name: "Sunita Kumar",
    email: "sunita@example.com",
    role: "familyMember",
    hospitalId: "h1",
    phone: "+91 98765 11112",
  },
};

// ─── Context ──────────────────────────────────────────────────────────────

interface AppContextValue {
  currentUser: CurrentUser | null;
  setCurrentUser: (user: CurrentUser | null) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  patients: Patient[];
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
  alerts: AlertItem[];
  setAlerts: React.Dispatch<React.SetStateAction<AlertItem[]>>;
  nurses: Nurse[];
  setNurses: React.Dispatch<React.SetStateAction<Nurse[]>>;
  caregivers: Caregiver[];
  setCaregivers: React.Dispatch<React.SetStateAction<Caregiver[]>>;
  hospitals: Hospital[];
  setHospitals: React.Dispatch<React.SetStateAction<Hospital[]>>;
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  familyMembers: FamilyMember[];
  setFamilyMembers: React.Dispatch<React.SetStateAction<FamilyMember[]>>;
  emergencyLogs: EmergencyLog[];
  setEmergencyLogs: React.Dispatch<React.SetStateAction<EmergencyLog[]>>;
  devices: Device[];
  setDevices: React.Dispatch<React.SetStateAction<Device[]>>;
  addAlert: (alert: Omit<AlertItem, "id" | "timestamp">) => void;
  resolveAlert: (id: string, notes?: string) => void;
  updatePatientSaline: (patientId: string, level: number) => void;
  updatePatientPosture: (
    patientId: string,
    status: Patient["postureStatus"],
  ) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [alerts, setAlerts] = useState<AlertItem[]>(MOCK_ALERTS);
  const [nurses, setNurses] = useState<Nurse[]>(MOCK_NURSES);
  const [caregivers, setCaregivers] = useState<Caregiver[]>(MOCK_CAREGIVERS);
  const [hospitals, setHospitals] = useState<Hospital[]>(MOCK_HOSPITALS);
  const [assignments, setAssignments] =
    useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [familyMembers, setFamilyMembers] =
    useState<FamilyMember[]>(MOCK_FAMILY_MEMBERS);
  const [emergencyLogs, setEmergencyLogs] = useState<EmergencyLog[]>([]);
  const [devices, setDevices] = useState<Device[]>(MOCK_DEVICES);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  }, []);

  const addAlert = useCallback((alert: Omit<AlertItem, "id" | "timestamp">) => {
    const newAlert: AlertItem = {
      ...alert,
      id: `a${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setAlerts((prev) => [newAlert, ...prev]);
  }, []);

  const resolveAlert = useCallback((id: string, notes?: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, resolved: true, notes: notes || a.notes } : a,
      ),
    );
  }, []);

  const updatePatientSaline = useCallback(
    (patientId: string, level: number) => {
      setPatients((prev) =>
        prev.map((p) => {
          if (p.id !== patientId) return p;
          return { ...p, salineLevel: level };
        }),
      );
    },
    [],
  );

  const updatePatientPosture = useCallback(
    (patientId: string, status: Patient["postureStatus"]) => {
      setPatients((prev) =>
        prev.map((p) => {
          if (p.id !== patientId) return p;
          return { ...p, postureStatus: status };
        }),
      );
    },
    [],
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        darkMode,
        toggleDarkMode,
        patients,
        setPatients,
        alerts,
        setAlerts,
        nurses,
        setNurses,
        caregivers,
        setCaregivers,
        hospitals,
        setHospitals,
        assignments,
        setAssignments,
        familyMembers,
        setFamilyMembers,
        emergencyLogs,
        setEmergencyLogs,
        devices,
        setDevices,
        addAlert,
        resolveAlert,
        updatePatientSaline,
        updatePatientPosture,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
