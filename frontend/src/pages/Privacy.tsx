import { Shield, Lock, Cookie, Share2, Eye, Mail } from "lucide-react";

const sections = [
  {
    id: "information-we-collect",
    icon: Eye,
    title: "Information We Collect",
    content: (
      <div className="space-y-4 text-textSecondary leading-7">
        <p>We collect information necessary to provide and improve our services. This includes:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong className="text-textPrimary">Account Information:</strong> Name, email address, phone number, and password when you register.</li>
          <li><strong className="text-textPrimary">Pet Information:</strong> Names, species, breed, age, weight, medical history, vaccination records, and images you upload.</li>
          <li><strong className="text-textPrimary">Usage Data:</strong> Pages visited, features used, prediction history, and interactions with our platform.</li>
          <li><strong className="text-textPrimary">Device Information:</strong> Browser type, operating system, and IP address for analytics and security.</li>
          <li><strong className="text-textPrimary">Location Data:</strong> Approximate location when using nearby services (with your explicit consent).</li>
        </ul>
        <p>We only collect data that is essential for delivering our services. You choose what pet information to share.</p>
      </div>
    ),
  },
  {
    id: "how-we-use-information",
    icon: Share2,
    title: "How We Use Information",
    content: (
      <div className="space-y-4 text-textSecondary leading-7">
        <p>Your information is used exclusively to deliver and improve the VetiCare experience:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide AI-powered disease predictions based on symptoms you submit.</li>
          <li>Maintain vaccination schedules and send timely reminders.</li>
          <li>Store and organize pet health records for easy access.</li>
          <li>Recommend nearby veterinary services and animal hospitals.</li>
          <li>Improve our machine learning models using anonymized, aggregated data.</li>
          <li>Communicate important service updates and account notifications.</li>
        </ul>
        <p>We do not sell your personal information to third parties. Anonymized data may be used to train our prediction models.</p>
      </div>
    ),
  },
  {
    id: "data-security",
    icon: Lock,
    title: "Data Security",
    content: (
      <div className="space-y-4 text-textSecondary leading-7">
        <p>We implement industry-standard security measures to protect your data:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Encryption in transit using TLS 1.3 for all API communications.</li>
          <li>Encrypted storage of sensitive data at rest.</li>
          <li>Secure token-based authentication with automatic session expiration.</li>
          <li>Regular security audits and dependency vulnerability scanning.</li>
          <li>Strict access controls — only authorized systems process your data.</li>
        </ul>
        <p>While we follow best practices, no online service can guarantee absolute security. We encourage strong, unique passwords.</p>
      </div>
    ),
  },
  {
    id: "cookies",
    icon: Cookie,
    title: "Cookies",
    content: (
      <div className="space-y-4 text-textSecondary leading-7">
        <p>We use minimal cookies essential for authentication and platform functionality:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong className="text-textPrimary">Authentication Cookies:</strong> Required to keep you signed in during your session.</li>
          <li><strong className="text-textPrimary">Preference Cookies:</strong> Store your theme and language preferences.</li>
          <li><strong className="text-textPrimary">Analytics Cookies:</strong> Help us understand usage patterns to improve the platform.</li>
        </ul>
        <p>We do not use tracking cookies for advertising. You can manage cookie preferences through your browser settings.</p>
      </div>
    ),
  },
  {
    id: "third-party-services",
    icon: Share2,
    title: "Third-Party Services",
    content: (
      <div className="space-y-4 text-textSecondary leading-7">
        <p>We integrate with trusted third-party services to deliver specific features:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong className="text-textPrimary">OpenStreetMap:</strong> Used to display nearby veterinary services. Location data is sent to OSM only when you search.</li>
          <li><strong className="text-textPrimary">Supabase:</strong> Our database provider. Data is stored securely in managed cloud infrastructure.</li>
          <li><strong className="text-textPrimary">Analytics:</strong> Anonymous usage data to improve platform performance and user experience.</li>
        </ul>
        <p>Each third-party provider operates under strict data processing agreements. We do not share personal data for their independent use.</p>
      </div>
    ),
  },
  {
    id: "user-rights",
    icon: Shield,
    title: "User Rights",
    content: (
      <div className="space-y-4 text-textSecondary leading-7">
        <p>You have full control over your data. Subject to applicable law, you may:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong className="text-textPrimary">Access:</strong> View all data associated with your account at any time.</li>
          <li><strong className="text-textPrimary">Correct:</strong> Update or edit your profile and pet information.</li>
          <li><strong className="text-textPrimary">Delete:</strong> Remove your account and associated data permanently.</li>
          <li><strong className="text-textPrimary">Export:</strong> Request a copy of your data in a portable format.</li>
          <li><strong className="text-textPrimary">Withdraw Consent:</strong> Revoke location permissions or opt out of non-essential data processing.</li>
        </ul>
        <p>To exercise any of these rights, contact us at <strong className="text-textPrimary">support@veticare.com</strong>. We respond to all requests within 30 days.</p>
      </div>
    ),
  },
  {
    id: "contact-information",
    icon: Mail,
    title: "Contact Information",
    content: (
      <div className="space-y-4 text-textSecondary leading-7">
        <p>If you have questions about this Privacy Policy or our data practices:</p>
        <div className="rounded-xl border border-borderLight bg-gray-50/50 p-5 space-y-2">
          <p><strong className="text-textPrimary">Email:</strong> support@veticare.com</p>
          <p><strong className="text-textPrimary">Location:</strong> India</p>
          <p className="text-sm">We aim to respond to all inquiries within 48 hours.</p>
        </div>
        <p className="text-sm text-textSecondary">Last updated: July 2025</p>
      </div>
    ),
  },
];

export default function Privacy() {
  return (
    <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-12 xl:px-24 py-10 md:py-16 animate-fade-in">
      <header className="text-center max-w-2xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-textSecondary">Legal</p>
        <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl">Privacy Policy</h1>
        <p className="mt-4 text-base md:text-lg text-textSecondary leading-relaxed">
          Your privacy matters. This policy explains how we collect, use, and protect your information.
        </p>
      </header>

      <nav className="mt-12 flex flex-wrap gap-2 justify-center" aria-label="Policy sections">
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
