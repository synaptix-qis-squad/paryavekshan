import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import List "mo:core/List";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  public type Role = {
    #admin;
    #nurse;
    #patient;
    #caregiver;
    #familyMember;
  };

  public type User = {
    id : Nat;
    name : Text;
    email : Text;
    role : Role;
    hospitalId : ?Nat;
    profilePhotoUrl : ?Text;
    phone : ?Text;
  };

  public type UserProfile = {
    userId : Nat;
    name : Text;
    email : Text;
    role : Role;
    hospitalId : ?Nat;
    profilePhotoUrl : ?Text;
    phone : ?Text;
  };

  public type Patient = {
    id : Nat;
    name : Text;
    age : Nat;
    photoUrl : ?Text;
    medicalHistory : Text;
    bloodGroup : Text;
    bedNumber : Text;
    hospitalId : Nat;
    nurseId : ?Nat;
    caregiverId : ?Nat;
    familyMemberIds : [Nat];
    salineLevel : Nat;
    postureStatus : Text;
    lastGestureAlert : ?Time.Time;
    uniqueCode : Text;
    emergencyContacts : [Text];
    isActive : Bool;
  };

  public type Nurse = {
    id : Nat;
    name : Text;
    hospitalId : Nat;
    assignedPatientIds : [Nat];
    isAvailable : Bool;
  };

  public type Caregiver = {
    id : Nat;
    name : Text;
    hospitalId : Nat;
    assignedPatientIds : [Nat];
  };

  public type Hospital = {
    id : Nat;
    name : Text;
    address : Text;
    adminId : Nat;
  };

  public type Alert = {
    id : Nat;
    patientId : Nat;
    alertType : Text;
    timestamp : Time.Time;
    severity : Text;
    resolved : Bool;
    resolvedBy : ?Nat;
    notes : ?Text;
  };

  public type EmergencyLog = {
    id : Nat;
    patientId : Nat;
    triggeredBy : Nat;
    timestamp : Time.Time;
    notifiedUsers : [Nat];
  };

  public type Assignment = {
    id : Nat;
    patientId : Nat;
    nurseId : Nat;
    caregiverId : ?Nat;
    status : Text;
    createdAt : Time.Time;
  };

  module User {
    public func compare(user1 : User, user2 : User) : Order.Order {
      Nat.compare(user1.id, user2.id);
    };
  };

  module Patient {
    public func compare(patient1 : Patient, patient2 : Patient) : Order.Order {
      Nat.compare(patient1.id, patient2.id);
    };
  };

  module Nurse {
    public func compare(nurse1 : Nurse, nurse2 : Nurse) : Order.Order {
      Nat.compare(nurse1.id, nurse2.id);
    };
  };

  module Caregiver {
    public func compare(caregiver1 : Caregiver, caregiver2 : Caregiver) : Order.Order {
      Nat.compare(caregiver1.id, caregiver2.id);
    };
  };

  module Hospital {
    public func compare(hospital1 : Hospital, hospital2 : Hospital) : Order.Order {
      Nat.compare(hospital1.id, hospital2.id);
    };
  };

  module Alert {
    public func compare(alert1 : Alert, alert2 : Alert) : Order.Order {
      Nat.compare(alert1.id, alert2.id);
    };
  };

  module EmergencyLog {
    public func compare(log1 : EmergencyLog, log2 : EmergencyLog) : Order.Order {
      Nat.compare(log1.id, log2.id);
    };
  };

  module Assignment {
    public func compare(assignment1 : Assignment, assignment2 : Assignment) : Order.Order {
      Nat.compare(assignment1.id, assignment2.id);
    };
  };

  public type RoleRequest = {
    #admin;
    #nurse;
    #patient;
    #caregiver;
    #familyMember;
  };

  // State
  let users = Map.empty<Nat, User>();
  let patients = Map.empty<Nat, Patient>();
  let nurses = Map.empty<Nat, Nurse>();
  let caregivers = Map.empty<Nat, Caregiver>();
  let hospitals = Map.empty<Nat, Hospital>();
  let alerts = Map.empty<Nat, Alert>();
  let emergencyLogs = Map.empty<Nat, EmergencyLog>();
  let assignments = Map.empty<Nat, Assignment>();
  let principalToUserId = Map.empty<Principal, Nat>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextUserId = 1;
  var nextPatientId = 1;
  var nextNurseId = 1;
  var nextCaregiverId = 1;
  var nextHospitalId = 1;
  var nextAlertId = 1;
  var nextLogId = 1;
  var nextAssignmentId = 1;

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Helper functions
  private func getUserIdFromCaller(caller : Principal) : ?Nat {
    principalToUserId.get(caller);
  };

  private func getUserFromCaller(caller : Principal) : ?User {
    switch (getUserIdFromCaller(caller)) {
      case (null) { null };
      case (?userId) { users.get(userId) };
    };
  };

  private func requireUser(caller : Principal) : User {
    switch (getUserFromCaller(caller)) {
      case (null) { Runtime.trap("Unauthorized: User not registered") };
      case (?user) { user };
    };
  };

  private func requireAdmin(caller : Principal) : User {
    let user = requireUser(caller);
    if (user.role != #admin) {
      Runtime.trap("Unauthorized: Admin access required");
    };
    user;
  };

  private func requireNurse(caller : Principal) : User {
    let user = requireUser(caller);
    if (user.role != #nurse) {
      Runtime.trap("Unauthorized: Nurse access required");
    };
    user;
  };

  private func isPatientAccessible(caller : Principal, patientId : Nat) : Bool {
    switch (getUserFromCaller(caller)) {
      case (null) { false };
      case (?user) {
        switch (user.role) {
          case (#admin) { true };
          case (#nurse) {
            switch (nurses.get(user.id)) {
              case (null) { false };
              case (?nurse) {
                nurse.assignedPatientIds.find(func(id : Nat) : Bool { id == patientId }) != null;
              };
            };
          };
          case (#caregiver) {
            switch (caregivers.get(user.id)) {
              case (null) { false };
              case (?caregiver) {
                caregiver.assignedPatientIds.find(func(id : Nat) : Bool { id == patientId }) != null;
              };
            };
          };
          case (#patient) {
            user.id == patientId;
          };
          case (#familyMember) {
            switch (patients.get(patientId)) {
              case (null) { false };
              case (?patient) {
                patient.familyMemberIds.find(func(id : Nat) : Bool { id == user.id }) != null;
              };
            };
          };
        };
      };
    };
  };

  private func requirePatientAccess(caller : Principal, patientId : Nat) {
    if (not isPatientAccessible(caller, patientId)) {
      Runtime.trap("Unauthorized: No access to this patient");
    };
  };

  private func isHospitalAdmin(caller : Principal, hospitalId : Nat) : Bool {
    switch (getUserFromCaller(caller)) {
      case (null) { false };
      case (?user) {
        if (user.role != #admin) { return false };
        switch (hospitals.get(hospitalId)) {
          case (null) { false };
          case (?hospital) { hospital.adminId == user.id };
        };
      };
    };
  };

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
    principalToUserId.add(caller, profile.userId);
  };

  // User Management
  public shared ({ caller }) func createUser(name : Text, email : Text, role : Role, hospitalId : ?Nat, profilePhotoUrl : ?Text, phone : ?Text) : async User {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create users");
    };

    let user : User = {
      id = nextUserId;
      name;
      email;
      role;
      hospitalId;
      profilePhotoUrl;
      phone;
    };
    users.add(nextUserId, user);
    nextUserId += 1;
    user;
  };

  public query ({ caller }) func getUser(id : Nat) : async User {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    let callerUser = requireUser(caller);
    
    // Users can view their own profile, admins can view all
    if (callerUser.id != id and callerUser.role != #admin) {
      Runtime.trap("Unauthorized: Can only view your own user record");
    };

    switch (users.get(id)) {
      case (null) { Runtime.trap("User not found") };
      case (?user) { user };
    };
  };

  public shared ({ caller }) func updateUser(id : Nat, name : Text, email : Text, role : Role, hospitalId : ?Nat, profilePhotoUrl : ?Text, phone : ?Text) : async User {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    let callerUser = requireUser(caller);
    
    // Users can update their own profile, admins can update all
    if (callerUser.id != id and callerUser.role != #admin) {
      Runtime.trap("Unauthorized: Can only update your own user record");
    };

    switch (users.get(id)) {
      case (null) { Runtime.trap("User not found") };
      case (?_) {
        let updatedUser : User = {
          id;
          name;
          email;
          role;
          hospitalId;
          profilePhotoUrl;
          phone;
        };
        users.add(id, updatedUser);
        updatedUser;
      };
    };
  };

  public query ({ caller }) func listUsersByRole(role : Role) : async [User] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can list users by role");
    };

    let filtered = users.values().toArray().filter(func(user) { user.role == role });
    filtered.sort();
  };

  public query ({ caller }) func listUsersByHospital(hospitalId : Nat) : async [User] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    let callerUser = requireUser(caller);
    
    // Only admins or users from the same hospital can list
    if (callerUser.role != #admin) {
      switch (callerUser.hospitalId) {
        case (null) { Runtime.trap("Unauthorized: No hospital access") };
        case (?userHospitalId) {
          if (userHospitalId != hospitalId) {
            Runtime.trap("Unauthorized: Can only list users from your hospital");
          };
        };
      };
    };

    let filtered = users.values().toArray().filter(func(user) { 
      switch (user.hospitalId) { 
        case (null) { false }; 
        case (?id) { id == hospitalId } 
      } 
    });
    filtered.sort();
  };

  // Hospital Management
  public shared ({ caller }) func createHospital(name : Text, address : Text, adminId : Nat) : async Hospital {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create hospitals");
    };

    let hospital : Hospital = {
      id = nextHospitalId;
      name;
      address;
      adminId;
    };
    hospitals.add(nextHospitalId, hospital);
    nextHospitalId += 1;
    hospital;
  };

  public query ({ caller }) func getHospital(id : Nat) : async Hospital {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    switch (hospitals.get(id)) {
      case (null) { Runtime.trap("Hospital not found") };
      case (?hospital) { hospital };
    };
  };

  public shared ({ caller }) func updateHospital(id : Nat, name : Text, address : Text, adminId : Nat) : async Hospital {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update hospitals");
    };

    // Only the hospital admin can update their hospital
    if (not isHospitalAdmin(caller, id)) {
      Runtime.trap("Unauthorized: Only the hospital admin can update this hospital");
    };

    switch (hospitals.get(id)) {
      case (null) { Runtime.trap("Hospital not found") };
      case (?_) {
        let updatedHospital : Hospital = {
          id;
          name;
          address;
          adminId;
        };
        hospitals.add(id, updatedHospital);
        updatedHospital;
      };
    };
  };

  public query ({ caller }) func listHospitals() : async [Hospital] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    let allHospitals = hospitals.values().toArray();
    allHospitals.sort();
  };

  // Patient Management
  public shared ({ caller }) func createPatient(name : Text, age : Nat, photoUrl : ?Text, medicalHistory : Text, bloodGroup : Text, bedNumber : Text, hospitalId : Nat, uniqueCode : Text, emergencyContacts : [Text]) : async Patient {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    let callerUser = requireUser(caller);
    
    // Only admins and nurses can create patients
    if (callerUser.role != #admin and callerUser.role != #nurse) {
      Runtime.trap("Unauthorized: Only admins and nurses can create patients");
    };

    // Nurses can only create patients in their hospital
    if (callerUser.role == #nurse) {
      switch (callerUser.hospitalId) {
        case (null) { Runtime.trap("Unauthorized: Nurse not assigned to a hospital") };
        case (?userHospitalId) {
          if (userHospitalId != hospitalId) {
            Runtime.trap("Unauthorized: Can only create patients in your hospital");
          };
        };
      };
    };

    let patient : Patient = {
      id = nextPatientId;
      name;
      age;
      photoUrl;
      medicalHistory;
      bloodGroup;
      bedNumber;
      hospitalId;
      nurseId = null;
      caregiverId = null;
      familyMemberIds = [];
      salineLevel = 100;
      postureStatus = "Sitting";
      lastGestureAlert = null;
      uniqueCode;
      emergencyContacts;
      isActive = true;
    };
    patients.add(nextPatientId, patient);
    nextPatientId += 1;
    patient;
  };

  public query ({ caller }) func getPatient(id : Nat) : async Patient {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    requirePatientAccess(caller, id);

    switch (patients.get(id)) {
      case (null) { Runtime.trap("Patient not found") };
      case (?patient) { patient };
    };
  };

  public shared ({ caller }) func updatePatient(
    id : Nat,
    name : Text,
    age : Nat,
    photoUrl : ?Text,
    medicalHistory : Text,
    bloodGroup : Text,
    bedNumber : Text,
    hospitalId : Nat,
    nurseId : ?Nat,
    caregiverId : ?Nat,
    familyMemberIds : [Nat],
    salineLevel : Nat,
    postureStatus : Text,
    lastGestureAlert : ?Time.Time,
    uniqueCode : Text,
    emergencyContacts : [Text],
    isActive : Bool,
  ) : async Patient {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    let callerUser = requireUser(caller);
    
    // Only admins and assigned nurses can update patient records
    if (callerUser.role != #admin and callerUser.role != #nurse) {
      Runtime.trap("Unauthorized: Only admins and nurses can update patients");
    };

    if (callerUser.role == #nurse) {
      requirePatientAccess(caller, id);
    };

    switch (patients.get(id)) {
      case (null) { Runtime.trap("Patient not found") };
      case (?_) {
        let updatedPatient : Patient = {
          id;
          name;
          age;
          photoUrl;
          medicalHistory;
          bloodGroup;
          bedNumber;
          hospitalId;
          nurseId;
          caregiverId;
          familyMemberIds;
          salineLevel;
          postureStatus;
          lastGestureAlert;
          uniqueCode;
          emergencyContacts;
          isActive;
        };
        patients.add(id, updatedPatient);
        updatedPatient;
      };
    };
  };

  public query ({ caller }) func searchPatientsByName(name : Text) : async [Patient] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    let callerUser = requireUser(caller);
    
    let allPatients = patients.values().toArray();
    let filtered = allPatients.filter(func(p) { 
      p.name.contains(#text name) and (
        callerUser.role == #admin or isPatientAccessible(caller, p.id)
      )
    });
    filtered.sort();
  };

  public query ({ caller }) func getPatientByUniqueCode(uniqueCode : Text) : async Patient {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    let found = patients.values().find(func(p) { p.uniqueCode == uniqueCode });
    switch (found) {
      case (null) { Runtime.trap("Patient not found") };
      case (?patient) {
        requirePatientAccess(caller, patient.id);
        patient;
      };
    };
  };

  // Nurse Management
  public shared ({ caller }) func createNurse(name : Text, hospitalId : Nat) : async Nurse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create nurses");
    };

    let nurse : Nurse = {
      id = nextNurseId;
      name;
      hospitalId;
      assignedPatientIds = [];
      isAvailable = true;
    };
    nurses.add(nextNurseId, nurse);
    nextNurseId += 1;
    nurse;
  };

  public query ({ caller }) func getNurse(id : Nat) : async Nurse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    switch (nurses.get(id)) {
      case (null) { Runtime.trap("Nurse not found") };
      case (?nurse) { nurse };
    };
  };

  public shared ({ caller }) func updateNurse(
    id : Nat,
    name : Text,
    hospitalId : Nat,
    assignedPatientIds : [Nat],
    isAvailable : Bool,
  ) : async Nurse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    let callerUser = requireUser(caller);
    
    // Only admins or the nurse themselves can update
    if (callerUser.role != #admin and callerUser.id != id) {
      Runtime.trap("Unauthorized: Can only update your own nurse record");
    };

    switch (nurses.get(id)) {
      case (null) { Runtime.trap("Nurse not found") };
      case (?_) {
        let updatedNurse : Nurse = {
          id;
          name;
          hospitalId;
          assignedPatientIds;
          isAvailable;
        };
        nurses.add(id, updatedNurse);
        updatedNurse;
      };
    };
  };

  // Caregiver Management
  public shared ({ caller }) func createCaregiver(name : Text, hospitalId : Nat) : async Caregiver {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create caregivers");
    };

    let caregiver : Caregiver = {
      id = nextCaregiverId;
      name;
      hospitalId;
      assignedPatientIds = [];
    };
    caregivers.add(nextCaregiverId, caregiver);
    nextCaregiverId += 1;
    caregiver;
  };

  public query ({ caller }) func getCaregiver(id : Nat) : async Caregiver {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    switch (caregivers.get(id)) {
      case (null) { Runtime.trap("Caregiver not found") };
      case (?caregiver) { caregiver };
    };
  };

  public shared ({ caller }) func updateCaregiver(
    id : Nat,
    name : Text,
    hospitalId : Nat,
    assignedPatientIds : [Nat],
  ) : async Caregiver {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    let callerUser = requireUser(caller);
    
    // Only admins or the caregiver themselves can update
    if (callerUser.role != #admin and callerUser.id != id) {
      Runtime.trap("Unauthorized: Can only update your own caregiver record");
    };

    switch (caregivers.get(id)) {
      case (null) { Runtime.trap("Caregiver not found") };
      case (?_) {
        let updatedCaregiver : Caregiver = {
          id;
          name;
          hospitalId;
          assignedPatientIds;
        };
        caregivers.add(id, updatedCaregiver);
        updatedCaregiver;
      };
    };
  };

  // Alert Management
  public shared ({ caller }) func createAlert(
    patientId : Nat,
    alertType : Text,
    severity : Text,
  ) : async Alert {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    // Anyone with patient access can create alerts
    requirePatientAccess(caller, patientId);

    let alert : Alert = {
      id = nextAlertId;
      patientId;
      alertType;
      timestamp = Time.now();
      severity;
      resolved = false;
      resolvedBy = null;
      notes = null;
    };
    alerts.add(nextAlertId, alert);
    nextAlertId += 1;
    alert;
  };

  public query ({ caller }) func getAlert(id : Nat) : async Alert {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    switch (alerts.get(id)) {
      case (null) { Runtime.trap("Alert not found") };
      case (?alert) {
        requirePatientAccess(caller, alert.patientId);
        alert;
      };
    };
  };

  public query ({ caller }) func listAlerts() : async [Alert] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    let callerUser = requireUser(caller);
    
    let allAlerts = alerts.values().toArray();
    
    // Filter based on patient access
    let filtered = if (callerUser.role == #admin) {
      allAlerts;
    } else {
      allAlerts.filter(func(alert) { isPatientAccessible(caller, alert.patientId) });
    };
    
    filtered.sort();
  };

  public query ({ caller }) func listAlertsByPatient(patientId : Nat) : async [Alert] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    requirePatientAccess(caller, patientId);

    let filtered = alerts.values().toArray().filter(func(alert) { alert.patientId == patientId });
    filtered.sort();
  };

  public query ({ caller }) func listUnresolvedAlerts() : async [Alert] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    let callerUser = requireUser(caller);
    
    let allAlerts = alerts.values().toArray();
    let filtered = allAlerts.filter(func(alert) { 
      not alert.resolved and (
        callerUser.role == #admin or isPatientAccessible(caller, alert.patientId)
      )
    });
    filtered.sort();
  };

  public shared ({ caller }) func resolveAlert(id : Nat, notes : ?Text) : async Alert {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    let callerUser = requireUser(caller);

    switch (alerts.get(id)) {
      case (null) { Runtime.trap("Alert not found") };
      case (?alert) {
        // Only admins and nurses can resolve alerts
        if (callerUser.role != #admin and callerUser.role != #nurse) {
          Runtime.trap("Unauthorized: Only admins and nurses can resolve alerts");
        };

        requirePatientAccess(caller, alert.patientId);

        let resolvedAlert : Alert = {
          id = alert.id;
          patientId = alert.patientId;
          alertType = alert.alertType;
          timestamp = alert.timestamp;
          severity = alert.severity;
          resolved = true;
          resolvedBy = ?callerUser.id;
          notes;
        };
        alerts.add(id, resolvedAlert);
        resolvedAlert;
      };
    };
  };

  // Assignment Management
  public shared ({ caller }) func createAssignment(
    patientId : Nat,
    nurseId : Nat,
    caregiverId : ?Nat,
  ) : async Assignment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create assignments");
    };

    let assignment : Assignment = {
      id = nextAssignmentId;
      patientId;
      nurseId;
      caregiverId;
      status = "pending";
      createdAt = Time.now();
    };
    assignments.add(nextAssignmentId, assignment);
    nextAssignmentId += 1;
    assignment;
  };

  public shared ({ caller }) func acceptAssignment(id : Nat) : async Assignment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    let callerUser = requireNurse(caller);

    switch (assignments.get(id)) {
      case (null) { Runtime.trap("Assignment not found") };
      case (?assignment) {
        // Only the assigned nurse can accept
        if (assignment.nurseId != callerUser.id) {
          Runtime.trap("Unauthorized: Can only accept your own assignments");
        };

        let updatedAssignment : Assignment = {
          id = assignment.id;
          patientId = assignment.patientId;
          nurseId = assignment.nurseId;
          caregiverId = assignment.caregiverId;
          status = "accepted";
          createdAt = assignment.createdAt;
        };
        assignments.add(id, updatedAssignment);
        updatedAssignment;
      };
    };
  };

  public shared ({ caller }) func rejectAssignment(id : Nat) : async Assignment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    let callerUser = requireNurse(caller);

    switch (assignments.get(id)) {
      case (null) { Runtime.trap("Assignment not found") };
      case (?assignment) {
        // Only the assigned nurse can reject
        if (assignment.nurseId != callerUser.id) {
          Runtime.trap("Unauthorized: Can only reject your own assignments");
        };

        let updatedAssignment : Assignment = {
          id = assignment.id;
          patientId = assignment.patientId;
          nurseId = assignment.nurseId;
          caregiverId = assignment.caregiverId;
          status = "rejected";
          createdAt = assignment.createdAt;
        };
        assignments.add(id, updatedAssignment);
        updatedAssignment;
      };
    };
  };

  public query ({ caller }) func listAssignmentsByNurse(nurseId : Nat) : async [Assignment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    let callerUser = requireUser(caller);
    
    // Nurses can only see their own assignments, admins can see all
    if (callerUser.role != #admin and callerUser.id != nurseId) {
      Runtime.trap("Unauthorized: Can only view your own assignments");
    };

    let filtered = assignments.values().toArray().filter(func(a) { a.nurseId == nurseId });
    filtered.sort();
  };

  public query ({ caller }) func listAssignmentsByPatient(patientId : Nat) : async [Assignment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    requirePatientAccess(caller, patientId);

    let filtered = assignments.values().toArray().filter(func(a) { a.patientId == patientId });
    filtered.sort();
  };

  // Emergency Log Management
  public shared ({ caller }) func createEmergencyLog(
    patientId : Nat,
    notifiedUsers : [Nat],
  ) : async EmergencyLog {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    let callerUser = requireUser(caller);
    requirePatientAccess(caller, patientId);

    let log : EmergencyLog = {
      id = nextLogId;
      patientId;
      triggeredBy = callerUser.id;
      timestamp = Time.now();
      notifiedUsers;
    };
    emergencyLogs.add(nextLogId, log);
    nextLogId += 1;
    log;
  };

  public query ({ caller }) func listEmergencyLogsByPatient(patientId : Nat) : async [EmergencyLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    requirePatientAccess(caller, patientId);

    let filtered = emergencyLogs.values().toArray().filter(func(log) { log.patientId == patientId });
    filtered.sort();
  };

  // Patient Monitoring
  public shared ({ caller }) func updateSalineLevel(patientId : Nat, level : Nat) : async Patient {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    let callerUser = requireUser(caller);
    
    // Only nurses and caregivers can update saline levels
    if (callerUser.role != #admin and callerUser.role != #nurse and callerUser.role != #caregiver) {
      Runtime.trap("Unauthorized: Only nurses and caregivers can update saline levels");
    };

    requirePatientAccess(caller, patientId);

    switch (patients.get(patientId)) {
      case (null) { Runtime.trap("Patient not found") };
      case (?patient) {
        let updatedPatient : Patient = {
          id = patient.id;
          name = patient.name;
          age = patient.age;
          photoUrl = patient.photoUrl;
          medicalHistory = patient.medicalHistory;
          bloodGroup = patient.bloodGroup;
          bedNumber = patient.bedNumber;
          hospitalId = patient.hospitalId;
          nurseId = patient.nurseId;
          caregiverId = patient.caregiverId;
          familyMemberIds = patient.familyMemberIds;
          salineLevel = level;
          postureStatus = patient.postureStatus;
          lastGestureAlert = patient.lastGestureAlert;
          uniqueCode = patient.uniqueCode;
          emergencyContacts = patient.emergencyContacts;
          isActive = patient.isActive;
        };
        patients.add(patientId, updatedPatient);
        updatedPatient;
      };
    };
  };

  public shared ({ caller }) func updatePostureStatus(patientId : Nat, status : Text) : async Patient {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    requirePatientAccess(caller, patientId);

    switch (patients.get(patientId)) {
      case (null) { Runtime.trap("Patient not found") };
      case (?patient) {
        let updatedPatient : Patient = {
          id = patient.id;
          name = patient.name;
          age = patient.age;
          photoUrl = patient.photoUrl;
          medicalHistory = patient.medicalHistory;
          bloodGroup = patient.bloodGroup;
          bedNumber = patient.bedNumber;
          hospitalId = patient.hospitalId;
          nurseId = patient.nurseId;
          caregiverId = patient.caregiverId;
          familyMemberIds = patient.familyMemberIds;
          salineLevel = patient.salineLevel;
          postureStatus = status;
          lastGestureAlert = patient.lastGestureAlert;
          uniqueCode = patient.uniqueCode;
          emergencyContacts = patient.emergencyContacts;
          isActive = patient.isActive;
        };
        patients.add(patientId, updatedPatient);
        updatedPatient;
      };
    };
  };

  public shared ({ caller }) func updateGestureAlert(patientId : Nat) : async Patient {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    requirePatientAccess(caller, patientId);

    switch (patients.get(patientId)) {
      case (null) { Runtime.trap("Patient not found") };
      case (?patient) {
        let updatedPatient : Patient = {
          id = patient.id;
          name = patient.name;
          age = patient.age;
          photoUrl = patient.photoUrl;
          medicalHistory = patient.medicalHistory;
          bloodGroup = patient.bloodGroup;
          bedNumber = patient.bedNumber;
          hospitalId = patient.hospitalId;
          nurseId = patient.nurseId;
          caregiverId = patient.caregiverId;
          familyMemberIds = patient.familyMemberIds;
          salineLevel = patient.salineLevel;
          postureStatus = patient.postureStatus;
          lastGestureAlert = ?Time.now();
          uniqueCode = patient.uniqueCode;
          emergencyContacts = patient.emergencyContacts;
          isActive = patient.isActive;
        };
        patients.add(patientId, updatedPatient);
        updatedPatient;
      };
    };
  };

  // Dashboard Stats
  public query ({ caller }) func getDashboardStats() : async {
    totalHospitals : Nat;
    totalPatients : Nat;
    totalNurses : Nat;
    alertsToday : Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view dashboard stats");
    };

    let now = Time.now();
    let oneDayAgo = now - (24 * 60 * 60 * 1_000_000_000);
    
    let alertsToday = alerts.values().toArray().filter(func(alert) {
      alert.timestamp >= oneDayAgo;
    }).size();

    {
      totalHospitals = hospitals.size();
      totalPatients = patients.size();
      totalNurses = nurses.size();
      alertsToday;
    };
  };
};
