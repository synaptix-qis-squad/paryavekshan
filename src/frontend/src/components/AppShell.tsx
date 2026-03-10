import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  BedDouble,
  Bell,
  Building2,
  ChevronLeft,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Stethoscope,
  Sun,
  User,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { useApp } from "../context/AppContext";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href: string;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
    href: "/admin",
    roles: ["admin"],
  },
  {
    label: "Dashboard",
    icon: <Stethoscope size={18} />,
    href: "/nurse",
    roles: ["nurse"],
  },
  {
    label: "Dashboard",
    icon: <User size={18} />,
    href: "/patient",
    roles: ["patient"],
  },
  {
    label: "Dashboard",
    icon: <Heart size={18} />,
    href: "/caregiver",
    roles: ["caregiver"],
  },
  {
    label: "Dashboard",
    icon: <Users size={18} />,
    href: "/family",
    roles: ["familyMember"],
  },
  {
    label: "Alerts",
    icon: <Bell size={18} />,
    href: "/alerts",
    roles: ["admin", "nurse", "caregiver", "familyMember"],
  },
  {
    label: "Profile",
    icon: <UserCircle size={18} />,
    href: "/profile",
    roles: ["admin", "nurse", "patient", "caregiver", "familyMember"],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { currentUser, alerts, darkMode, toggleDarkMode, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userRole = currentUser?.role;
  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.roles || (userRole && item.roles.includes(userRole)),
  );
  const unresolvedCount = alerts.filter((a) => !a.resolved).length;

  const handleLogout = () => {
    logout();
    navigate({ to: "/get-started" });
  };

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(`${href}/`);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 border-r border-sidebar-border bg-sidebar shrink-0 fixed h-screen z-30">
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-sidebar-border">
          <img
            src="/assets/generated/paryavekshan-logo-transparent.dim_200x200.png"
            alt="Paryavekshan Logo"
            className="w-9 h-9 object-contain"
          />
          <div>
            <p className="font-display text-sm font-bold text-sidebar-foreground leading-none">
              Paryavekshan
            </p>
            <p className="text-xs text-sidebar-foreground/60 mt-0.5">
              Patient Monitor
            </p>
          </div>
        </div>

        {/* User info */}
        {currentUser && (
          <div className="px-4 py-3 border-b border-sidebar-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-sidebar-primary/30 flex items-center justify-center">
                <span className="text-xs font-bold text-sidebar-primary-foreground">
                  {currentUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-sidebar-foreground truncate">
                  {currentUser.name}
                </p>
                <Badge
                  variant="secondary"
                  className="text-[10px] h-4 px-1.5 mt-0.5 capitalize bg-sidebar-accent text-sidebar-accent-foreground border-0"
                >
                  {currentUser.role === "familyMember"
                    ? "Family"
                    : currentUser.role}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {visibleNavItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                isActive(item.href)
                  ? "bg-sidebar-primary/20 text-sidebar-primary font-semibold"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
              data-ocid={`nav.${item.label.toLowerCase().replace(" ", "_")}.link`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.href === "/alerts" && unresolvedCount > 0 && (
                <Badge className="ml-auto h-4 min-w-[16px] px-1 text-[10px] bg-destructive text-destructive-foreground">
                  {unresolvedCount}
                </Badge>
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-3 border-t border-sidebar-border space-y-1">
          <button
            type="button"
            onClick={toggleDarkMode}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all"
            data-ocid="profile.darkmode_toggle"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
          </button>
          {currentUser && (
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-all"
              data-ocid="profile.logout_button"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-20 bg-card border-b border-border flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/paryavekshan-logo-transparent.dim_200x200.png"
              alt="Logo"
              className="w-7 h-7 object-contain"
            />
            <span className="font-display font-bold text-foreground text-sm">
              Paryavekshan
            </span>
          </div>
          <div className="flex items-center gap-2">
            {unresolvedCount > 0 && (
              <Link to="/alerts">
                <div className="relative">
                  <Bell size={20} className="text-foreground" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[9px] flex items-center justify-center font-bold">
                    {unresolvedCount}
                  </span>
                </div>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex justify-end">
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            />
            <div className="relative w-64 h-full bg-sidebar shadow-xl flex flex-col z-10">
              <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
                <span className="font-display font-bold text-sidebar-foreground">
                  Menu
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X size={18} className="text-sidebar-foreground" />
                </Button>
              </div>
              <nav className="flex-1 px-3 py-3 space-y-0.5">
                {visibleNavItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                      isActive(item.href)
                        ? "bg-sidebar-primary/20 text-sidebar-primary font-semibold"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent",
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
              <div className="px-3 py-3 border-t border-sidebar-border space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    toggleDarkMode();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent"
                >
                  {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                  <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
                </button>
                {currentUser && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-destructive hover:bg-destructive/10"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

export function BackButton({ label }: { label?: string }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate({ to: ".." })}
      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
    >
      <ChevronLeft size={16} />
      {label || "Back"}
    </button>
  );
}
