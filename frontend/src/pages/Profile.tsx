import { Link } from "react-router-dom";
import { Edit3, Mail, Phone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

export default function Profile() {
  const { user } = useAuth();
  const { data: pets } = useQuery({ queryKey: ["pets"], queryFn: () => api.get<{ id: string; name: string }[]>("/pets") });
  const { data: vax } = useQuery({ queryKey: ["vaccinations", "all"], queryFn: () => api.get<unknown[]>("/vaccinations/user/all") });

  const details = [["Full name", user?.name ?? "—"], ["Email", user?.email ?? "—"], ["Phone", user?.phone ?? "—"], ["Member since", user?.memberSince ?? "—"]];

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-6 py-10 md:py-16 animate-fade-in">
      <section className="border border-borderLight p-5 sm:p-8 md:p-10">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-5">
            <div className="grid h-16 w-16 md:h-20 md:w-20 place-items-center rounded-full bg-gray-100 text-2xl md:text-3xl font-serif">{user?.name?.slice(0, 1) ?? "U"}</div>
            <div>
              <h1 className="text-3xl md:text-4xl">{user?.name ?? "User"}</h1>
              <p className="mt-2 flex items-center gap-2 text-sm md:text-base text-textSecondary"><Mail className="h-4 w-4" />{user?.email ?? "—"}</p>
              <p className="mt-1 flex items-center gap-2 text-sm text-textSecondary"><Phone className="h-4 w-4" />{user?.phone ?? "—"}</p>
            </div>
          </div>
          <Link className="inline-flex items-center gap-2 border border-borderLight px-4 py-2 text-sm w-full sm:w-auto justify-center sm:justify-start" to="/settings"><Edit3 className="h-4 w-4" />Edit profile</Link>
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
          {[["Pets registered", pets?.length ?? 0], ["Vaccinations", vax?.length ?? 0]].map(([label, value]) => (
            <div className="border border-borderLight p-5" key={label}>
              <p className="text-2xl md:text-3xl">{value}</p>
              <p className="mt-1 text-sm text-textSecondary">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
