import { useState, useMemo } from "react";
import { ChevronRight, HeartPulse, Loader2, Search, ChevronLeft, AlertCircle, Stethoscope, Check, X, RotateCcw } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonPredictionCard } from "@/components/ui/skeleton";

type Species = string;
type BackendPrediction = {
  id: string; pet_id: string | null; user_id?: string;
  species: string | null; breed?: string | null; age?: number | null; gender?: string | null;
  symptoms: string[] | null;
  predicted_disease: string; confidence: number;
  model_version: string; created_at: string;
};
type PredictResult = {
  disease: string; confidence: number;
  top_predictions: { disease: string; confidence: number }[];
  species: string; symptoms: string[];
};
type BackendPet = { id: string; name: string; species: string | null };

const fieldStyle = "mt-2 h-11 w-full rounded-md border border-borderLight bg-white px-3 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-textPrimary/30 focus:border-textPrimary";

function ConfidenceCircle({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="relative grid h-24 md:h-28 w-24 md:w-28 place-items-center rounded-full shrink-0" style={{ background: `conic-gradient(#111 ${pct * 3.6}deg, #e5e7eb 0deg)` }}>
      <div className="grid h-16 md:h-20 w-16 md:w-20 place-items-center rounded-full bg-white">
        <strong className="text-xl md:text-2xl font-normal">{pct}%</strong>
        <span className="text-[9px] md:text-[10px] uppercase tracking-wider text-textSecondary">confidence</span>
      </div>
    </div>
  );
}

