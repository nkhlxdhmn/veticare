import { useState } from "react";
import { Mail, Github, Linkedin, Clock, MapPin, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "support@veticare.com",
    href: "mailto:support@veticare.com",
  },
  {
    icon: Github,
    label: "GitHub",
    value: "github.com/nkhlxdhmn",
    href: "https://github.com/nkhlxdhmn",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    value: "linkedin.com/in/nikhilldhimann",
    href: "https://linkedin.com/in/nikhilldhimann",
  },
  {
    icon: Clock,
    label: "Business Hours",
    value: "Monday–Friday, 9:00 AM – 6:00 PM",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "India",
  },
];

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const data = new FormData(e.currentTarget);
    if (!data.get("name") || !data.get("email") || !data.get("message")) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSent(true);
    } catch {
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1120px] px-4 md:px-6 lg:px-12 xl:px-24 py-10 md:py-16 animate-fade-in">
      <header className="text-center max-w-2xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-textSecondary">Get in touch</p>
        <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl">Contact Us</h1>
        <p className="mt-4 text-base md:text-lg text-textSecondary leading-relaxed">
          Have a question, feedback, or need help? We'd love to hear from you.
        </p>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_360px]">
        <section>
          <h2 className="text-2xl md:text-3xl mb-6">Send us a message</h2>
          <div className="rounded-xl border border-borderLight p-6 md:p-8">
            {sent ? (
              <div className="flex flex-col items-center justify-center py-10 text-center animate-card-entrance">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-green-50">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <p className="mt-4 text-xl font-medium">Message sent</p>
                <p className="mt-2 text-sm text-textSecondary">Thank you for reaching out. We'll get back to you within 48 hours.</p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => { setSent(false); setError(""); }}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-medium">
                    Name *
                    <input
                      name="name"
                      type="text"
                      required
                      className="mt-2 h-11 w-full rounded-md border border-borderLight bg-background px-3 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-textPrimary/30 focus:border-textPrimary"
                      placeholder="Your name"
                    />
                  </label>
                  <label className="block text-sm font-medium">
                    Email *
                    <input
                      name="email"
                      type="email"
                      required
                      className="mt-2 h-11 w-full rounded-md border border-borderLight bg-background px-3 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-textPrimary/30 focus:border-textPrimary"
                      placeholder="your@email.com"
                    />
                  </label>
                </div>
                <label className="block text-sm font-medium">
                  Subject
                  <input
                    name="subject"
                    type="text"
                    className="mt-2 h-11 w-full rounded-md border border-borderLight bg-background px-3 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-textPrimary/30 focus:border-textPrimary"
                    placeholder="How can we help?"
                  />
                </label>
                <label className="block text-sm font-medium">
                  Message *
                  <textarea
                    name="message"
                    required
                    rows={5}
                    className="mt-2 w-full rounded-md border border-borderLight bg-background px-3 py-2.5 text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-textPrimary/30 focus:border-textPrimary"
                    placeholder="Tell us more about your inquiry..."
                  />
                </label>
                {error && (
                  <p className="text-sm text-red-700 flex items-center gap-2 animate-card-entrance">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </p>
                )}
                <Button type="submit" loading={loading} className="rounded-full">
                  <Send className="mr-2 h-4 w-4" />
                  Send message
                </Button>
              </form>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          {contactInfo.map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="rounded-xl border border-borderLight p-5 transition-all duration-200 hover:shadow-sm">
              <div className="flex items-start gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gray-100">
                  <Icon className="h-5 w-5 text-textPrimary" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-textSecondary">{label}</p>
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-sm text-textPrimary transition-colors duration-200 hover:text-textSecondary"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm text-textPrimary">{value}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
