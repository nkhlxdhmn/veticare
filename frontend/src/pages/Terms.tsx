import { FileText, AlertTriangle, Scale, ShieldBan, UserCheck, Brain, Terminal, RefreshCw } from "lucide-react";

const sections = [
  {
    id: "acceptance-of-terms",
    icon: FileText,
    title: "Acceptance of Terms",
    content: (
      <div className="space-y-4 text-textSecondary leading-7">
        <p>By accessing or using VetiCare ("the Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, you must not use the Platform.</p>
        <p>These Terms apply to all visitors, users, and others who access or use the Platform. We reserve the right to update these Terms at any time. Continued use after changes constitutes acceptance.</p>
        <p>You must be at least 13 years of age to use the Platform. If you are under 18, you must have parental or guardian consent.</p>
      </div>
    ),
  },
  {
    id: "user-responsibilities",
    icon: UserCheck,
    title: "User Responsibilities",
    content: (
      <div className="space-y-4 text-textSecondary leading-7">
        <p>As a user of VetiCare, you agree to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide accurate, current, and complete information during registration.</li>
          <li>Maintain the confidentiality of your account credentials.</li>
          <li>Notify us immediately of any unauthorized use of your account.</li>
          <li>Use the Platform in compliance with all applicable laws and regulations.</li>
          <li>Not misuse the prediction system by submitting false or malicious data.</li>
          <li>Not attempt to reverse-engineer, scrape, or disrupt the Platform's services.</li>
        </ul>
        <p>You are responsible for all activity under your account. VetiCare is not liable for any loss or damage arising from your failure to meet these responsibilities.</p>
      </div>
    ),
  },
  {
    id: "medical-disclaimer",
    icon: AlertTriangle,
    title: "Medical Disclaimer",
    content: (
      <div className="space-y-4 leading-7">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-amber-900 font-medium">Important Medical Notice</p>
          <p className="mt-2 text-amber-800 text-sm">
            VetiCare is NOT a substitute for professional veterinary medical advice, diagnosis, or treatment.
          </p>
        </div>
        <p className="text-textSecondary">
          The information provided through the Platform is for informational and educational purposes only. It does not constitute veterinary advice or establish a veterinarian-client-patient relationship.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-textSecondary">
          <li>Always seek the advice of a qualified veterinarian with any questions regarding your pet's health.</li>
          <li>Never disregard professional veterinary advice or delay seeking it based on information from this Platform.</li>
          <li>If you suspect a medical emergency, contact your veterinarian or emergency animal hospital immediately.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "disease-prediction-disclaimer",
    icon: Brain,
    title: "Disease Prediction Disclaimer",
    content: (
      <div className="space-y-4 text-textSecondary leading-7">
        <p>VetiCare's disease prediction feature uses machine learning models to provide preliminary assessments based on reported symptoms. Key limitations include:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Predictions are probabilistic estimates, not diagnoses.</li>
          <li>Model accuracy depends on the quality and completeness of symptom data provided.</li>
          <li>The system may not account for rare conditions, breed-specific factors, or environmental variables.</li>
          <li>Results should be used as a reference for discussion with a licensed veterinarian, not as a definitive diagnosis.</li>
        </ul>
        <div className="rounded-xl border border-borderLight bg-gray-50/50 p-5">
          <p className="text-sm">By using the prediction feature, you acknowledge that VetiCare is not liable for decisions made based on prediction results. Always consult a veterinarian for medical decisions.</p>
        </div>
      </div>
    ),
  },
  {
    id: "limitation-of-liability",
    icon: ShieldBan,
    title: "Limitation of Liability",
    content: (
      <div className="space-y-4 text-textSecondary leading-7">
        <p>To the fullest extent permitted by applicable law:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>VetiCare shall not be liable for any indirect, incidental, special, consequential, or punitive damages.</li>
          <li>Our total liability for any claim arising from the use of the Platform shall not exceed the amount paid by you in the past 12 months (if any).</li>
          <li>We are not responsible for outcomes resulting from reliance on prediction results or other Platform features.</li>
          <li>We do not guarantee uninterrupted or error-free operation of the Platform.</li>
        </ul>
        <p>Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability. In such cases, our liability will be limited to the maximum extent permitted by law.</p>
      </div>
    ),
  },
  {
    id: "intellectual-property",
    icon: Scale,
    title: "Intellectual Property",
    content: (
      <div className="space-y-4 text-textSecondary leading-7">
        <p>The Platform and its original content, features, and functionality are owned by VetiCare and are protected by applicable intellectual property laws.</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>The VetiCare name, logo, and brand assets may not be used without prior written permission.</li>
          <li>You retain ownership of any data and content you submit to the Platform.</li>
          <li>By submitting data, you grant VetiCare a license to use it solely for providing and improving the service.</li>
          <li>Our machine learning models and prediction algorithms are proprietary and confidential.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "termination",
    icon: Terminal,
    title: "Termination",
    content: (
      <div className="space-y-4 text-textSecondary leading-7">
        <p>We reserve the right to terminate or suspend your account at any time, without prior notice, for conduct that we believe violates these Terms or is harmful to the Platform or other users.</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>You may terminate your account at any time by contacting support or through account settings.</li>
          <li>Upon termination, your right to use the Platform ceases immediately.</li>
          <li>Sections regarding liability, intellectual property, and disclaimers survive termination.</li>
          <li>We will delete your data upon account closure, subject to legal retention requirements.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "changes-to-terms",
    icon: RefreshCw,
    title: "Changes to Terms",
    content: (
      <div className="space-y-4 text-textSecondary leading-7">
        <p>We may modify these Terms at any time. When we make material changes, we will notify you via email or through the Platform.</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Changes become effective immediately upon posting, unless otherwise stated.</li>
          <li>Continued use of the Platform after changes constitutes acceptance of the new Terms.</li>
          <li>We encourage you to review these Terms periodically for updates.</li>
        </ul>
        <p className="text-sm text-textSecondary">Last updated: July 2025</p>
      </div>
    ),
  },
];

export default function Terms() {
  return (
    <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-12 xl:px-24 py-10 md:py-16 animate-fade-in">
      <header className="text-center max-w-2xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-textSecondary">Legal</p>
        <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl">Terms of Service</h1>
        <p className="mt-4 text-base md:text-lg text-textSecondary leading-relaxed">
          Please read these terms carefully before using the VetiCare platform.
        </p>
      </header>

      <nav className="mt-12 flex flex-wrap gap-2 justify-center" aria-label="Terms sections">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-full border border-borderLight px-4 py-1.5 text-xs text-textSecondary transition-all duration-200 hover:bg-gray-50 hover:text-textPrimary"
          >
            {s.title}
          </a>
        ))}
      </nav>

      <div className="mt-12 space-y-16">
        {sections.map(({ id, icon: Icon, title, content }) => (
          <section key={id} id={id} className="scroll-mt-28">
            <div className="flex items-center gap-3 mb-6">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-gray-100">
                <Icon className="h-5 w-5 text-textPrimary" />
              </div>
              <h2 className="text-2xl md:text-3xl">{title}</h2>
            </div>
            {content}
          </section>
        ))}
      </div>
    </div>
  );
}
