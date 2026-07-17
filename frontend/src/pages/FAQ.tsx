import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const faqItems = [
  {
    question: "What is VetiCare?",
    answer: "VetiCare is a comprehensive pet healthcare management platform that uses artificial intelligence to help pet owners monitor their pets' health. It features AI-powered disease prediction, vaccination tracking, pet records management, and a directory of nearby veterinary services.",
  },
  {
    question: "How does disease prediction work?",
    answer: "Our disease prediction system uses machine learning models trained on veterinary data. You select your pet's species and symptoms, and the AI analyzes the combination to predict potential diseases with confidence scores. The results are probabilistic estimates meant to inform discussions with your veterinarian, not to replace professional diagnosis.",
  },
  {
    question: "How accurate are ML predictions?",
    answer: "Prediction accuracy depends on the quality and completeness of symptom data provided. While our models are trained on substantial datasets, they are designed as a supportive tool, not a definitive diagnostic system. We continuously improve accuracy through ongoing training and validation, but results should always be reviewed by a licensed veterinarian.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes. We use industry-standard encryption (TLS 1.3) for all data in transit and encrypt sensitive data at rest. We follow security best practices, perform regular audits, and never sell your personal information. You retain full control over your data and can delete your account at any time.",
  },
  {
    question: "Can I manage multiple pets?",
    answer: "Absolutely. VetiCare supports managing multiple pets under a single account. You can add unlimited pets, each with their own profile, medical records, vaccination schedules, and health history. Switching between pets is seamless.",
  },
  {
    question: "How do I book appointments?",
    answer: "Appointment booking is not yet available directly through VetiCare. However, our Nearby Services feature helps you find veterinary clinics, animal hospitals, and pet services near your location, including contact details to schedule appointments directly.",
  },
  {
    question: "Can NGOs register?",
    answer: "Currently, VetiCare is designed for individual pet owners. We are exploring features for NGOs, shelters, and veterinary clinics in future updates. If you represent an organization, please contact us to discuss your requirements.",
  },
  {
    question: "Who can use this platform?",
    answer: "VetiCare is designed for pet owners, caregivers, and anyone responsible for an animal's well-being. You must be at least 13 years old to use the platform. Users under 18 require parental or guardian consent. The platform supports dogs, cats, birds, horses, rabbits, fish, cattle, and other common pets.",
  },
  {
    question: "How do I contact support?",
    answer: "You can reach us via email at support@veticare.com. We aim to respond to all inquiries within 48 hours. You can also find us on GitHub and LinkedIn for updates and community discussions.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const filtered = faqItems.filter(
    (item) =>
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-12 xl:px-24 py-10 md:py-16 animate-fade-in">
      <header className="text-center max-w-2xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-textSecondary">Support</p>
        <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl">Frequently Asked Questions</h1>
        <p className="mt-4 text-base md:text-lg text-textSecondary leading-relaxed">
          Everything you need to know about VetiCare. Can't find what you're looking for?{" "}
          <a href="/contact" className="underline transition-colors duration-200 hover:text-textPrimary">Contact us</a>.
        </p>
      </header>

      <div className="mt-10">
        <label className="relative block max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-textSecondary" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOpenIndex(null); }}
            className="h-12 w-full rounded-full border border-borderLight bg-background pl-11 pr-5 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-textPrimary/30 focus:border-textPrimary"
            placeholder="Search questions..."
          />
        </label>
      </div>

      <div className="mt-10 divide-y divide-borderLight rounded-xl border border-borderLight">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-lg font-medium">No results found</p>
            <p className="mt-2 text-sm text-textSecondary">Try a different search term.</p>
          </div>
        ) : (
          filtered.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={index}>
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 md:px-8 py-5 text-left text-base md:text-lg transition-colors duration-200 hover:bg-gray-50/50"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="font-medium">{item.question}</span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-textSecondary transition-all duration-200",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
                <div
                  id={`faq-answer-${index}`}
                  role="region"
                  className={cn(
                    "overflow-hidden transition-all duration-200",
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
                  )}
                >
                  <div className="px-5 md:px-8 pb-6 text-sm md:text-base text-textSecondary leading-7">
                    {item.answer}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
