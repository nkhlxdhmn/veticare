import { useMemo, useState } from "react";
import { animals } from "@/data/animals";
import { AnimalCard, CategoryFilter, SearchBar } from "@/components/animal/AnimalComponents";

export default function Animals() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const perPage = 4;

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return animals.filter((animal) =>
      (category === "All" || animal.category === category) &&
      !q ? true : `${animal.name} ${animal.scientificName} ${animal.category} ${animal.commonDiseases.map((d) => d.name).join(" ")}`.toLowerCase().includes(q)
    );
  }, [query, category]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="animate-fade-in">
      <section className="mx-auto max-w-4xl px-4 md:px-6 pt-12 md:pt-16 pb-12 md:pb-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-textSecondary">VetiCare field notes</p>
        <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl leading-none">Animal Encyclopedia</h1>
        <p className="mx-auto mt-5 max-w-2xl text-base md:text-lg leading-8 text-textSecondary">Learn about pet breeds, nutrition, vaccinations, common diseases, and care guides.</p>
        <div className="mx-auto mt-8 max-w-2xl"><SearchBar value={query} onChange={(value) => { setQuery(value); setPage(1); }} /></div>
        <div className="mt-5"><CategoryFilter value={category} onChange={(value) => { setCategory(value); setPage(1); }} /></div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 md:px-6 lg:px-12 xl:px-24 pb-12 md:pb-20">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <p className="text-sm text-textSecondary">{filtered.length} profiles to explore</p>
          <p className="hidden text-sm text-textSecondary sm:block">Thoughtful care starts with understanding.</p>
        </div>
        {paged.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paged.map((animal) => <AnimalCard animal={animal} key={animal.id} />)}
          </div>
        ) : (
          <div className="border-y border-borderLight py-16 text-center">
            <p className="text-xl md:text-2xl">No profiles found</p>
            <p className="mt-2 text-textSecondary">Try a different search or category.</p>
          </div>
        )}
        <div className="mt-10 flex justify-center gap-3">
          <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded-full border border-borderLight px-5 py-2 text-sm disabled:opacity-40">Previous</button>
          <button disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="rounded-full border border-borderLight px-5 py-2 text-sm disabled:opacity-40">Next</button>
        </div>
      </section>
    </div>
  );
}
