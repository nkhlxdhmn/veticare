import type { ReactNode } from "react";
import {
  AlertCircle,
  ChevronDown,
  Dog,
  Clock,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SymptomSelector } from "./SymptomSelector";

const ANIMAL_TYPES = ["Dog", "Cat", "Cattle", "Goat", "Sheep", "Horse", "Poultry"];

const COMMON_SYMPTOMS: Record<string, string[]> = {
  Dog: ["Vomiting", "Diarrhea", "Fever", "Coughing", "Lethargy", "Loss of appetite", "Limping", "Sneezing", "Excessive itching", "Weight loss", "Increased thirst", "Bad breath"],
  Cat: ["Vomiting", "Diarrhea", "Sneezing", "Fever", "Lethargy", "Loss of appetite", "Weight loss", "Increased thirst", "Eye discharge", "Hiding", "Straining to urinate", "Coughing"],
  Cattle: ["Fever", "Reduced milk yield", "Loss of appetite", "Coughing", "Lameness", "Diarrhea", "Weight loss", "Nasal discharge", "Swollen joints", "Bloating"],
  Goat: ["Diarrhea", "Weight loss", "Coughing", "Fever", "Loss of appetite", "Lameness", "Bloating", "Pale membranes", "Rough coat", "Nasal discharge"],
  Sheep: ["Lameness", "Weight loss", "Coughing", "Nasal discharge", "Diarrhea", "Fever", "Loss of appetite", "Itching", "Wool loss", "Isolation"],
  Horse: ["Colic signs", "Lameness", "Coughing", "Nasal discharge", "Weight loss", "Fever", "Loss of appetite", "Lethargy", "Swollen joints", "Difficulty breathing"],
  Poultry: ["Reduced egg production", "Diarrhea", "Coughing", "Sneezing", "Weight loss", "Swollen head", "Lameness", "Ruffled feathers", "Lethargy", "Sudden death"],
};

const fieldBase = "h-11 w-full rounded-md border border-borderLight bg-white px-3 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-textPrimary/30 focus:border-textPrimary placeholder:text-textSecondary/50";

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
          <Icon className="h-4 w-4 text-textPrimary" />
        </div>
        <div>
          <h2 className="text-sm font-medium">{title}</h2>
          {description && (
            <p className="text-xs text-textSecondary">{description}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

interface AssessmentFormProps {
  animalType: string;
  breed: string;
  age: string;
  weight: string;
  duration: string;
  eating: string;
  drinking: string;
  vaccinated: string;
  selectedSymptoms: string[];
  onAnimalTypeChange: (v: string) => void;
  onBreedChange: (v: string) => void;
  onAgeChange: (v: string) => void;
  onWeightChange: (v: string) => void;
  onDurationChange: (v: string) => void;
  onEatingChange: (v: string) => void;
  onDrinkingChange: (v: string) => void;
  onVaccinatedChange: (v: string) => void;
  onToggleSymptom: (s: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string;
}

function AssessmentForm({
  animalType,
  breed,
  age,
  weight,
  duration,
  eating,
  drinking,
  vaccinated,
  selectedSymptoms,
  onAnimalTypeChange,
  onBreedChange,
  onAgeChange,
  onWeightChange,
  onDurationChange,
  onEatingChange,
  onDrinkingChange,
  onVaccinatedChange,
  onToggleSymptom,
  onSubmit,
  loading,
  error,
}: AssessmentFormProps) {
  const activeSymptoms = animalType ? COMMON_SYMPTOMS[animalType] ?? [] : [];

  return (
    <form onSubmit={onSubmit} className="overflow-hidden rounded-xl border border-borderLight bg-white shadow-sm">
      <div className="space-y-6 p-5 sm:p-7">
        <Section icon={Dog} title="Patient" description="Basic information about your pet">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-textSecondary">Animal type</span>
              <div className="relative">
                <select
                  value={animalType}
                  onChange={(e) => { onAnimalTypeChange(e.target.value); }}
                  className={`${fieldBase} appearance-none`}
                >
                  <option value="">Select...</option>
                  {ANIMAL_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textSecondary" />
              </div>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-textSecondary">Breed</span>
              <input type="text" value={breed} onChange={(e) => onBreedChange(e.target.value)} className={fieldBase} placeholder="e.g. Labrador" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-textSecondary">Age (years)</span>
              <input type="number" value={age} onChange={(e) => onAgeChange(e.target.value)} className={fieldBase} placeholder="e.g. 4" min="0" max="100" step="0.5" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-textSecondary">Weight (kg)</span>
              <input type="number" value={weight} onChange={(e) => onWeightChange(e.target.value)} className={fieldBase} placeholder="e.g. 25" min="0" step="0.1" />
            </label>
          </div>
        </Section>

        <hr className="border-borderLight" />

        <Section icon={AlertCircle} title="Symptoms" description="Select all that apply">
          {!animalType ? (
            <p className="py-3 text-sm text-textSecondary">Select an animal type first.</p>
          ) : (
            <div className="space-y-3">
              {selectedSymptoms.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedSymptoms.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 rounded-full bg-textPrimary px-3 py-1 text-xs font-medium text-white"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => onToggleSymptom(s)}
                        className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full hover:opacity-80"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <SymptomSelector
                symptoms={activeSymptoms}
                selected={selectedSymptoms}
                onToggle={onToggleSymptom}
              />
              <p className="text-xs text-textSecondary">
                {selectedSymptoms.length} selected
              </p>
            </div>
          )}
        </Section>

        <hr className="border-borderLight" />

        <Section icon={Clock} title="Context" description="Duration and health status">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-textSecondary">Duration</span>
              <input type="text" value={duration} onChange={(e) => onDurationChange(e.target.value)} className={fieldBase} placeholder="e.g. 2 days" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-textSecondary">Vaccinated?</span>
              <div className="relative">
                <select
                  value={vaccinated}
                  onChange={(e) => onVaccinatedChange(e.target.value)}
                  className={`${fieldBase} appearance-none`}
                >
                  <option value="">Not specified</option>
                  <option value="yes">Yes, up to date</option>
                  <option value="no">No / Not sure</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textSecondary" />
              </div>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-textSecondary">Eating?</span>
              <div className="relative">
                <select
                  value={eating}
                  onChange={(e) => onEatingChange(e.target.value)}
                  className={`${fieldBase} appearance-none`}
                >
                  <option value="">Not specified</option>
                  <option value="yes">Normally</option>
                  <option value="reduced">Reduced appetite</option>
                  <option value="no">Not eating</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textSecondary" />
              </div>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-textSecondary">Drinking?</span>
              <div className="relative">
                <select
                  value={drinking}
                  onChange={(e) => onDrinkingChange(e.target.value)}
                  className={`${fieldBase} appearance-none`}
                >
                  <option value="">Not specified</option>
                  <option value="yes">Normally</option>
                  <option value="reduced">Drinking less</option>
                  <option value="increased">More than usual</option>
                  <option value="no">Not drinking</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textSecondary" />
              </div>
            </label>
          </div>
        </Section>
      </div>

      {error && (
        <div className="mx-5 mb-2 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-4 sm:mx-7">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex justify-end border-t border-borderLight bg-gray-50/50 px-5 py-4 sm:px-7">
        <Button
          type="submit"
          loading={loading}
          disabled={!animalType || selectedSymptoms.length === 0}
          className="w-full gap-2 sm:w-auto sm:min-w-[200px]"
        >
          <Brain className="h-4 w-4" />
          Analyse
        </Button>
      </div>
    </form>
  );
}

export { AssessmentForm };
export type { AssessmentFormProps };
