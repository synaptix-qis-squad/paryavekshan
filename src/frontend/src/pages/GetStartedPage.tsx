import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  Building2,
  ChevronRight,
  Heart,
  Stethoscope,
  User,
  Users,
} from "lucide-react";
import { BackButton } from "../components/BackButton";

const ROLES = [
  {
    id: "admin",
    label: "Admin",
    icon: <Building2 size={28} />,
    description: "Manage hospital, staff, and patient assignments",
    color:
      "from-blue-500/20 to-blue-600/10 border-blue-200 dark:border-blue-800",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    iconColor: "text-blue-600 dark:text-blue-400",
    ocid: "getstarted.admin_button",
  },
  {
    id: "nurse",
    label: "Nurse",
    icon: <Stethoscope size={28} />,
    description: "Monitor assigned patients and respond to alerts",
    color:
      "from-teal-500/20 to-teal-600/10 border-teal-200 dark:border-teal-800",
    iconBg: "bg-teal-100 dark:bg-teal-900/40",
    iconColor: "text-teal-600 dark:text-teal-400",
    ocid: "getstarted.nurse_button",
  },
  {
    id: "patient",
    label: "Patient",
    icon: <User size={28} />,
    description: "View your health status and emergency options",
    color:
      "from-green-500/20 to-green-600/10 border-green-200 dark:border-green-800",
    iconBg: "bg-green-100 dark:bg-green-900/40",
    iconColor: "text-green-600 dark:text-green-400",
    ocid: "getstarted.patient_button",
  },
  {
    id: "caregiver",
    label: "Caregiver",
    icon: <Heart size={28} />,
    description: "Assist nurses in caring for patients",
    color:
      "from-purple-500/20 to-purple-600/10 border-purple-200 dark:border-purple-800",
    iconBg: "bg-purple-100 dark:bg-purple-900/40",
    iconColor: "text-purple-600 dark:text-purple-400",
    ocid: "getstarted.caregiver_button",
  },
  {
    id: "familyMember",
    label: "Family Member",
    icon: <Users size={28} />,
    description: "Stay updated on your loved one's condition",
    color:
      "from-orange-500/20 to-orange-600/10 border-orange-200 dark:border-orange-800",
    iconBg: "bg-orange-100 dark:bg-orange-900/40",
    iconColor: "text-orange-600 dark:text-orange-400",
    ocid: "getstarted.family_button",
  },
];

export default function GetStartedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background" data-ocid="getstarted.page">
      <BackButton />
      {/* Header */}
      <div
        className="px-6 py-12 text-center"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.18 0.06 260 / 0.05) 0%, transparent 100%)",
        }}
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <img
            src="/assets/generated/paryavekshan-logo-transparent.dim_200x200.png"
            alt="Logo"
            className="w-12 h-12 object-contain"
          />
          <h1 className="font-display text-2xl font-bold text-foreground">
            Paryavekshan
          </h1>
        </div>
        <h2 className="font-display text-3xl font-bold text-foreground mb-3">
          Choose Your Role
        </h2>
        <p className="text-muted-foreground text-base max-w-md mx-auto">
          Select your role to access your personalized dashboard and features
        </p>
      </div>

      {/* Role Cards */}
      <div className="px-6 pb-12 max-w-2xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ROLES.map((role) => (
            <div
              key={role.id}
              className={cn(
                "relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 cursor-pointer",
                "hover:shadow-medical-lg transition-all duration-200 hover:-translate-y-0.5",
                role.color,
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center shrink-0",
                    role.iconBg,
                  )}
                >
                  <div className={role.iconColor}>{role.icon}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-lg font-bold text-foreground mb-1">
                    {role.label}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-snug">
                    {role.description}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Button
                  size="sm"
                  className="flex-1 h-8 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate({ to: "/login", search: { role: role.id } });
                  }}
                  data-ocid={role.ocid}
                >
                  Login <ChevronRight size={12} className="ml-1" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-8 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate({ to: "/register", search: { role: role.id } });
                  }}
                >
                  Register
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
