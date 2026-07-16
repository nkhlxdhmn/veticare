import { useState, useMemo } from "react";
import { Bell, Edit3, Plus, Syringe, Trash2, AlertCircle, Loader2, X, Search } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

type BackendPet = { id: string; name: string; species: string | null };
type BackendVax = {
  id: string; pet_id: string; vaccine_name: string; vaccination_date: string;
  next_due_date: string | null; dose: string | null; clinic_name: string | null;
  veterinarian: string | null; notes: string | null; certificate_url: string | null;
  reminder_enabled: boolean;
};

const fieldStyle = "mt-1 h-11 w-full rounded-md border border-borderLight bg-white px-3 text-sm outline-none focus:ring-1 focus:ring-textPrimary";

function VaxForm({ petId, initial, onDone }: { petId: string; initial?: Partial<BackendVax>; onDone: () => void }) {
  const queryClient = useQueryClient();
  const isEdit = !!initial?.id;
  const [name, setName] = useState(initial?.vaccine_name ?? "");
  const [dateGiven, setDateGiven] = useState(initial?.vaccination_date ?? "");
  const [nextDue, setNextDue] = useState(initial?.next_due_date ?? "");
  const [veterinarian, setVeterinarian] = useState(initial?.veterinarian ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Vaccine name is required");
    if (!dateGiven) return setError("Date given is required");
    setSaving(true); setError("");
    try {
      const payload: Record<string, unknown> = {
        vaccine_name: name.trim(), vaccination_date: dateGiven,
        next_due_date: nextDue || undefined, veterinarian: veterinarian.trim() || undefined,
        notes: notes.trim() || undefined,
      };
      if (isEdit) {
        await api.patch(`/vaccinations/${initial.id}`, payload);
      } else {
        await api.post("/vaccinations", { ...payload, pet_id: petId });
      }
      queryClient.invalidateQueries({ queryKey: ["vaccinations", petId] });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save vaccination");
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <label className="text-sm font-medium">Vaccine name *<input value={name} onChange={e => setName(e.target.value)} className={fieldStyle} /></label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">Date given *<input type="date" value={dateGiven} onChange={e => setDateGiven(e.target.value)} className={fieldStyle} /></label>
        <label className="text-sm font-medium">Next due date<input type="date" value={nextDue} onChange={e => setNextDue(e.target.value)} className={fieldStyle} /></label>
      </div>
      <label className="text-sm font-medium">Veterinarian<input value={veterinarian} onChange={e => setVeterinarian(e.target.value)} className={fieldStyle} /></label>
      <label className="text-sm font-medium">Notes<textarea value={notes} onChange={e => setNotes(e.target.value)} className="mt-1 min-h-[60px] w-full rounded-md border border-borderLight bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-textPrimary" /></label>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}{isEdit ? "Update" : "Add"} vaccination</Button>
      </div>
    </form>
  );
}

