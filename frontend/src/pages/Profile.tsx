import { Link } from "react-router-dom";
import { Edit3, Mail, Phone, PawPrint, Syringe } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

function StatSkeleton() {
  return (
    <div className="border border-borderLight p-5 space-y-3">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-4 w-28" />
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const { data: pets, isLoading: petsLoading } = useQuery({ queryKey: ["pets"], queryFn: () => api.get<{ id: string; name: string }[]>("/pets") });
  const { data: vax, isLoading: vaxLoading } = useQuery({ queryKey: ["vaccinations", "all"], queryFn: () => api.get<unknown[]>("/vaccinations/user/all") });

  const details = [["Full name", user?.name ?? "—"], ["Email", user?.email ?? "—"], ["Phone", user?.phone ?? "—"], ["Member since", user?.memberSince ?? "—"]];

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-6 py-10 md:py-16 animate-fade-in">
      <section className="rounded-xl border border-borderLight p-5 sm:p-8 md:p-10 transition-all duration-200 hover:shadow-sm">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-5">
            <div className="grid h-16 w-16 md:h-20 md:w-20 place-items-center rounded-full bg-gray-100 text-2xl md:text-3xl font-serif">{user?.name?.slice(0, 1) ?? "U"}</div>
            <div>
              <h1 className="text-3xl md:text-4xl">{user?.name ?? "User"}</h1>
              <p className="mt-2 flex items-center gap-2 text-sm md:text-base text-textSecondary"><Mail className="h-4 w-4" />{user?.email ?? "—"}</p>
              <p className="mt-1 flex items-center gap-2 text-sm text-textSecondary"><Phone className="h-4 w-4" />{user?.phone ?? "—"}</p>
            </div>
          </div>
          <Link className="inline-flex items-center gap-2 rounded-md border border-borderLight px-4 py-2 text-sm transition-all duration-200 hover:bg-gray-50 hover:scale-[1.02] w-full sm:w-auto justify-center sm:justify-start" to="/settings"><Edit3 className="h-4 w-4" />Edit profile</Link>
        </div>
      </section>

      <section className="mt-10 md:mt-12">
        <h2 className="text-2xl md:text-3xl">Personal information</h2>
        <div className="mt-6 grid gap-x-8 md:grid-cols-2">
          {details.map(([label, value]) => (
            <div className="border-t border-borderLight py-4" key={label}>
              <p className="text-xs uppercase tracking-wider text-textSecondary">{label}</p>
              <p className="mt-2">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 md:mt-12">
        <h2 className="text-2xl md:text-3xl">My pet statistics</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {petsLoading || vaxLoading ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            <>
              <div className="rounded-xl border border-borderLight p-5 transition-all duration-200 hover:shadow-sm">
                <div className="flex items-center gap-3">
                  <PawPrint className="h-5 w-5 text-textSecondary" />
                  <div>
                    <p className="text-2xl md:text-3xl">{pets?.length ?? 0}</p>
                    <p className="mt-1 text-sm text-textSecondary">Pets registered</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-borderLight p-5 transition-all duration-200 hover:shadow-sm">
                <div className="flex items-center gap-3">
                  <Syringe className="h-5 w-5 text-textSecondary" />
                  <div>
                    <p className="text-2xl md:text-3xl">{vax?.length ?? 0}</p>
                    <p className="mt-1 text-sm text-textSecondary">Vaccinations</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
