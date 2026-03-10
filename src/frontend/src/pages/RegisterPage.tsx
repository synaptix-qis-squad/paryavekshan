import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "@tanstack/react-router";
import { Building2, Camera, Lock, User, UserPlus } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { BackButton } from "../components/BackButton";
import { type Hospital, type Role, useApp } from "../context/AppContext";

const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  nurse: "Nurse",
  patient: "Patient",
  caregiver: "Caregiver",
  familyMember: "Family Member",
};

interface RegisterPageProps {
  initialRole?: string;
}

export default function RegisterPage({ initialRole }: RegisterPageProps) {
  const navigate = useNavigate();
  const { setCurrentUser, setHospitals } = useApp();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: ((initialRole as Role) || "nurse") as Role,
    hospitalId: "h1",
    phone: "",
    hospitalName: "",
    hospitalAddress: "",
    hospitalPhone: "",
  });

  const [profileImage, setProfileImage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = form.role === "admin";
  const requiresPhoto = [
    "nurse",
    "caregiver",
    "familyMember",
    "patient",
  ].includes(form.role);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (requiresPhoto && !profileImage) {
      toast.error("Profile photo is required");
      return;
    }

    if (isAdmin) {
      if (!form.hospitalName.trim()) {
        toast.error("Hospital name is required");
        return;
      }
      if (!form.hospitalAddress.trim()) {
        toast.error("Hospital address is required");
        return;
      }
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    let hospitalId = form.hospitalId;

    if (isAdmin) {
      const newHospital: Hospital = {
        id: `h${Date.now()}`,
        name: form.hospitalName.trim(),
        address: form.hospitalAddress.trim(),
        adminId: `u${Date.now()}`,
      };
      setHospitals((prev) => [...prev, newHospital]);
      hospitalId = newHospital.id;
    }

    setCurrentUser({
      id: `u${Date.now()}`,
      name: form.name,
      email: form.email,
      role: form.role,
      hospitalId,
      phone: form.phone,
      ...(profileImage ? { photoUrl: profileImage } : {}),
    } as Parameters<typeof setCurrentUser>[0]);

    toast.success("Account created successfully!");
    const routes: Record<Role, string> = {
      admin: "/admin",
      nurse: "/nurse",
      patient: "/patient",
      caregiver: "/caregiver",
      familyMember: "/family",
    };
    navigate({ to: routes[form.role] });
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
          <p className="text-muted-foreground text-sm">Create your account</p>
        </div>

        <Card className="shadow-medical-lg border-0">
          <CardHeader className="pb-4">
            <h2 className="font-display text-xl font-bold text-center">
              Register
            </h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Profile Photo Upload — required for nurse, caregiver, familyMember, patient */}
              {requiresPhoto && (
                <div className="flex flex-col items-center gap-3 pb-2">
                  <Label className="text-sm font-medium self-start">
                    Profile Photo <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative group">
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      aria-label="Upload profile photo"
                    />
                    {/* Circular avatar preview */}
                    <button
                      type="button"
                      data-ocid="register.upload_button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-24 rounded-full border-2 border-dashed border-primary/40 bg-muted/40 hover:bg-muted/70 hover:border-primary/70 transition-all duration-200 overflow-hidden flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      aria-label="Click to upload profile photo"
                    >
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={36} className="text-muted-foreground/50" />
                      )}
                    </button>
                    {/* Camera overlay icon */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors cursor-pointer border-2 border-background"
                      tabIndex={-1}
                      aria-hidden="true"
                    >
                      <Camera size={13} />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {profileImage
                      ? "Photo selected — click to change"
                      : "Click to upload a photo"}
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Full Name *</Label>
                <Input
                  placeholder="Dr. John Smith"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Email *</Label>
                <Input
                  type="email"
                  placeholder="you@hospital.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Password *</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="h-11"
                  required
                />
              </div>

              {/* Role field — always locked, selected from Choose Your Role page */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Role</Label>
                <div
                  className="h-11 px-3 flex items-center gap-2 rounded-md bg-muted/60 border border-border text-sm text-foreground"
                  data-ocid="register.role_select"
                >
                  <Lock size={13} className="text-muted-foreground shrink-0" />
                  <span className="font-medium truncate">
                    {ROLE_LABELS[form.role]}
                  </span>
                </div>
              </div>

              {/* Admin: Hospital Details section */}
              {isAdmin && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/60 dark:border-blue-900/40 dark:bg-blue-950/20 p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2
                      size={15}
                      className="text-blue-600 dark:text-blue-400 shrink-0"
                    />
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                      Hospital Details
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">
                      Hospital Name *
                    </Label>
                    <Input
                      placeholder="City General Hospital"
                      value={form.hospitalName}
                      onChange={(e) =>
                        setForm({ ...form, hospitalName: e.target.value })
                      }
                      className="h-11 bg-white dark:bg-background"
                      data-ocid="register.hospital_name_input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">
                      Hospital Address *
                    </Label>
                    <Textarea
                      placeholder="123 Healthcare Ave, City, State 000001"
                      value={form.hospitalAddress}
                      onChange={(e) =>
                        setForm({ ...form, hospitalAddress: e.target.value })
                      }
                      rows={2}
                      className="resize-none bg-white dark:bg-background"
                      data-ocid="register.hospital_address_input"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">
                      Hospital Phone
                    </Label>
                    <Input
                      type="tel"
                      placeholder="+91 98765 00000"
                      value={form.hospitalPhone}
                      onChange={(e) =>
                        setForm({ ...form, hospitalPhone: e.target.value })
                      }
                      className="h-11 bg-white dark:bg-background"
                      data-ocid="register.hospital_phone_input"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Phone</Label>
                <Input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="h-11"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 font-semibold"
                disabled={loading}
                data-ocid="register.submit_button"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus size={16} />
                    Create Account
                  </span>
                )}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  search={{ role: form.role }}
                  className="text-primary font-medium hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
