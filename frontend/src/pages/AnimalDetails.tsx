import { Link, useParams } from "react-router-dom";
import { ArrowLeft, HeartPulse, Scissors, CheckCircle, XCircle } from "lucide-react";
import { animals } from "@/data/animals";
import { BreedCard, DiseaseCard, EmergencyCard, FAQAccordion, FactCard, FunFactCard, ImageWithFallback, InfoList, NutritionCard, SectionTitle, SymptomsCard, VaccineTimeline } from "@/components/animal/AnimalComponents";

export default function AnimalDetails() {
  const { id } = useParams();
  const animal = animals.find((item) => item.id === id);
  if (!animal) return <div className="py-24 text-center"><h1 className="text-3xl">Animal not found</h1><Link className="mt-4 inline-block underline" to="/animals">Return to encyclopedia</Link></div>;
  
  const nav = [
    ["overview", "Overview"], ["symptoms", "Symptoms"], ["diseases", "Diseases"], ["vaccinations", "Vaccinations"],
    ["nutrition", "Nutrition"], ["preventive", "Preventive"], ["grooming", "Grooming"], ["exercise", "Exercise"],
    ["housing", "Housing"], ["breeding", "Breeding"], ["first-aid", "First Aid"], ["dos-donts", "Do's & Don'ts"],
    ["fun-facts", "Fun Facts"], ["breeds", "Breeds"], ["faq", "FAQ"]
  ];

  return (
    <div className="animate-fade-in">
      <section className="relative isolate h-[380px] md:h-[480px] lg:h-[520px] overflow-hidden bg-black">
        <ImageWithFallback src={animal.image} alt={animal.name} className="absolute inset-0 -z-10 h-full w-full object-cover opacity-65" />
        <div className="mx-auto flex h-full max-w-[1280px] flex-col justify-end px-4 md:px-6 lg:px-12 xl:px-24 pb-10 md:pb-14 text-white">
          <Link to="/animals" className="mb-auto mt-6 flex w-fit items-center gap-2 text-sm hover:underline"><ArrowLeft className="h-4 w-4" /> Encyclopedia</Link>
          <p className="text-xs uppercase tracking-[0.2em] text-white/75">{animal.category}</p>
          <h1 className="mt-3 text-4xl md:text-5xl lg:text-6xl leading-none">{animal.name}</h1>
          <p className="mt-2 text-base md:text-lg italic text-white/85">{animal.scientificName}</p>
          <p className="mt-4 max-w-2xl text-base md:text-lg leading-8 text-white/90">{animal.description}</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-8 md:gap-12 px-4 md:px-6 lg:px-12 xl:px-24 py-10 md:py-16 lg:grid-cols-[200px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 md:top-28 space-y-3 border-l border-borderLight pl-4">
            {nav.map(([href, label]) => (
              <a key={href} href={`#${href}`} className="block text-sm text-textSecondary hover:text-textPrimary">{label}</a>
            ))}
          </nav>
        </aside>
        
        <main className="space-y-16 md:space-y-20">
          <section id="overview">
            <SectionTitle eyebrow="The overview" title="A companion shaped by care" />
            <p className="mt-6 max-w-3xl text-base md:text-lg leading-8 text-textSecondary">{animal.overview}</p>
            <div className="mt-10 grid grid-cols-2 gap-x-6 md:grid-cols-4">
              <FactCard label="Life span" value={animal.lifeSpan} />
              <FactCard label="Weight" value={animal.weight} />
              <FactCard label="Height" value={animal.height} />
              <FactCard label="Temperament" value={animal.temperament} />
              <FactCard label="Diet" value={animal.diet} />
              <FactCard label="Activity" value={animal.activityLevel} />
              <FactCard label="Scientific Name" value={animal.scientificName} />
              <FactCard label="Category" value={animal.category} />
            </div>
          </section>

          <section id="symptoms">
            <SectionTitle eyebrow="Stay alert" title="Symptoms to watch" intro="Early recognition of health issues leads to better outcomes. Contact your veterinarian if you observe any of these signs." />
            <div className="mt-6 grid gap-4 md:grid-cols-2">{animal.symptomsToWatch.map((s) => <SymptomsCard symptom={s} key={s.symptom} />)}</div>
          </section>

          <section id="diseases">
            <SectionTitle eyebrow="Health awareness" title="Common conditions" intro="A guide to useful observations, never a replacement for veterinary care." />
            <div className="mt-6 grid gap-5 md:grid-cols-2">{animal.commonDiseases.map((disease) => <DiseaseCard disease={disease} key={disease.name} />)}</div>
          </section>

          <section id="vaccinations">
            <SectionTitle eyebrow="Prevention" title="Vaccination schedule" />
            <div className="mt-6"><VaccineTimeline items={animal.vaccination} /></div>
          </section>

          <section id="nutrition">
            <SectionTitle eyebrow="Everyday nourishment" title="Nutrition guide" />
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <NutritionCard title="Foods to feed" items={animal.nutrition.feed} />
              <NutritionCard title="Foods to avoid" items={animal.nutrition.avoid} />
              <NutritionCard title="Water" text={animal.nutrition.water} />
            </div>
          </section>

          <section id="preventive">
            <SectionTitle eyebrow="Wellness plan" title="Preventive care" intro="A proactive approach to health that extends lifespan and improves quality of life." />
            <ul className="mt-6 space-y-3">
              {animal.preventiveCare.map((item) => (
                <li key={item} className="flex gap-3 border-b border-borderLight/50 pb-3 last:border-0">
                  <HeartPulse className="mt-0.5 h-5 w-5 shrink-0 text-textSecondary" />
                  <span className="text-base leading-6 text-textSecondary">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="grooming">
            <SectionTitle eyebrow="Looking good" title="Grooming tips" />
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">{animal.groomingTips.map((tip) => <li key={tip} className="flex gap-3 rounded-xl border border-borderLight p-4"><Scissors className="mt-0.5 h-4 w-4 shrink-0 text-textSecondary" /><span className="text-sm leading-6 text-textSecondary">{tip}</span></li>)}</ul>
          </section>

          <section id="exercise">
            <SectionTitle eyebrow="Stay active" title="Exercise requirements" />
            <p className="mt-6 max-w-3xl text-base md:text-lg leading-8 text-textSecondary">{animal.exerciseRequirements}</p>
          </section>

          <section id="housing">
            <SectionTitle eyebrow="Home base" title="Housing requirements" />
            <p className="mt-6 max-w-3xl text-base md:text-lg leading-8 text-textSecondary">{animal.housingRequirements}</p>
          </section>

          <section id="breeding">
            <SectionTitle eyebrow="Reproduction" title="Breeding information" />
            <p className="mt-6 max-w-3xl text-base md:text-lg leading-8 text-textSecondary">{animal.breedingInfo}</p>
          </section>

          <section id="first-aid">
            <SectionTitle eyebrow="Be prepared" title="Emergency first aid" intro="These guidelines are not a substitute for professional veterinary care. In an emergency, contact your veterinarian or emergency clinic immediately." />
            <div className="mt-6 grid gap-4 md:grid-cols-2">{animal.emergencyFirstAid.map((item) => <EmergencyCard item={item} key={item.situation} />)}</div>
          </section>

          <section id="dos-donts">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <SectionTitle eyebrow="Best practices" title="Do's" />
                <div className="mt-6"><InfoList title="" items={animal.dos} icon={<CheckCircle className="h-5 w-5 text-green-600" />} /></div>
              </div>
              <div>
                <SectionTitle eyebrow="Common mistakes" title="Don'ts" />
                <div className="mt-6"><InfoList title="" items={animal.donts} icon={<XCircle className="h-5 w-5 text-red-500" />} /></div>
              </div>
            </div>
          </section>

          <section id="fun-facts">
            <SectionTitle eyebrow="Did you know?" title="Fun facts" />
            <div className="mt-6 grid gap-4 md:grid-cols-2">{animal.funFacts.map((fact) => <FunFactCard fact={fact} key={fact} />)}</div>
          </section>

          <section id="breeds">
            <SectionTitle eyebrow="Explore further" title="Popular breeds" />
            <div className="mt-6 flex gap-5 overflow-x-auto pb-3">{animal.breeds.map((breed) => <BreedCard breed={breed} key={breed.name} />)}</div>
          </section>

          <section id="faq">
            <SectionTitle eyebrow="Questions, answered" title="Frequently asked questions" />
            <div className="mt-6"><FAQAccordion items={animal.faq} /></div>
          </section>
        </main>
      </div>
    </div>
  );
}