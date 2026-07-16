import { Link } from "react-router-dom";
import { Activity, BookOpen, Plus, Syringe, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

type BackendPet = { id: string; name: string; breed: string | null; image_url: string | null; species: string | null; created_at: string };
type BackendVax = { id: string; pet_id: string; vaccine_name: string; vaccination_date: string; next_due_date: string | null; reminder_enabled: boolean };
type BackendPred = { id: string; pet_id: string; predicted_disease: string; confidence: number; created_at: string };

function SkeletonCard() { return <div className="border border-borderLight p-5"><div className="h-5 w-5 animate-pulse rounded bg-gray-100" /><div className="mt-6 h-8 w-16 animate-pulse rounded bg-gray-100" /><div className="mt-2 h-4 w-24 animate-pulse rounded bg-gray-100" /></div>; }

export default function Dashboard() {
  const { user } = useAuth();

  const { data: pets, isLoading: petsLoading } = useQuery<BackendPet[]>({ queryKey: ["pets"], queryFn: () => api.get("/pets") });
  const { data: vaxAll, isLoading: vaxLoading } = useQuery<BackendVax[]>({ queryKey: ["vaccinations", "all"], queryFn: () => api.get("/vaccinations/user/all") });
  const { data: preds, isLoading: predLoading } = useQuery<BackendPred[]>({ queryKey: ["predictions", "all"], queryFn: () => api.get("/predictions/user/all?limit=5") });

  const petMap = new Map<string, string>();
  pets?.forEach(p => petMap.set(p.id, p.name));

  const upcomingVax = vaxAll?.filter(v => v.next_due_date && new Date(v.next_due_date) >= new Date()) ?? [];
  const overdueVax = vaxAll?.filter(v => v.next_due_date && new Date(v.next_due_date) < new Date()) ?? [];
  const activeVax = (vaxAll?.length ?? 0) - (overdueVax.length);

  const recentPredictions = preds?.slice(0, 5) ?? [];

  const sortedUpcoming = [...upcomingVax].sort((a, b) => new Date(a.next_due_date!).getTime() - new Date(b.next_due_date!).getTime());
  const recentPets = pets?.slice(0, 6) ?? [];

  const overviewCards = [
    { title: "My pets", value: pets?.length ?? 0, detail: "Your companions", route: "pets", Icon: Plus },
    { title: "Active vaccinations", value: activeVax, detail: "Vaccination records", route: "vaccinations", Icon: Syringe },
    { title: "Upcoming vaccines", value: sortedUpcoming.length, detail: "Due soon", route: "vaccinations", Icon: Activity },
    { title: "Total predictions", value: (preds?.length ?? 0), detail: "AI assessments", route: "predictions", Icon: BookOpen },
  ] as const;

  const isLoading = petsLoading || vaxLoading || predLoading;

  return (
    <div className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-12 xl:px-24 py-10 md:py-16 animate-fade-in">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-textSecondary">Your health overview</p>
          <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl">Good {new Date().getHours() < 12 ? "morning" : "afternoon"}{user?.name ? `, ${user.name}` : ""}</h1>
          <p className="mt-4 text-base md:text-lg text-textSecondary">Here's an overview of your pets and their health.</p>
        </div>
        <Link to="/pets"><Button className="rounded-full w-full sm:w-auto"><Plus className="mr-2 h-4 w-4" />Add pet</Button></Link>
      </header>

      {isLoading && (
        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </section>
      )}

      {!isLoading && (
        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map(({ title, value, detail, route, Icon }) => (
            <Link className="border border-borderLight p-5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5" to={`/${route}`} key={title}>
              <Icon className="h-5 w-5 text-textSecondary" />
              <p className="mt-6 text-2xl md:text-3xl">{value}</p>
              <p className="mt-1 font-medium">{title}</p>
              <p className="mt-1 text-sm text-textSecondary">{detail}</p>
            </Link>
          ))}
        </section>
      )}

      {!isLoading && pets && pets.length > 0 && (
        <section className="mt-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div><h2 className="text-2xl md:text-3xl">My pets</h2><p className="mt-2 text-textSecondary">{pets.length} companion{pets.length !== 1 ? "s" : ""}</p></div>
            <Link className="text-sm font-semibold underline" to="/pets">View all</Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {recentPets.map(pet => (
              <article className="overflow-hidden border border-borderLight" key={pet.id}>
                <div className="aspect-[16/9] w-full bg-gray-50 flex items-center justify-center text-5xl text-gray-300">
                  {pet.image_url ? <img className="h-full w-full object-cover" src={pet.image_url} alt={pet.name} loading="lazy" /> : "🐾"}
                </div>
                <div className="p-5">
                  <div className="flex justify-between gap-3">
                    <div><h3 className="text-xl md:text-2xl">{pet.name}</h3><p className="mt-1 text-sm text-textSecondary">{pet.breed ?? pet.species ?? "Pet"}</p></div>
                  </div>
                  <Link className="mt-4 inline-block text-sm font-semibold underline" to={`/pets/${pet.id}`}>View details</Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {!isLoading && (!pets || pets.length === 0) && (
        <section className="mt-12 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-borderLight py-16 text-center">
          <p className="text-4xl">🐾</p>
          <p className="mt-4 text-xl font-medium">No pets yet</p>
          <p className="mt-2 text-sm text-textSecondary">Add your first pet to get started with tracking.</p>
          <Link to="/pets"><Button className="mt-6 rounded-full"><Plus className="mr-2 h-4 w-4" />Add your first pet</Button></Link>
        </section>
      )}

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        {sortedUpcoming.length > 0 && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div><h2 className="text-2xl md:text-3xl">Upcoming vaccinations</h2><p className="mt-2 text-sm text-textSecondary">{sortedUpcoming.length} vaccine{sortedUpcoming.length !== 1 ? "s" : ""} due</p></div>
              <Link className="text-sm font-semibold underline" to="/vaccinations">View all</Link>
            </div>
            <div className="mt-5 space-y-3">
              {sortedUpcoming.slice(0, 5).map(v => (
                <div key={v.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border border-borderLight p-4">
                  <div><p className="font-medium">{petMap.get(v.pet_id) ?? "Pet"}</p><p className="text-sm text-textSecondary">{v.vaccine_name}</p></div>
                  <div className="mt-3 sm:mt-0 text-right"><p className="text-sm font-medium">{v.next_due_date ? new Date(v.next_due_date).toLocaleDateString() : ""}</p><p className="text-xs text-textSecondary">{v.next_due_date ? Math.ceil((new Date(v.next_due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) + " days" : ""}</p></div>
                </div>
              ))}
            </div>
          </section>
        )}

        {recentPredictions.length > 0 && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div><h2 className="text-2xl md:text-3xl">Recent predictions</h2><p className="mt-2 text-sm text-textSecondary">Last {recentPredictions.length} assessment{recentPredictions.length !== 1 ? "s" : ""}</p></div>
              <Link className="text-sm font-semibold underline" to="/predictions">View all</Link>
            </div>
            <div className="mt-5 space-y-3">
              {recentPredictions.map(p => (
                <div key={p.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border border-borderLight p-4">
                  <div><p className="font-medium">{p.predicted_disease}</p><p className="text-sm text-textSecondary">{petMap.get(p.pet_id) ?? "Unknown pet"}</p></div>
                  <div className="mt-3 sm:mt-0 text-right"><p className="text-sm font-medium">{Math.round(p.confidence * 100)}%</p><p className="text-xs text-textSecondary">{new Date(p.created_at).toLocaleDateString()}</p></div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <section className="mt-12">
        <h2 className="text-2xl md:text-3xl">Quick actions</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Link to="/pets" className="flex items-center justify-between rounded-xl border border-borderLight p-5 transition hover:-translate-y-1 hover:shadow-lg"><div><p className="font-medium">Manage pets</p><p className="mt-1 text-sm text-textSecondary">Add, edit, or remove pets</p></div><ChevronRight className="h-5 w-5 text-textSecondary" /></Link>
          <Link to="/vaccinations" className="flex items-center justify-between rounded-xl border border-borderLight p-5 transition hover:-translate-y-1 hover:shadow-lg"><div><p className="font-medium">Vaccinations</p><p className="mt-1 text-sm text-textSecondary">Track vaccination records</p></div><ChevronRight className="h-5 w-5 text-textSecondary" /></Link>
          <Link to="/predictions" className="flex items-center justify-between rounded-xl border border-borderLight p-5 transition hover:-translate-y-1 hover:shadow-lg"><div><p className="font-medium">Disease prediction</p><p className="mt-1 text-sm text-textSecondary">AI health assessment</p></div><ChevronRight className="h-5 w-5 text-textSecondary" /></Link>
          <Link to="/animals" className="flex items-center justify-between rounded-xl border border-borderLight p-5 transition hover:-translate-y-1 hover:shadow-lg"><div><p className="font-medium">Animal encyclopedia</p><p className="mt-1 text-sm text-textSecondary">Browse pet care guides</p></div><ChevronRight className="h-5 w-5 text-textSecondary" /></Link>
        </div>
      </section>
    </div>
  );
}
