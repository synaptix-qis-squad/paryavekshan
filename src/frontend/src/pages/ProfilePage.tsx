import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "@tanstack/react-router";
import { LogOut, Moon, Save, Sun, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "../components/AppShell";
import { BackButton } from "../components/BackButton";
import { MOCK_HOSPITALS, useApp } from "../context/AppContext";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  nurse: "Nurse",
  patient: "Patient",
  caregiver: "Caregiver",
  familyMember: "Family Member",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  nurse: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  patient:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  caregiver:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  familyMember:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

export default function ProfilePage() {
  const { currentUser, setCurrentUser, darkMode, toggleDarkMode, logout } =
    useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: currentUser?.name || "",
    phone: currentUser?.phone || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    if (currentUser) {
      setCurrentUser({ ...currentUser, name: form.name, phone: form.phone });
    }
    toast.success("Profile updated successfully");
    setSaving(false);
  };

  const handleLogout = () => {
    logout();
    toast.info("Logged out successfully");
    navigate({ to: "/get-started" });
  };

  const hospital = MOCK_HOSPITALS.find((h) => h.id === currentUser?.hospitalId);

  if (!currentUser) {
    navigate({ to: "/login", search: { role: undefined } });
    return null;
  }

  return (
    <AppShell>
      <div className="p-4 md:p-6 space-y-5 max-w-lg">
        <BackButton variant="inline" />
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Profile
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your account settings
          </p>
        </div>

        {/* Avatar + Identity */}
        <Card className="shadow-medical border-0">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-primary/15 text-primary font-display font-bold text-xl">
                  {currentUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">
                  {currentUser.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {currentUser.email}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLORS[currentUser.role]}`}
                  >
                    {ROLE_LABELS[currentUser.role]}
                  </span>
                  {hospital && (
                    <Badge variant="outline" className="text-xs">
                      {hospital.name}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editable Fields */}
        <Card className="shadow-medical border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <User size={14} />
              Edit Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm">Full Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Email (read-only)</Label>
              <Input
                value={currentUser.email}
                readOnly
                className="h-10 bg-muted/40 text-muted-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Hospital</Label>
              <Input
                value={hospital?.name || "Not assigned"}
                readOnly
                className="h-10 bg-muted/40 text-muted-foreground"
              />
            </div>
            <Button
              onClick={handleSave}
              className="w-full"
              disabled={saving}
              data-ocid="profile.save_button"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save size={14} />
                  Save Changes
                </span>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="shadow-medical border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon size={16} className="text-muted-foreground" />
                ) : (
                  <Sun size={16} className="text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Dark Mode
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Toggle between light and dark theme
                  </p>
                </div>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={toggleDarkMode}
                data-ocid="profile.darkmode_toggle"
              />
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className="shadow-medical border-0 border-destructive/20">
          <CardContent className="p-4">
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
              data-ocid="profile.logout_button"
            >
              <LogOut size={14} className="mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground pb-4">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
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
    </AppShell>
  );
}
