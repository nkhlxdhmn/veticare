import { Check, X } from "lucide-react";

const guides = [
  {
    category: "Nutrition",
    dos: ["Feed a balanced, high-quality diet appropriate for age and breed.", "Provide fresh water daily.", "Measure food to prevent obesity."],
    donts: ["Don't feed table scraps or human food.", "Don't change diet abruptly.", "Don't overfeed treats (keep under 10% of daily calories)."],
  },
  {
    category: "Exercise",
    dos: ["Provide daily physical activity.", "Include mental stimulation (puzzles, training).", "Adjust exercise intensity based on weather."],
    donts: ["Don't exercise vigorously right after meals.", "Don't force a tired pet to keep playing.", "Don't ignore signs of heatstroke."],
  },
  {
    category: "Grooming",
    dos: ["Brush regularly to prevent matting and reduce shedding.", "Check ears weekly for debris or redness.", "Trim nails every 2–4 weeks."],
    donts: ["Don't bathe too frequently — it strips natural oils.", "Don't use human shampoo.", "Don't ignore dental hygiene."],
  },
  {
    category: "Vaccination",
    dos: ["Follow your vet's recommended vaccination schedule.", "Keep records of all vaccinations.", "Consult your vet before vaccines if your pet is unwell."],
    donts: ["Don't skip booster doses.", "Don't vaccinate pregnant animals without veterinary advice.", "Don't assume indoor pets don't need vaccines."],
  },
];

export default function CareGuide() {
  return (
    <div className="space-y-16 animate-fade-in max-w-5xl mx-auto px-4 md:px-6 lg:px-12 xl:px-24 py-10 md:py-16">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight">Care Guide</h1>
        <p className="text-lg text-textSecondary font-light">Essential do's and don'ts for keeping your pet healthy and happy.</p>
      </div>
      <div className="space-y-24">
        {guides.map((guide, idx) => (
          <div key={idx} className="space-y-8">
            <h2 className="text-2xl font-serif text-center pb-4 border-b border-borderLight/50">{guide.category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-textPrimary tracking-wide uppercase">Do's</h3>
                <ul className="space-y-4">
                  {guide.dos.map((item, i) => (
                    <li key={i} className="flex items-start gap-4 p-4 bg-gray-50/50 rounded-lg">
                      <div className="bg-white p-1 rounded-full border border-borderLight mt-0.5"><Check className="h-4 w-4 text-textPrimary" strokeWidth={2} /></div>
                      <span className="text-textSecondary leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-textPrimary tracking-wide uppercase">Don'ts</h3>
                <ul className="space-y-4">
                  {guide.donts.map((item, i) => (
                    <li key={i} className="flex items-start gap-4 p-4 bg-gray-50/50 rounded-lg">
                      <div className="bg-white p-1 rounded-full border border-borderLight mt-0.5"><X className="h-4 w-4 text-textPrimary" strokeWidth={2} /></div>
                      <span className="text-textSecondary leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