export default function DiseasePrediction() {
  const [step, setStep] = useState(1);
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [symptomSearch, setSymptomSearch] = useState("");
  const [isPredicting, setPredicting] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PredictResult | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [linkPetId, setLinkPetId] = useState("");

  const [historySearch, setHistorySearch] = useState("");
  const [historyPage, setHistoryPage] = useState(0);
  const [filterSpecies, setFilterSpecies] = useState("");
  const historyLimit = 10;

  const queryClient = useQueryClient();

  const { data: speciesList } = useQuery<Species[]>({
    queryKey: ["prediction-species"],
    queryFn: () => api.get("/predictions/species"),
    staleTime: 600_000,
  });

  const { data: symptomsList, isLoading: symptomsLoading } = useQuery<string[]>({
    queryKey: ["prediction-symptoms", species],
    queryFn: () => api.get(`/predictions/species/${encodeURIComponent(species)}/symptoms`),
    enabled: !!species,
    staleTime: 600_000,
  });

  const { data: pets } = useQuery<BackendPet[]>({
    queryKey: ["pets"],
    queryFn: () => api.get("/pets"),
  });

  const { data: historyRaw, isLoading: histLoading, error: histError } = useQuery<BackendPrediction[]>({
    queryKey: ["predictions", "all", historyPage],
    queryFn: () => api.get(`/predictions/user/all?offset=${historyPage * historyLimit}&limit=${historyLimit}`),
  });

  const petMap = useMemo(() => {
    const m = new Map<string, string>();
    pets?.forEach(p => m.set(p.id, p.name));
    return m;
  }, [pets]);

  const filteredSymptoms = useMemo(() => {
    if (!symptomsList) return [];
    if (!symptomSearch) return symptomsList;
    return symptomsList.filter(s => s.toLowerCase().includes(symptomSearch.toLowerCase()));
  }, [symptomsList, symptomSearch]);

  const filteredHistory = useMemo(() => {
    if (!historyRaw) return [];
    return historyRaw.filter(h => {
      const s = historySearch.toLowerCase();
      if (s && !h.predicted_disease.toLowerCase().includes(s) && !(h.species?.toLowerCase().includes(s))) return false;
      if (filterSpecies && h.species !== filterSpecies) return false;
      return true;
    });
  }, [historyRaw, historySearch, filterSpecies]);

  const speciesSet = useMemo(() => {
    if (!historyRaw) return new Set<string>();
    return new Set(historyRaw.map(h => h.species).filter(Boolean) as string[]);
  }, [historyRaw]);

  const toggleSymptom = (item: string) => {
    setSelected(prev => prev.includes(item) ? prev.filter(v => v !== item) : [...prev, item]);
  };

  const runPrediction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!species) return setError("Please select an animal species");
    if (selected.length === 0) return setError("Please select at least one symptom");
    setPredicting(true); setError(""); setResult(null); setSaveSuccess(false);
    try {
      const res = await api.post<PredictResult>("/predictions/predict", {
        animal_name: species,
        symptoms: selected,
        breed: breed || undefined,
        age: age ? parseInt(age, 10) : undefined,
        gender: gender || undefined,
      });
      setResult(res);
      setStep(3);
    } catch (err) {
      if (err instanceof ApiError && err.status === 503) {
        setError("ML model is not available. Please try again later.");
      } else if (err instanceof ApiError && err.status === 422) {
        setError("Invalid request. Please check your inputs.");
      } else {
        setError(err instanceof Error ? err.message : "Prediction failed. Please try again.");
      }
    } finally { setPredicting(false); }
  };

  const saveResult = async () => {
    if (!result) return;
    setSaving(true); setError("");
    try {
      await api.post("/predictions/save", {
        animal_name: result.species,
        symptoms: result.symptoms,
        predicted_disease: result.disease,
        confidence: result.confidence,
        breed: breed || undefined,
        age: age ? parseInt(age, 10) : undefined,
        gender: gender || undefined,
        pet_id: linkPetId || undefined,
      });
      setSaveSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["predictions", "all"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save prediction");
    } finally { setSaving(false); }
  };

  const resetAll = () => {
    setStep(1);
    setResult(null);
    setSelected([]);
    setSpecies("");
    setBreed("");
    setAge("");
    setGender("");
    setError("");
    setSaveSuccess(false);
    setLinkPetId("");
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-12 xl:px-24 py-10 md:py-16 animate-fade-in">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-textSecondary">Clinical support · AI assessment</p>
        <h1 className="mt-3 text-4xl md:text-5xl lg:text-6xl">Disease Prediction</h1>
        <p className="mt-4 text-base md:text-lg leading-8 text-textSecondary">Predict common animal diseases using Artificial Intelligence. Works for any animal — no registration required.</p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <main>
          <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-textSecondary">
            {[1, 2, 3].map(i => (
              <span key={i} className="flex items-center gap-2">
                <span className={`grid h-7 w-7 place-items-center rounded-full transition-all duration-200 ${step >= i ? "bg-textPrimary text-white" : "border border-borderLight"}`}>{i}</span>
                <span className={step >= i ? "" : "text-textSecondary/50"}>
                  {i === 1 ? "Animal info" : i === 2 ? "Symptoms" : "Results"}
                </span>
                {i < 3 && <ChevronRight className="h-4 w-4" />}
              </span>
            ))}
          </div>

          <form onSubmit={runPrediction} className="space-y-6">
            <section className="rounded-xl border border-borderLight bg-white p-5 md:p-8 transition-all duration-200 hover:shadow-sm">
              <div className="flex items-center gap-3">
                <HeartPulse className="h-5 w-5" />
                <h2 className="text-xl md:text-2xl">Animal information</h2>
              </div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-medium">
                  Species *
                  <select value={species} onChange={e => { setSpecies(e.target.value); setSelected([]); setResult(null); setSaveSuccess(false); setStep(1); }} className={fieldStyle} required>
                    <option value="">Select species...</option>
                    {speciesList?.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <label className="text-sm font-medium">
                  Breed
                  <input value={breed} onChange={e => setBreed(e.target.value)} className={fieldStyle} placeholder="e.g. Labrador" />
                </label>
                <label className="text-sm font-medium">
                  Age (years)
                  <input type="number" min="0" max="100" value={age} onChange={e => setAge(e.target.value)} className={fieldStyle} placeholder="Optional" />
                </label>
                <label className="text-sm font-medium">
                  Gender
                  <select value={gender} onChange={e => setGender(e.target.value)} className={fieldStyle}>
                    <option value="">Not specified</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="rounded-xl border border-borderLight bg-white p-5 md:p-8 transition-all duration-200 hover:shadow-sm">
              <div className="flex items-center gap-3">
                <Stethoscope className="h-5 w-5" />
                <h2 className="text-xl md:text-2xl">Symptoms</h2>
              </div>
              {!species ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Stethoscope className="h-8 w-8 md:h-10 md:w-10 text-gray-300" />
                  <p className="mt-3 text-sm text-textSecondary">Select a species above to load available symptoms.</p>
                </div>
              ) : symptomsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-textSecondary" />
                  <span className="ml-3 text-sm text-textSecondary">Loading symptoms...</span>
                </div>
              ) : (
                <>
                  {selected.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {selected.map(s => (
                        <span key={s} className="inline-flex items-center gap-1.5 rounded-full bg-textPrimary px-3 py-1.5 text-xs text-white transition-all duration-200">
                          {s}
                          <button type="button" onClick={() => toggleSymptom(s)} className="hover:opacity-80"><X className="h-3 w-3" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-textSecondary" />
                    <input value={symptomSearch} onChange={e => setSymptomSearch(e.target.value)} className="h-11 w-full rounded-md border border-borderLight pl-9 pr-3 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-textPrimary/30 focus:border-textPrimary" placeholder="Search symptoms..." />
                  </div>
                  <div className="flex max-h-60 flex-wrap gap-2 overflow-y-auto">
                    {filteredSymptoms.length === 0 ? (
                      <p className="w-full py-4 text-center text-sm text-textSecondary">No symptoms match your search.</p>
                    ) : (
                      filteredSymptoms.map(s => (
                        <button key={s} type="button" onClick={() => toggleSymptom(s)} disabled={!selected.includes(s) && selected.length >= 10} className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-all duration-200 ${selected.includes(s) ? "bg-textPrimary text-white" : "border border-borderLight hover:bg-gray-50 hover:border-textPrimary/30 disabled:opacity-30"}`}>
                          {selected.includes(s) && <Check className="h-3 w-3" />}
                          {s}
                        </button>
                      ))
                    )}
                  </div>
                  {selected.length > 0 && <p className="mt-3 text-xs text-textSecondary">{selected.length}/10 symptoms selected</p>}
                </>
              )}
            </section>

            {error && (
              <div className="animate-card-entrance">
                <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />{error}
                </p>
              </div>
            )}

            <section className="rounded-xl border border-borderLight bg-white p-5 md:p-8 transition-all duration-200 hover:shadow-sm">
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12h6" /><path d="M12 9v6" /></svg>
                <h2 className="text-xl md:text-2xl">Prediction results</h2>
              </div>
              {isPredicting ? (
                <div className="flex flex-col items-center justify-center py-14 gap-4">
                  <div className="relative"><Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin text-textSecondary" /></div>
                  <p className="text-sm text-textSecondary">Analysing symptoms with ML model...</p>
                </div>
              ) : result ? (
                <div className="mt-6 space-y-5 md:space-y-6 animate-card-entrance">
                  <div className="flex flex-col items-center gap-5 md:flex-row">
                    <ConfidenceCircle value={result.confidence} />
                    <div>
                      <h3 className="text-xl md:text-2xl font-medium">{result.disease}</h3>
                      <p className="mt-1 text-sm text-textSecondary">Species: {result.species}</p>
                    </div>
                  </div>
                  {result.top_predictions && result.top_predictions.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-textSecondary">Top predictions</p>
                      <div className="space-y-1.5">
                        {result.top_predictions.map((p, i) => (
                          <div key={i} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm">
                            <span>{p.disease}</span>
                            <span className="text-xs text-textSecondary">{Math.round(p.confidence * 100)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="border-t border-borderLight pt-5">
                    <p className="mb-3 text-sm font-medium">Save to your history</p>
                    {saveSuccess ? (
                      <div className="flex items-center gap-2 rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">
                        <Check className="h-4 w-4" /> Prediction saved successfully
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm">
                          <span className="text-textSecondary">Link to pet (optional):</span>
                          <select value={linkPetId} onChange={e => setLinkPetId(e.target.value)} className="h-9 rounded border border-borderLight px-2 text-xs transition-all duration-200 focus:ring-2 focus:ring-textPrimary/30">
                            <option value="">Don't link</option>
                            {pets?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        </label>
                        <Button type="button" onClick={saveResult} loading={isSaving} size="sm">
                          {isSaving ? "Saving..." : "Save prediction"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <Stethoscope className="h-8 w-8 md:h-10 md:w-10 text-gray-300" />
                  <p className="mt-3 text-sm text-textSecondary">Select species and symptoms, then run the prediction.</p>
                </div>
              )}
              <div className="mt-5 flex justify-end gap-3">
                {result && <Button type="button" variant="outline" onClick={resetAll}><RotateCcw className="mr-1.5 h-4 w-4" />New prediction</Button>}
                <Button type="submit" loading={isPredicting} disabled={isPredicting || !species || selected.length === 0}>
                  {result ? "Re-run" : "Run prediction"}
                </Button>
              </div>
            </section>
          </form>
        </main>

        <aside>
          <div className="sticky top-24 rounded-xl border border-borderLight bg-white p-5 transition-all duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">History</h3>
              <button onClick={() => queryClient.invalidateQueries({ queryKey: ["predictions", "all"] })} className="text-textSecondary transition-colors duration-200 hover:text-textPrimary"><RotateCcw className="h-4 w-4" /></button>
            </div>

            <div className="mt-4 space-y-2">
              <label className="relative block">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-textSecondary" />
                <input value={historySearch} onChange={e => setHistorySearch(e.target.value)} className="h-9 w-full rounded-md border border-borderLight pl-8 pr-2 text-xs outline-none transition-all duration-200 focus:ring-2 focus:ring-textPrimary/30 focus:border-textPrimary" placeholder="Search diseases or species" />
              </label>
              <select value={filterSpecies} onChange={e => setFilterSpecies(e.target.value)} className="h-9 w-full rounded-md border border-borderLight px-2 text-xs transition-all duration-200 focus:ring-2 focus:ring-textPrimary/30">
                <option value="">All species</option>
                {[...speciesSet].sort().map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="mt-4 space-y-2">
              {histLoading && (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <SkeletonPredictionCard key={i} />)}
                </div>
              )}
              {histError && !histLoading && (
                <ErrorState
                  message="Failed to load history."
                  onRetry={() => queryClient.invalidateQueries({ queryKey: ["predictions", "all", historyPage] })}
                />
              )}
              {!histLoading && !histError && filteredHistory.length === 0 && (
                <EmptyState
                  icon={Stethoscope}
                  title="No predictions yet"
                  description="Your prediction history will appear here."
                />
              )}
              {!histLoading && !histError && filteredHistory.map((h, i) => (
                <div key={h.id} className="rounded-md border border-borderLight p-3 transition-all duration-200 hover:bg-gray-50" style={{ animationDelay: `${i * 40}ms` }}>
                  <p className="text-xs font-medium">{h.predicted_disease}</p>
                  <p className="mt-1 text-[10px] text-textSecondary">
                    {h.species ?? "Unknown species"}
                    {h.pet_id ? ` · ${petMap.get(h.pet_id) ?? "Unknown pet"}` : ""}
                    {" · "}{Math.round(h.confidence * 100)}%
                  </p>
                  {h.symptoms && h.symptoms.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {h.symptoms.slice(0, 3).map(s => <span key={s} className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] text-textSecondary">{s}</span>)}
                      {h.symptoms.length > 3 && <span className="text-[9px] text-textSecondary">+{h.symptoms.length - 3}</span>}
                    </div>
                  )}
                  <p className="mt-1 text-[10px] text-textSecondary">{new Date(h.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <Button size="sm" variant="ghost" disabled={historyPage === 0} onClick={() => setHistoryPage(p => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-xs text-textSecondary">Page {historyPage + 1}</span>
              <Button size="sm" variant="ghost" disabled={!historyRaw || historyRaw.length < historyLimit} onClick={() => setHistoryPage(p => p + 1)}><ChevronLeft className="h-4 w-4 rotate-180" /></Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
