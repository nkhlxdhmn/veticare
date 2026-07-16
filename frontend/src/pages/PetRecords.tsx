import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Edit3, Plus, Search, Trash2, AlertCircle, Loader2, X, CheckCircle2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";

export const PET_SPECIES = ["Dog", "Cat", "Bird", "Horse", "Rabbit", "Fish", "Cattle"];

type BackendPet = {
  id: string; name: string; species: string | null; breed: string | null;
  dob: string | null; gender: string | null; weight: number | null;
  color: string | null; image_url: string | null; notes: string | null;
  created_at: string;
};

const fieldStyle = "mt-1 h-11 w-full rounded-md border border-borderLight bg-white px-3 text-sm outline-none focus:ring-1 focus:ring-textPrimary disabled:opacity-50";
const fieldErrorStyle = "mt-1 h-11 w-full rounded-md border border-red-300 bg-white px-3 text-sm outline-none focus:ring-1 focus:ring-red-400";
const labelStyle = "text-sm font-medium";

function PetForm({ initial, onDone }: { initial?: Partial<BackendPet>; onDone: () => void }) {
  const queryClient = useQueryClient();
  const isEdit = !!initial?.id;

  const [name, setName] = useState(initial?.name ?? "");
  const [species, setSpecies] = useState(initial?.species ?? "");
  const [breed, setBreed] = useState(initial?.breed ?? "");
  const [gender, setGender] = useState(initial?.gender ?? "");
  const [dob, setDob] = useState(initial?.dob ?? "");
  const [weight, setWeight] = useState(initial?.weight?.toString() ?? "");
  const [color, setColor] = useState(initial?.color ?? "");
  const [imageUrl, setImageUrl] = useState("");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Pet name is required";
    if (!species) errs.species = "Species is required";
    if (!gender) errs.gender = "Gender is required";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const isFormValid = name.trim().length > 0 && species.length > 0 && gender.length > 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true); setError(""); setSuccess(false);
    try {
      const payload: Record<string, unknown> = {
        name: name.trim(),
        species,
        breed: breed.trim() || undefined,
        gender: gender.trim(),
        dob: dob || undefined,
        weight: weight ? parseFloat(weight) : undefined,
        color: color.trim() || undefined,
        notes: notes.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
      };
      if (isEdit) {
        await api.patch(`/pets/${initial.id}`, payload);
      } else {
        await api.post("/pets", payload);
      }
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      setSuccess(true);
      setTimeout(onDone, 600);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) setError("Your session has expired. Please log in again.");
        else if (err.status === 400) setError(err.message || "Please check your input and try again.");
        else if (err.status === 409) setError("A pet with this name already exists.");
        else if (err.status >= 500) setError("Server error. Please try again later.");
        else setError(err.message);
      } else {
        setError("Failed to save pet. Please try again.");
      }
    } finally { setSaving(false); }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <CheckCircle2 className="h-10 w-10 md:h-12 md:w-12 text-green-600" />
        <p className="mt-3 text-base md:text-lg font-medium">Pet added successfully</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2"><AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelStyle}>
          Name *
          <input value={name} onChange={e => { setName(e.target.value); setFieldErrors(p => ({ ...p, name: "" })); }}
            className={fieldErrors.name ? fieldErrorStyle : fieldStyle} placeholder="e.g. Bella" />
          {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
        </label>

        <label className={labelStyle}>
          Species *
          <select value={species} onChange={e => { setSpecies(e.target.value); setFieldErrors(p => ({ ...p, species: "" })); }}
            className={fieldErrors.species ? fieldErrorStyle : fieldStyle}>
            <option value="">Select species...</option>
            {PET_SPECIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {fieldErrors.species && <p className="mt-1 text-xs text-red-600">{fieldErrors.species}</p>}
        </label>

        <label className={labelStyle}>
          Breed
          <input value={breed} onChange={e => setBreed(e.target.value)} className={fieldStyle} placeholder="e.g. Golden Retriever" />
        </label>

        <label className={labelStyle}>
          Gender *
          <select value={gender} onChange={e => { setGender(e.target.value); setFieldErrors(p => ({ ...p, gender: "" })); }}
            className={fieldErrors.gender ? fieldErrorStyle : fieldStyle}>
            <option value="">Select gender...</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          {fieldErrors.gender && <p className="mt-1 text-xs text-red-600">{fieldErrors.gender}</p>}
        </label>

        <label className={labelStyle}>
          Birth date
          <input type="date" value={dob} onChange={e => setDob(e.target.value)} className={fieldStyle} />
        </label>

        <label className={labelStyle}>
          Weight (kg)
          <input type="number" step="0.1" min="0" value={weight} onChange={e => setWeight(e.target.value)} className={fieldStyle} placeholder="e.g. 25" />
        </label>

        <label className={labelStyle}>
          Color
          <input value={color} onChange={e => setColor(e.target.value)} className={fieldStyle} placeholder="e.g. Golden" />
        </label>
      </div>

      <label className={labelStyle}>
        Photo URL
        <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} className={fieldStyle} placeholder="https://example.com/photo.jpg" />
      </label>

      <label className={labelStyle}>
        Notes
        <textarea value={notes} onChange={e => setNotes(e.target.value)} className="mt-1 min-h-[80px] w-full rounded-md border border-borderLight bg-white px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-textPrimary" placeholder="Optional notes..." />
      </label>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onDone} disabled={saving}>Cancel</Button>
        <Button type="submit" disabled={saving || !isFormValid}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isEdit ? "Update pet" : "Add pet"}
        </Button>
      </div>
    </form>
  );
}

