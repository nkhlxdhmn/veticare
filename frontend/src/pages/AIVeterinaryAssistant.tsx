import { useCallback, useState } from "react";
import { AIAssistantHero } from "@/components/ai-assistant/AIAssistantHero";
import { AIAssistantSkeleton } from "@/components/ai-assistant/AIAssistantSkeleton";
import { AssessmentForm } from "@/components/ai-assistant/AssessmentForm";
import { ResultDashboard } from "@/components/ai-assistant/ResultDashboard";
import { toast } from "sonner";
import { aiApi, ApiError } from "@/lib/api";
import type { GuidanceResult } from "@/components/ai-assistant/ResultDashboard";

type PageState = "form" | "loading" | "result" | "error";

export default function AIVeterinaryAssistant() {
  const [pageState, setPageState] = useState<PageState>("form");
  const [animalType, setAnimalType] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [duration, setDuration] = useState("");
  const [eating, setEating] = useState("");
  const [drinking, setDrinking] = useState("");
  const [vaccinated, setVaccinated] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GuidanceResult | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleSymptom = useCallback((s: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(s) ? prev.filter((v) => v !== s) : [...prev, s],
    );
  }, []);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!animalType) {
        setError("Please select an animal type.");
        return;
      }
      if (selectedSymptoms.length === 0) {
        setError("Please select at least one symptom.");
        return;
      }

      setLoading(true);
      setError("");
      setPageState("loading");

      try {
        const data = await aiApi.post<GuidanceResult>("/api/ai-assistant", {
          animal_type: animalType,
          breed: breed || undefined,
          age: age ? parseFloat(age) : undefined,
          weight: weight ? parseFloat(weight) : undefined,
          symptoms: selectedSymptoms,
          duration: duration || undefined,
          eating: eating || undefined,
          drinking: drinking || undefined,
          vaccinated: vaccinated ? vaccinated === "yes" : undefined,
        });

        setResult(data);
        setPageState("result");
        toast.success("Assessment complete.");
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : "Failed to connect. Ensure the backend is running.";
        setError(message);
        toast.error(message);
        setPageState("form");
      } finally {
        setLoading(false);
      }
    },
    [animalType, breed, age, weight, selectedSymptoms, duration, eating, drinking, vaccinated],
  );

  const reset = useCallback(() => {
    setPageState("form");
    setResult(null);
    setError("");
    setSelectedSymptoms([]);
  }, []);

  return (
    <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-12 xl:px-24 py-10 md:py-16 animate-fade-in">
      <div className="space-y-6 sm:space-y-8">
        <AIAssistantHero />

        {pageState === "loading" ? (
          <AIAssistantSkeleton />
        ) : pageState === "result" && result ? (
          <ResultDashboard
            result={result}
            onReset={reset}
          />
        ) : (
          <AssessmentForm
            animalType={animalType}
            breed={breed}
            age={age}
            weight={weight}
            duration={duration}
            eating={eating}
            drinking={drinking}
            vaccinated={vaccinated}
            selectedSymptoms={selectedSymptoms}
            onAnimalTypeChange={(v) => {
              setAnimalType(v);
              setSelectedSymptoms([]);
            }}
            onBreedChange={setBreed}
            onAgeChange={setAge}
            onWeightChange={setWeight}
            onDurationChange={setDuration}
            onEatingChange={setEating}
            onDrinkingChange={setDrinking}
            onVaccinatedChange={setVaccinated}
            onToggleSymptom={toggleSymptom}
            onSubmit={submit}
            loading={loading}
            error={error}
          />
        )}
      </div>
    </div>
  );
}
