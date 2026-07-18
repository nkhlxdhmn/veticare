import { cn } from "@/lib/utils";

function SymptomTag({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary/30",
        selected
          ? "border-textPrimary bg-textPrimary text-white"
          : "border-borderLight bg-white text-textSecondary hover:border-textPrimary/40 hover:text-textPrimary",
      )}
      aria-pressed={selected}
    >
      {label}
    </button>
  );
}

function SymptomSelector({
  symptoms,
  selected,
  onToggle,
}: {
  symptoms: string[];
  selected: string[];
  onToggle: (symptom: string) => void;
}) {
  if (symptoms.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {symptoms.map((s) => (
        <SymptomTag
          key={s}
          label={s}
          selected={selected.includes(s)}
          onClick={() => onToggle(s)}
        />
      ))}
    </div>
  );
}

export { SymptomSelector };
