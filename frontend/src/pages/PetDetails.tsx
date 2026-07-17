import { Link, useParams } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

type BackendPet = {
  id: string; name: string; species: string | null; breed: string | null;
  dob: string | null; gender: string | null; weight: number | null;
  color: string | null; image_url: string | null; notes: string | null;
  created_at: string;
};

export default function PetDetails() {
  const { id } = useParams();
  const { data: pet, isLoading, error } = useQuery<BackendPet>({
    queryKey: ["pet", id],
    queryFn: () => api.get(`/pets/${id}`),
    enabled: !!id,
  });

  if (isLoading) return <div className="mx-auto max-w-[1120px] px-4 md:px-6 lg:px-12 xl:px-24 py-10 md:py-24 animate-fade-in"><div className="h-8 w-32 animate-pulse rounded bg-gray-100" /><div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]"><div className="aspect-square animate-pulse rounded-2xl bg-gray-100" /><div className="space-y-4 self-end"><div className="h-6 w-20 animate-pulse rounded bg-gray-100" /><div className="h-10 w-40 animate-pulse rounded bg-gray-100" /><div className="h-5 w-60 animate-pulse rounded bg-gray-100" /></div></div></div>;
  if (error || !pet) return <div className="mx-auto max-w-[1120px] px-4 md:px-6 lg:px-12 xl:px-24 py-10 md:py-24 text-center"><AlertCircle className="mx-auto h-8 w-8 text-red-500" /><p className="mt-4 text-lg">Pet not found</p><Link className="mt-4 inline-block underline text-sm" to="/pets">Back to my pets</Link></div>;

  const facts = [
    ["Gender", pet.gender ?? "—"],
    ["Weight", pet.weight ? `${pet.weight} kg` : "—"],
    ["Color", pet.color ?? "—"],
    ["Birthday", pet.dob ?? "—"],
    ["Species", pet.species ?? "—"],
  ];

  return (
    <div className="mx-auto max-w-[1120px] px-4 md:px-6 lg:px-12 xl:px-24 py-10 md:py-12 animate-fade-in">
      <Link to="/pets" className="flex w-fit items-center gap-2 text-sm text-textSecondary hover:text-textPrimary"><ArrowLeft className="h-4 w-4" />My pets</Link>

      <section className="mt-8 grid gap-8 border-b border-borderLight pb-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="aspect-square max-w-[400px] w-full overflow-hidden rounded-2xl bg-gray-50 flex items-center justify-center text-7xl text-gray-300">
          {pet.image_url ? <img className="h-full w-full object-cover" src={pet.image_url} alt={pet.name} /> : "🐾"}
        </div>
        <div className="self-end">
          <h1 className="text-4xl md:text-5xl lg:text-6xl">{pet.name}</h1>
          <p className="mt-3 text-lg md:text-xl text-textSecondary">{pet.breed ?? pet.species ?? "Pet"}{pet.gender ? ` · ${pet.gender}` : ""}</p>
          {pet.notes && <p className="mt-4 text-sm text-textSecondary">{pet.notes}</p>}
        </div>
      </section>

      <section className="mt-10 md:mt-12">
        <h2 className="text-2xl md:text-3xl">Quick information</h2>
        <div className="mt-6 grid grid-cols-2 gap-x-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {facts.map(([label, value], i) => (
            <div className="border-t border-borderLight py-4 animate-card-entrance" key={label} style={{ animationDelay: `${i * 50}ms` }}>
              <p className="text-xs uppercase tracking-wider text-textSecondary">{label}</p>
              <p className="mt-2">{value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
