import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import { Activity, Bell, ChevronRight, Droplet, Eye, Hand } from "lucide-react";
import { useEffect, useState } from "react";

const SLIDES = [
  {
    icon: <Droplet size={56} />,
    color: "from-blue-500 to-cyan-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    title: "Saline Bottle Detection",
    description:
      "Real-time monitoring of IV saline levels with automatic alerts when levels drop below safe thresholds.",
  },
  {
    icon: <Hand size={56} />,
    color: "from-purple-500 to-violet-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
    iconColor: "text-purple-600 dark:text-purple-400",
    title: "Hand Gesture Recognition",
    description:
      "Detect patient distress signals through advanced hand gesture analysis — no buttons needed.",
  },
  {
    icon: <Eye size={56} />,
    color: "from-orange-500 to-amber-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    iconColor: "text-orange-600 dark:text-orange-400",
    title: "Unknown Person Detection",
    description:
      "Identify and immediately alert staff when unregistered visitors enter restricted patient rooms.",
  },
  {
    icon: <Activity size={56} />,
    color: "from-green-500 to-emerald-400",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    iconColor: "text-green-600 dark:text-green-400",
    title: "Posture Detection",
    description:
      "Monitor patient posture in real-time and instantly detect falls to prevent serious injuries.",
  },
  {
    icon: <Bell size={56} />,
    color: "from-red-500 to-rose-400",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    iconColor: "text-red-600 dark:text-red-400",
    title: "Smart Alerts",
    description:
      "Intelligent multi-channel notifications ensure your entire care team stays informed and responsive 24/7.",
  },
];

export default function OnboardingScreen() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => {
        if (prev >= SLIDES.length - 1) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    if (current < SLIDES.length - 1) {
      setCurrent(current + 1);
    } else {
      navigate({ to: "/get-started" });
    }
  };

  const slide = SLIDES[current];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Skip button */}
      <div className="flex justify-end p-4">
        <button
          type="button"
          onClick={() => navigate({ to: "/get-started" })}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
        >
          Skip
        </button>
      </div>

      {/* Main content */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-8 pb-8"
        data-ocid="onboarding.panel"
      >
        {/* Icon area */}
        <div
          className={cn(
            "w-40 h-40 rounded-3xl flex items-center justify-center mb-10 transition-all duration-500",
            slide.bgColor,
          )}
        >
          <div className={cn("transition-all duration-500", slide.iconColor)}>
            {slide.icon}
          </div>
        </div>

        {/* Text */}
        <div className="text-center max-w-sm animate-fade-in" key={current}>
          <h2 className="font-display text-3xl font-bold text-foreground mb-4">
            {slide.title}
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            {slide.description}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-2.5 mt-12 mb-8">
          {SLIDES.map((slide_item, i) => (
            <button
              // biome-ignore lint/suspicious/noArrayIndexKey: stable slide positions
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}: ${slide_item.title}`}
              onClick={() => setCurrent(i)}
              className={cn(
                "rounded-full transition-all duration-300",
                i === current
                  ? "w-6 h-2.5 bg-primary"
                  : "w-2.5 h-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50",
              )}
            />
          ))}
        </div>

        {/* Next button */}
        <Button
          onClick={handleNext}
          className="w-full max-w-xs h-12 text-base font-semibold rounded-xl"
          data-ocid="onboarding.next_button"
        >
          {current === SLIDES.length - 1 ? (
            <>
              Get Started <ChevronRight size={18} className="ml-1" />
            </>
          ) : (
            <>
              Next <ChevronRight size={18} className="ml-1" />
            </>
          )}
        </Button>
      </div>

      {/* App branding at bottom */}
      <div className="text-center pb-6">
        <p className="text-xs text-muted-foreground">
          Paryavekshan · Patient Safety System
        </p>
      </div>
    </div>
  );
}
