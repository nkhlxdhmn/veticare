import { mockCareGuides } from "@/data/mockData";
import { Check, X } from "lucide-react";

export default function CareGuide() {
  return (
    <div className="space-y-16 animate-fade-in max-w-5xl mx-auto">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight">Care Guide</h1>
        <p className="text-lg text-textSecondary font-light">
          Essential do's and don'ts for keeping your pet healthy and happy.
        </p>
      </div>

      <div className="space-y-24">
        {mockCareGuides.map((guide, idx) => (
          <div key={idx} className="space-y-8">
            <h2 className="text-2xl font-serif text-center pb-4 border-b border-borderLight/50">
              {guide.category}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Do's */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-textPrimary tracking-wide uppercase">Do's</h3>
                <ul className="space-y-4">
                  {guide.dos.map((item, i) => (
                    <li key={i} className="flex items-start gap-4 p-4 bg-gray-50/50 rounded-lg">
                      <div className="bg-white p-1 rounded-full border border-borderLight mt-0.5">
                        <Check className="h-4 w-4 text-textPrimary" strokeWidth={2} />
                      </div>
                      <span className="text-textSecondary leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Don'ts */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-textPrimary tracking-wide uppercase">Don'ts</h3>
                <ul className="space-y-4">
                  {guide.donts.map((item, i) => (
                    <li key={i} className="flex items-start gap-4 p-4 bg-gray-50/50 rounded-lg">
                      <div className="bg-white p-1 rounded-full border border-borderLight mt-0.5">
                        <X className="h-4 w-4 text-textPrimary" strokeWidth={2} />
                      </div>
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
