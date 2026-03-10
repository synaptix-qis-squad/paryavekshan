import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Lock, LogIn } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BackButton } from "../components/BackButton";
import { MOCK_USERS, type Role, useApp } from "../context/AppContext";

const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  nurse: "Nurse",
  patient: "Patient",
  caregiver: "Caregiver",
  familyMember: "Family Member",
};

const ROLE_ROUTES: Record<Role, string> = {
  admin: "/admin",
  nurse: "/nurse",
  patient: "/patient",
  caregiver: "/caregiver",
  familyMember: "/family",
};

const DEMO_USERS: { role: Role; label: string; color: string }[] = [
  {
    role: "admin",
    label: "Admin",
    color:
      "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
  },
  {
    role: "nurse",
    label: "Nurse",
    color:
      "bg-teal-100 text-teal-800 hover:bg-teal-200 dark:bg-teal-900/30 dark:text-teal-400",
  },
  {
    role: "patient",
    label: "Patient",
    color:
      "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400",
  },
  {
    role: "caregiver",
    label: "Caregiver",
    color:
      "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400",
  },
  {
    role: "familyMember",
    label: "Family",
    color:
      "bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400",
  },
];

interface LoginPageProps {
  initialRole?: string;
}

export default function LoginPage({ initialRole }: LoginPageProps) {
  const navigate = useNavigate();
  const { setCurrentUser } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const role = ((initialRole as Role) || "nurse") as Role;
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const user = MOCK_USERS[role];
    setCurrentUser({ ...user, email });
    toast.success(`Welcome back, ${user.name}!`);
    navigate({ to: ROLE_ROUTES[role] });
    setLoading(false);
  };

  const handleDemoLogin = async (demoRole: Role) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const user = MOCK_USERS[demoRole];
    setCurrentUser(user);
    toast.success(`Demo login as ${ROLE_LABELS[demoRole]}`);
    navigate({ to: ROLE_ROUTES[demoRole] });
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.96 0.015 250) 0%, oklch(0.98 0.005 240) 100%)",
      }}
    >
      <BackButton />
      <div className="w-full max-w-md">
        {/* Logo + App name */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img
              src="/assets/generated/paryavekshan-logo-transparent.dim_200x200.png"
              alt="Logo"
              className="w-12 h-12 object-contain"
            />
            <h1 className="font-display text-2xl font-bold text-foreground">
              Paryavekshan
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Sign in to your dashboard
          </p>
        </div>

        <Card className="shadow-medical-lg border-0">
          <CardHeader className="pb-4">
            <h2 className="font-display text-xl font-bold text-center text-foreground">
              Sign In
            </h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@hospital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  data-ocid="login.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-10"
                    data-ocid="login.password_input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {role && (
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Role</Label>
                  <div
                    className="h-11 px-3 flex items-center gap-2 rounded-md bg-muted/60 border border-border text-sm text-foreground"
                    data-ocid="login.role_select"
                  >
                    <Lock
                      size={13}
                      className="text-muted-foreground shrink-0"
                    />
                    <span className="font-medium">{ROLE_LABELS[role]}</span>
                  </div>
                </div>
              )}
              <Button
                type="submit"
                className="w-full h-11 font-semibold"
                disabled={loading}
                data-ocid="login.submit_button"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn size={16} />
                    Sign In
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  search={{ role: initialRole }}
                  className="text-primary font-medium hover:underline"
                >
                  Register
                </Link>
              </p>
            </div>

            {/* Demo login section — only the current role */}
            {(() => {
              const demoUser = DEMO_USERS.find((d) => d.role === role);
              if (!demoUser) return null;
              return (
                <div className="mt-6 pt-5 border-t border-border">
                  <p className="text-xs text-muted-foreground text-center mb-3 font-medium">
                    Quick Demo Login
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin(demoUser.role)}
                    disabled={loading}
                    className={`w-full px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${demoUser.color}`}
                    data-ocid={`login.demo_${demoUser.role.toLowerCase()}_button`}
                  >
                    Demo Login as {demoUser.label}
                  </button>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
