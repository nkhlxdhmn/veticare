import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  FileText,
  HeartPulse,
  RotateCcw,
  Shield,
  Stethoscope,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfidenceBar } from "./ConfidenceBar";
import { SeverityBadge } from "./SeverityBadge";
import { FadeIn } from "@/components/ui/motion";

interface PredictionResult {
  disease: string;
  confidence: number;
}

interface GuidanceResult {
  prediction: PredictionResult;
  summary: string;
  possible_causes: string[];
  home_care: string[];
  warning_signs: string[];
  vet_priority: string;
  prevention: string[];
  disclaimer: string;
  emergency: boolean;
  emergency_message?: string;
}

interface ResultDashboardProps {
  result: GuidanceResult;
  onReset: () => void;
}

const SECTIONS = [
  { key: "summary", title: "Summary", icon: FileText },
  { key: "possible_causes", title: "Possible Causes", icon: Stethoscope },
  { key: "home_care", title: "Home Care", icon: HeartPulse },
  { key: "warning_signs", title: "Warning Signs", icon: AlertTriangle },
  { key: "prevention", title: "Prevention", icon: ShieldCheck },
] as const;

type SectionKey = (typeof SECTIONS)[number]["key"];

function Card({
  icon: Icon,
  title,
  children,
  delay,
}: {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <FadeIn delay={delay} y={12}>
      <div className="rounded-xl border border-borderLight bg-white p-5 shadow-sm transition-[box-shadow] duration-[220ms] ease-out hover:shadow-md sm:p-6">
        <div className="mb-3 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
            <Icon className="h-4 w-4 text-textPrimary" />
          </div>
          <h3 className="text-sm font-medium">{title}</h3>
        </div>
        <div className="text-sm leading-relaxed text-textSecondary">{children}</div>
      </div>
    </FadeIn>
  );
}

function ResultDashboard({
  result,
  onReset,
}: ResultDashboardProps) {
  const data: { key: SectionKey; items: string[] }[] = [
    { key: "summary", items: [result.summary] },
    { key: "possible_causes", items: result.possible_causes },
    { key: "home_care", items: result.home_care },
    { key: "warning_signs", items: result.warning_signs },
    { key: "prevention", items: result.prevention },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-textSecondary">
            Assessment Result
          </p>
          <h2 className="mt-1 text-2xl sm:text-3xl">
            Guidance Report
          </h2>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onReset}
          className="shrink-0 gap-1.5 text-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          New
        </Button>
      </div>

      {result.emergency && result.emergency_message && (
        <FadeIn y={12}>
          <div
            className="rounded-xl border-2 border-red-200 bg-red-50 p-5 sm:p-6"
            role="alert"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-red-900">Emergency Detected</h3>
                <p className="mt-1 text-sm leading-relaxed text-red-800">{result.emergency_message}</p>
                <p className="mt-2 text-sm font-semibold text-red-900">
                  Call your veterinarian or emergency animal hospital immediately.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      )}

      <FadeIn delay={50} y={12}>
        <div className="rounded-xl border border-borderLight bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-textSecondary">
                Predicted Condition
              </p>
              <h3 className="mt-1 text-xl sm:text-2xl">
                {result.prediction.disease}
              </h3>
            </div>
            <SeverityBadge priority={result.vet_priority} />
          </div>
          <div className="mt-4">
            <ConfidenceBar value={result.prediction.confidence} />
          </div>
        </div>
      </FadeIn>

      <div className="grid gap-4 sm:grid-cols-2">
        {data.map((s) => {
          if (s.items.length === 0 || (s.items.length === 1 && !s.items[0])) return null;
          const cfg = SECTIONS.find((c) => c.key === s.key)!;
          const idx = data.indexOf(s);
          return (
            <Card key={s.key} icon={cfg.icon} title={cfg.title} delay={150 + idx * 60}>
              {cfg.key === "summary" ? (
                <p className="leading-7">{s.items[0]}</p>
              ) : (
                <ul className="space-y-2">
                  {s.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-textPrimary/40" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          );
        })}
      </div>

      <FadeIn delay={400} y={12}>
        <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-5">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                Disclaimer
              </p>
              <p className="mt-1 text-sm leading-relaxed text-amber-700">
                {result.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}

export { ResultDashboard };
export type { GuidanceResult, PredictionResult };