function DeleteConfirmVax({ record, petId, onDone }: { record: BackendVax; petId: string; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState(false);
  const del = async () => {
    setDeleting(true);
    try { await api.delete(`/vaccinations/${record.id}`); queryClient.invalidateQueries({ queryKey: ["vaccinations", petId] }); onDone(); }
    catch { setDeleting(false); }
  };
  return <div className="space-y-4"><p className="text-sm text-textSecondary">Remove <strong>{record.vaccine_name}</strong> vaccination?</p><div className="flex justify-end gap-3"><Button variant="outline" onClick={onDone} disabled={deleting}>Cancel</Button><Button onClick={del} disabled={deleting} className="bg-red-700 hover">{deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Delete</Button></div></div>;
}

function StatusBadge({ status }: { status: string }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status === "Overdue" ? "bg-red-50 text-red-700" : status === "Upcoming" ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}>{status}</span>;
}

export default function Vaccinations() {
  const [petId, setPetId] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editVax, setEditVax] = useState<BackendVax | null>(null);
  const [deleteVax, setDeleteVax] = useState<BackendVax | null>(null);
  const queryClient = useQueryClient();

  const { data: pets } = useQuery<BackendPet[]>({ queryKey: ["pets"], queryFn: () => api.get("/pets") });
  const { data: vaxData, isLoading, error } = useQuery<BackendVax[]>({
    queryKey: ["vaccinations", petId],
    queryFn: () => api.get(`/vaccinations/${petId}`),
    enabled: !!petId,
  });

  const filtered = useMemo(() => {
    if (!vaxData) return [];
    return vaxData.filter(v => v.vaccine_name.toLowerCase().includes(search.toLowerCase()));
  }, [vaxData, search]);

  const overdue = filtered.filter(v => v.next_due_date && new Date(v.next_due_date) < new Date());

  const toggleReminder = async (record: BackendVax) => {
    try {
      await api.patch(`/vaccinations/${record.id}`, { reminder_enabled: !record.reminder_enabled });
      queryClient.invalidateQueries({ queryKey: ["vaccinations", petId] });
    } catch {}
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-12 xl:px-24 py-10 md:py-16 animate-fade-in">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-textSecondary">Digital health passport</p>
        <h1 className="mt-3 text-4xl md:text-5xl lg:text-6xl">Vaccination Records</h1>
        <p className="mt-4 text-base md:text-lg text-textSecondary">Track vaccinations and stay updated with upcoming schedules.</p>
      </header>

      <div className="mt-6 md:mt-8 flex flex-col gap-3 sm:flex-row">
        <select value={petId} onChange={e => setPetId(e.target.value)} className="h-11 w-full sm:w-auto min-w-[200px] rounded-md border border-borderLight bg-white px-3 text-sm text-textSecondary">
          <option value="">Select a pet...</option>
          {pets?.map(p => <option key={p.id} value={p.id}>{p.name} ({p.species ?? "Pet"})</option>)}
        </select>
        {petId && (
          <label className="flex flex-1 items-center gap-3 rounded-md border border-borderLight px-4">
            <Search className="h-4 w-4 text-textSecondary" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="h-11 w-full outline-none" placeholder="Search vaccines" />
          </label>
        )}
      </div>

      {!petId && (
        <div className="mt-20 flex flex-col items-center justify-center text-center">
          <Syringe className="h-12 w-12 text-textSecondary" />
          <p className="mt-4 text-xl font-medium">Select a pet to view vaccinations</p>
          <p className="mt-2 text-sm text-textSecondary">Choose a pet from the dropdown above.</p>
        </div>
      )}

      {petId && isLoading && (
        <div className="mt-10 space-y-4">{[1,2,3].map(i => <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />)}</div>
      )}

      {petId && error && (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-sm text-red-700">Failed to load vaccinations.</p>
          <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["vaccinations", petId] })}>Retry</Button>
        </div>
      )}

      {petId && !isLoading && !error && filtered.length === 0 && (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-borderLight py-20 text-center">
          <Syringe className="h-10 w-10 text-textSecondary" />
          <p className="mt-4 text-lg font-medium">{search ? "No vaccines match your search" : "No vaccination records"}</p>
          <p className="mt-2 text-sm text-textSecondary">{search ? "Try a different search." : "Add the first vaccination record."}</p>
          {!search && <Button className="mt-6 rounded-full" onClick={() => { setEditVax(null); setShowModal(true); }}><Plus className="mr-2 h-4 w-4" />Add vaccination</Button>}
        </div>
      )}

      {petId && !isLoading && !error && filtered.length > 0 && (
        <>
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-textSecondary">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</p>
            <Button size="sm" className="rounded-full" onClick={() => { setEditVax(null); setShowModal(true); }}><Plus className="mr-1 h-4 w-4" />Add</Button>
          </div>

          {overdue.length > 0 && (
            <section className="mt-6 flex flex-col justify-between gap-4 border border-red-200 bg-red-50 px-6 py-5 sm:flex-row sm:items-center">
              <div>
                <p className="font-semibold text-red-900">{overdue.length} vaccination{overdue.length !== 1 ? "s" : ""} overdue</p>
                <p className="mt-1 text-sm text-red-800">{overdue[0].vaccine_name} is overdue. Contact your clinic to schedule a visit.</p>
              </div>
            </section>
          )}

          <div className="mt-6 space-y-3">
            {filtered.map(v => {
              const dueDate = v.next_due_date ? new Date(v.next_due_date) : null;
              const status = !dueDate ? "Completed" : dueDate < new Date() ? "Overdue" : "Upcoming";
              return (
                <div key={v.id} className="flex flex-col gap-3 rounded-xl border border-borderLight bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="mt-1"><Syringe className="h-5 w-5 text-textSecondary" /></div>
                    <div>
                      <p className="font-medium">{v.vaccine_name}</p>
                      <p className="mt-0.5 text-sm text-textSecondary">Given: {v.vaccination_date}{v.next_due_date ? ` · Due: ${v.next_due_date}` : ""}</p>
                      {v.veterinarian && <p className="text-sm text-textSecondary">{v.veterinarian}</p>}
                      {v.notes && <p className="mt-1 text-sm text-textSecondary">{v.notes}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={status} />
                    <button onClick={() => toggleReminder(v)} className={`rounded-full p-2 transition ${v.reminder_enabled ? "bg-blue-100 text-blue-700" : "bg-gray-50 text-textSecondary hover:bg-gray-100"}`} title={v.reminder_enabled ? "Reminder on" : "Enable reminder"}><Bell className="h-4 w-4" /></button>
                    <button onClick={() => { setEditVax(v); setShowModal(true); }} className="rounded-full p-2 text-textSecondary transition hover:bg-gray-100"><Edit3 className="h-4 w-4" /></button>
                    <button onClick={() => setDeleteVax(v)} className="rounded-full p-2 text-red-500 transition hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {showModal && petId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => { if (!editVax) setShowModal(false); }}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl">{editVax ? "Edit vaccination" : "Add vaccination"}</h2>
              <button onClick={() => setShowModal(false)}><X className="h-5 w-5" /></button>
            </div>
            <VaxForm petId={petId} initial={editVax ?? undefined} onDone={() => { setShowModal(false); setEditVax(null); }} />
          </div>
        </div>
      )}

      {deleteVax && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-2xl">Delete vaccination</h2>
            <DeleteConfirmVax record={deleteVax} petId={petId} onDone={() => setDeleteVax(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
