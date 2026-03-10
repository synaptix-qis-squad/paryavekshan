import { useNavigate } from "@tanstack/react-router";
import { Activity } from "lucide-react";
import { useEffect } from "react";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate({ to: "/onboarding" });
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      data-ocid="splash.page"
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.18 0.06 260) 0%, oklch(0.28 0.1 255) 40%, oklch(0.22 0.08 240) 100%)",
      }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, oklch(0.7 0.18 248), transparent)",
          }}
        />
        <div
          className="absolute -bottom-48 -left-24 w-[32rem] h-[32rem] rounded-full opacity-8"
          style={{
            background:
              "radial-gradient(circle, oklch(0.6 0.14 210), transparent)",
          }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.7 0.1 248) 1px, transparent 1px), linear-gradient(90deg, oklch(0.7 0.1 248) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Pulse rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-48 h-48 rounded-full border border-white/10 animate-ping"
          style={{ animationDuration: "2s" }}
        />
        <div
          className="absolute w-72 h-72 rounded-full border border-white/5 animate-ping"
          style={{ animationDuration: "3s", animationDelay: "0.5s" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6">
        <div className="logo-pulse">
          <img
            src="/assets/generated/paryavekshan-logo-transparent.dim_200x200.png"
            alt="Paryavekshan Logo"
            className="w-28 h-28 object-contain drop-shadow-2xl"
          />
        </div>

        <div className="text-center">
          <h1
            className="font-display text-5xl font-bold text-white tracking-tight mb-3"
            style={{ textShadow: "0 2px 20px oklch(0.6 0.18 248 / 0.5)" }}
          >
            Paryavekshan
          </h1>
          <p className="text-white/70 text-lg font-body tracking-wide">
            Hospital Patient Monitoring System
          </p>
        </div>

        {/* ECG Line decoration */}
        <div className="flex items-center gap-0 opacity-60">
          <div className="h-px w-8 bg-white/40" />
          <Activity size={20} className="text-white/60" />
          <div className="h-px w-4 bg-white/40" />
          <div className="h-px w-2 bg-white" style={{ height: "2px" }} />
          <div className="h-6 w-px bg-white/80" />
          <div className="h-4 w-px bg-white/50" style={{ marginTop: "-8px" }} />
          <div className="h-2 w-px bg-white/30" />
          <div className="h-px w-8 bg-white/40" />
        </div>

        {/* Loading dots */}
        <div className="flex items-center gap-2 mt-2">
          {[0, 0.3, 0.6].map((delay) => (
            <div
              key={delay}
              className="w-2 h-2 rounded-full bg-white/60 animate-bounce"
              style={{ animationDelay: `${delay}s` }}
            />
          ))}
        </div>

        <p className="text-white/40 text-xs mt-4">
          Powered by AI · Securing Patient Safety
        </p>
      </div>
    </div>
  );
}
