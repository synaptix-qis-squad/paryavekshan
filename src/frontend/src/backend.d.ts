import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    userId: bigint;
    name: string;
    role: Role;
    email: string;
    hospitalId?: bigint;
    profilePhotoUrl?: string;
    phone?: string;
}
export type Time = bigint;
export interface User {
    id: bigint;
    name: string;
    role: Role;
    email: string;
    hospitalId?: bigint;
    profilePhotoUrl?: string;
    phone?: string;
}
export interface Hospital {
    id: bigint;
    name: string;
    address: string;
    adminId: bigint;
}
export interface EmergencyLog {
    id: bigint;
    patientId: bigint;
    triggeredBy: bigint;
    timestamp: Time;
    notifiedUsers: Array<bigint>;
}
export interface Nurse {
    id: bigint;
    name: string;
    isAvailable: boolean;
    hospitalId: bigint;
    assignedPatientIds: Array<bigint>;
}
export interface Caregiver {
    id: bigint;
    name: string;
    hospitalId: bigint;
    assignedPatientIds: Array<bigint>;
}
export interface Assignment {
    id: bigint;
    status: string;
    caregiverId?: bigint;
    patientId: bigint;
    createdAt: Time;
    nurseId: bigint;
}
export interface Alert {
    id: bigint;
    resolved: boolean;
    alertType: string;
    patientId: bigint;
    notes?: string;
    timestamp: Time;
    severity: string;
    resolvedBy?: bigint;
}
export interface Patient {
    id: bigint;
    age: bigint;
    caregiverId?: bigint;
    name: string;
    lastGestureAlert?: Time;
    photoUrl?: string;
    familyMemberIds: Array<bigint>;
    bedNumber: string;
    emergencyContacts: Array<string>;
    isActive: boolean;
    uniqueCode: string;
    salineLevel: bigint;
    hospitalId: bigint;
    postureStatus: string;
    medicalHistory: string;
    nurseId?: bigint;
    bloodGroup: string;
}
export enum Role {
    patient = "patient",
    admin = "admin",
    familyMember = "familyMember",
    nurse = "nurse",
    caregiver = "caregiver"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptAssignment(id: bigint): Promise<Assignment>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAlert(patientId: bigint, alertType: string, severity: string): Promise<Alert>;
    createAssignment(patientId: bigint, nurseId: bigint, caregiverId: bigint | null): Promise<Assignment>;
    createCaregiver(name: string, hospitalId: bigint): Promise<Caregiver>;
    createEmergencyLog(patientId: bigint, notifiedUsers: Array<bigint>): Promise<EmergencyLog>;
    createHospital(name: string, address: string, adminId: bigint): Promise<Hospital>;
    createNurse(name: string, hospitalId: bigint): Promise<Nurse>;
    createPatient(name: string, age: bigint, photoUrl: string | null, medicalHistory: string, bloodGroup: string, bedNumber: string, hospitalId: bigint, uniqueCode: string, emergencyContacts: Array<string>): Promise<Patient>;
    createUser(name: string, email: string, role: Role, hospitalId: bigint | null, profilePhotoUrl: string | null, phone: string | null): Promise<User>;
    getAlert(id: bigint): Promise<Alert>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCaregiver(id: bigint): Promise<Caregiver>;
    getDashboardStats(): Promise<{
        totalPatients: bigint;
        alertsToday: bigint;
        totalNurses: bigint;
        totalHospitals: bigint;
    }>;
    getHospital(id: bigint): Promise<Hospital>;
    getNurse(id: bigint): Promise<Nurse>;
    getPatient(id: bigint): Promise<Patient>;
    getPatientByUniqueCode(uniqueCode: string): Promise<Patient>;
    getUser(id: bigint): Promise<User>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listAlerts(): Promise<Array<Alert>>;
    listAlertsByPatient(patientId: bigint): Promise<Array<Alert>>;
    listAssignmentsByNurse(nurseId: bigint): Promise<Array<Assignment>>;
    listAssignmentsByPatient(patientId: bigint): Promise<Array<Assignment>>;
    listEmergencyLogsByPatient(patientId: bigint): Promise<Array<EmergencyLog>>;
    listHospitals(): Promise<Array<Hospital>>;
    listUnresolvedAlerts(): Promise<Array<Alert>>;
    listUsersByHospital(hospitalId: bigint): Promise<Array<User>>;
    listUsersByRole(role: Role): Promise<Array<User>>;
    rejectAssignment(id: bigint): Promise<Assignment>;
    resolveAlert(id: bigint, notes: string | null): Promise<Alert>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchPatientsByName(name: string): Promise<Array<Patient>>;
    updateCaregiver(id: bigint, name: string, hospitalId: bigint, assignedPatientIds: Array<bigint>): Promise<Caregiver>;
    updateGestureAlert(patientId: bigint): Promise<Patient>;
    updateHospital(id: bigint, name: string, address: string, adminId: bigint): Promise<Hospital>;
    updateNurse(id: bigint, name: string, hospitalId: bigint, assignedPatientIds: Array<bigint>, isAvailable: boolean): Promise<Nurse>;
    updatePatient(id: bigint, name: string, age: bigint, photoUrl: string | null, medicalHistory: string, bloodGroup: string, bedNumber: string, hospitalId: bigint, nurseId: bigint | null, caregiverId: bigint | null, familyMemberIds: Array<bigint>, salineLevel: bigint, postureStatus: string, lastGestureAlert: Time | null, uniqueCode: string, emergencyContacts: Array<string>, isActive: boolean): Promise<Patient>;
    updatePostureStatus(patientId: bigint, status: string): Promise<Patient>;
    updateSalineLevel(patientId: bigint, level: bigint): Promise<Patient>;
    updateUser(id: bigint, name: string, email: string, role: Role, hospitalId: bigint | null, profilePhotoUrl: string | null, phone: string | null): Promise<User>;
}