function DeleteConfirm({ pet, onDone }: { pet: BackendPet; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const del = async () => {
    setDeleting(true); setError("");
    try {
      await api.delete(`/pets/${pet.id}`);
      queryClient.invalidateQueries({ queryKey: ["pets"] });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setDeleting(false);
    }
  };
  return (
    <div className="space-y-4">
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <p className="text-sm text-textSecondary">Are you sure you want to remove <strong>{pet.name}</strong>? This action cannot be undone.</p>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onDone} disabled={deleting}>Cancel</Button>
        <Button onClick={del} disabled={deleting} className="bg-red-700 hover">
          {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Delete
        </Button>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="overflow-hidden rounded-2xl border border-borderLight">
          <div className="aspect-[5/3] animate-pulse bg-gray-100" />
          <div className="space-y-3 p-5">
            <div className="h-6 w-24 animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PetRecords() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editPet, setEditPet] = useState<BackendPet | null>(null);
  const [deletePet, setDeletePet] = useState<BackendPet | null>(null);
  const queryClient = useQueryClient();

  const { data: pets, isLoading, error } = useQuery<BackendPet[]>({
    queryKey: ["pets"],
    queryFn: () => api.get("/pets"),
  });

  const filtered = useMemo(() => {
    if (!pets) return [];
    return pets.filter(p => {
      const searchStr = `${p.name} ${p.species ?? ""} ${p.breed ?? ""}`.toLowerCase();
      const matchSearch = searchStr.includes(query.toLowerCase());
      const matchFilter = filter === "All" || p.species === filter;
      return matchSearch && matchFilter;
    });
  }, [pets, query, filter]);

  const openAdd = () => { setEditPet(null); setShowModal(true); };
  const openEdit = (pet: BackendPet) => { setEditPet(pet); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditPet(null); };

  return (
    <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-12 xl:px-24 py-10 md:py-16 animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-textSecondary">Personal health record</p>
          <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl">My Pets</h1>
          <p className="mt-4 text-base md:text-lg text-textSecondary">Manage all your pets in one place.</p>
        </div>
        <Button className="rounded-full w-full sm:w-auto" onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />Add pet
        </Button>
      </header>

      <div className="mt-8 flex flex-col gap-3 md:flex-row">
        <label className="flex flex-1 items-center gap-3 rounded-md border border-borderLight px-4">
          <Search className="h-4 w-4 text-textSecondary" />
          <input value={query} onChange={e => setQuery(e.target.value)} className="h-11 w-full outline-none" placeholder="Search pets by name, species, or breed" />
        </label>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="h-11 w-full md:w-auto rounded-md border border-borderLight bg-white px-3 text-sm text-textSecondary">
          {["All", ...PET_SPECIES].map(f => <option key={f}>{f}</option>)}
        </select>
      </div>

      {isLoading && <Skeleton />}

      {error && !isLoading && (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-sm text-red-700">Failed to load pets. Please try again.</p>
          <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: ["pets"] })}>Retry</Button>
        </div>
      )}

      {!isLoading && !error && filtered.length === 0 && (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-borderLight py-16 text-center">
          <p className="text-4xl">🐾</p>
          <p className="mt-4 text-xl font-medium">{query || filter !== "All" ? "No pets match your search" : "No pets yet"}</p>
          <p className="mt-2 text-sm text-textSecondary">{query || filter !== "All" ? "Try a different search or filter." : "Add your first pet to get started."}</p>
          {!query && filter === "All" && (
            <Button className="mt-6 rounded-full" onClick={openAdd}>
              <Plus className="mr-2 h-4 w-4" />Add your first pet
            </Button>
          )}
        </div>
      )}

      {!isLoading && !error && filtered.length > 0 && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(pet => (
            <article key={pet.id} className="group overflow-hidden rounded-2xl border border-borderLight bg-white transition hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5">
              <Link to={`/pets/${pet.id}`} className="block">
                <div className="aspect-[5/3] overflow-hidden bg-gray-50">
                  {pet.image_url
                    ? <img src={pet.image_url} alt={pet.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    : <div className="flex h-full items-center justify-center text-5xl text-gray-300">🐾</div>}
                </div>
              </Link>
              <div className="p-5 md:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <Link to={`/pets/${pet.id}`}><h2 className="text-2xl md:text-3xl hover:underline">{pet.name}</h2></Link>
                    <p className="mt-1 text-sm text-textSecondary">{pet.breed ?? pet.species ?? "Pet"}{pet.gender ? ` · ${pet.gender}` : ""}</p>
                  </div>
                  {pet.species && <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">{pet.species}</span>}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button onClick={() => openEdit(pet)} className="inline-flex items-center gap-1 rounded-md border border-borderLight px-3 py-1.5 text-xs transition hover:bg-gray-50"><Edit3 className="h-3 w-3" /> Edit</button>
                  <button onClick={() => setDeletePet(pet)} className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600 transition hover:bg-red-50"><Trash2 className="h-3 w-3" /> Delete</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => { if (!editPet) closeModal(); }}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl">{editPet ? "Edit pet" : "Add a pet"}</h2>
              <button onClick={closeModal} disabled={false}><X className="h-5 w-5" /></button>
            </div>
            <PetForm initial={editPet ?? undefined} onDone={closeModal} />
          </div>
        </div>
      )}

      {deletePet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-2xl">Delete pet</h2>
            <DeleteConfirm pet={deletePet} onDone={() => setDeletePet(null)} />
          </div>
        </div>
      )}
    </div>
  );
}
