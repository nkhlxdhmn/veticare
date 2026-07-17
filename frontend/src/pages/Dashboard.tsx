import { Link } from "react-router-dom";
import { Activity, BookOpen, Plus, Syringe, ChevronRight, PawPrint } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { SkeletonDashboardCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";

type BackendPet = { id: string; name: string; breed: string | null; image_url: string | null; species: string | null; created_at: string };
type BackendVax = { id: string; pet_id: string; vaccine_name: string; vaccination_date: string; next_due_date: string | null; reminder_enabled: boolean };
type BackendPred = { id: string; pet_id: string; predicted_disease: string; confidence: number; created_at: string };

export default function Dashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: pets, isLoading: petsLoading, error: petsError } = useQuery<BackendPet[]>({ queryKey: ["pets"], queryFn: () => api.get("/pets") });
  const { data: vaxAll, isLoading: vaxLoading, error: vaxError } = useQuery<BackendVax[]>({ queryKey: ["vaccinations", "all"], queryFn: () => api.get("/vaccinations/user/all") });
  const { data: preds, isLoading: predLoading, error: predError } = useQuery<BackendPred[]>({ queryKey: ["predictions", "all"], queryFn: () => api.get("/predictions/user/all?limit=5") });

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
  const hasError = petsError || vaxError || predError;

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
          {[1, 2, 3, 4].map(i => <SkeletonDashboardCard key={i} />)}
        </section>
      )}

      {hasError && !isLoading && (
        <section className="mt-8">
          <ErrorState
            message="Failed to load dashboard data."
            onRetry={() => queryClient.invalidateQueries()}
          />
        </section>
      )}

      {!isLoading && !hasError && (
        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map(({ title, value, detail, route, Icon }, i) => (
            <Link
              className="rounded-xl border border-borderLight p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5"
              to={`/${route}`}
              key={title}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <Icon className="h-5 w-5 text-textSecondary" />
              <p className="mt-6 text-2xl md:text-3xl">{value}</p>
              <p className="mt-1 font-medium">{title}</p>
              <p className="mt-1 text-sm text-textSecondary">{detail}</p>
            </Link>
          ))}
        </section>
      )}

      {!isLoading && !hasError && pets && pets.length > 0 && (
        <section className="mt-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div><h2 className="text-2xl md:text-3xl">My pets</h2><p className="mt-2 text-textSecondary">{pets.length} companion{pets.length !== 1 ? "s" : ""}</p></div>
            <Link className="text-sm font-semibold underline" to="/pets">View all</Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {recentPets.map((pet, i) => (
              <article
                className="overflow-hidden rounded-xl border border-borderLight transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5"
                key={pet.id}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="aspect-[16/9] w-full bg-gray-50 flex items-center justify-center text-5xl text-gray-300">
                  {pet.image_url ? <img className="h-full w-full object-cover" src={pet.image_url} alt={pet.name} loading="lazy" /> : <PawPrint className="h-10 w-10 text-gray-300" />}
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

      {!isLoading && !hasError && (!pets || pets.length === 0) && (
        <section className="mt-12">
          <EmptyState
            icon={PawPrint}
            title="No pets yet"
            description="Add your first pet to get started with tracking their health and vaccinations."
            action={{ label: "Add your first pet", onClick: () => window.location.href = "/pets" }}
          />
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
              {sortedUpcoming.slice(0, 5).map((v, i) => (
                <div key={v.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border border-borderLight p-4 transition-all duration-200 hover:bg-gray-50/50" style={{ animationDelay: `${i * 50}ms` }}>
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
              {recentPredictions.map((p, i) => (
                <div key={p.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border border-borderLight p-4 transition-all duration-200 hover:bg-gray-50/50" style={{ animationDelay: `${i * 50}ms` }}>
                  <div><p className="font-medium">{p.predicted_disease}</p><p className="text-sm text-textSecondary">{petMap.get(p.pet_id) ?? "Unknown pet"}</p></div>
                  <div className="mt-3 sm:mt-0 text-right"><p className="text-sm font-medium">{Math.round(p.confidence * 100)}%</p><p className="text-xs text-textSecondary">{new Date(p.created_at).toLocaleDateString()}</p></div>
                </div>
              ))}
            </div>
          </section>
        )}

        {!isLoading && !hasError && sortedUpcoming.length === 0 && recentPredictions.length === 0 && pets && pets.length > 0 && (
          <section className="lg:col-span-2">
            <EmptyState
              icon={Activity}
              title="No recent activity"
              description="Your dashboard will populate with upcoming vaccinations and prediction results."
            />
          </section>
        )}
      </div>

      <section className="mt-12">
        <h2 className="text-2xl md:text-3xl">Quick actions</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { to: "/pets", title: "Manage pets", desc: "Add, edit, or remove pets" },
            { to: "/vaccinations", title: "Vaccinations", desc: "Track vaccination records" },
            { to: "/predictions", title: "Disease prediction", desc: "AI health assessment" },
            { to: "/animals", title: "Animal encyclopedia", desc: "Browse pet care guides" },
          ].map(({ to, title, desc }, i) => (
            <Link
              key={to}
              to={to}
              className="flex items-center justify-between rounded-xl border border-borderLight p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div><p className="font-medium">{title}</p><p className="mt-1 text-sm text-textSecondary">{desc}</p></div>
              <ChevronRight className="h-5 w-5 text-textSecondary" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
