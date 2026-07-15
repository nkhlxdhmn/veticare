import { Link } from "react-router-dom";
import { 
  ArrowRight, Activity, FileText, Syringe, MapPin, 
  CheckCircle2, Database, Code2, Box, Map, Layout, Server
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Section } from "@/components/layout/Section";
import type { LucideIcon } from "lucide-react";

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

type FeatureCardProps = { icon: LucideIcon; title: string; description: string; link: string };
type PreviewCardProps = { title: string; placeholder: string };
const FeatureCard = ({ icon: Icon, title, description, link }: FeatureCardProps) => (
  <Link to={link} className="block group h-full">
    <Card className="h-full border border-borderLight bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-gray-300">
      <CardHeader className="space-y-4">
        <Icon className="h-6 w-6 text-textPrimary" strokeWidth={1.5} />
        <CardTitle className="text-xl font-serif">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="text-base text-textSecondary leading-relaxed">
          {description}
        </CardDescription>
        <div className="flex items-center text-sm font-medium text-textPrimary">
          Explore <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </CardContent>
    </Card>
  </Link>
);

const PreviewCard = ({ title, placeholder }: PreviewCardProps) => (
  <div className="bg-gray-50 border border-borderLight rounded-xl p-6 h-64 flex flex-col items-center justify-center text-center space-y-4 transition-transform hover:scale-[1.02] duration-200">
    <div className="w-12 h-12 bg-white rounded-full border border-borderLight flex items-center justify-center">
      <Layout className="h-5 w-5 text-textSecondary" />
    </div>
    <div>
      <h4 className="font-serif text-lg mb-1">{title}</h4>
      <p className="text-xs text-textSecondary uppercase tracking-widest">{placeholder}</p>
    </div>
  </div>
);

// ============================================================================
// SECTIONS
// ============================================================================

const HeroSection = () => (
  <Section className="pt-24 lg:pt-32 pb-16 lg:pb-24">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      <div className="space-y-8 animate-fade-slide-up">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif leading-[1.1] tracking-tight uppercase">
          Smart Pet<br />Healthcare<br />Powered by AI
        </h1>
        <p className="text-lg md:text-xl text-textSecondary font-light leading-relaxed max-w-lg">
          Helping pet owners monitor their pets' health with AI-powered disease prediction, vaccination tracking, and nearby veterinary services.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link to="/predictions">
            <Button size="lg" className="w-full sm:w-auto rounded-full px-8 h-12 text-base">
              Start Prediction
            </Button>
          </Link>
          <Link to="/about">
            <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full px-8 h-12 text-base">
              Learn More
            </Button>
          </Link>
        </div>
      </div>
      <div className="animate-fade-in relative aspect-square lg:aspect-auto lg:h-[600px] w-full bg-gray-50 rounded-2xl border border-borderLight overflow-hidden">
        {/* Placeholder image for a beautiful pet illustration */}
        <img 
          src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1200" 
          alt="Premium Pet Healthcare" 
          className="w-full h-full object-cover object-center mix-blend-multiply opacity-90"
        />
      </div>
    </div>
  </Section>
);

const TrustSection = () => (
  <Section className="py-12 border-y border-borderLight/50 bg-gray-50/30">
    <div className="space-y-8 text-center animate-fade-in">
      <p className="text-xs uppercase tracking-widest text-textSecondary font-medium">
        Trusted Technologies
      </p>
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale">
        <div className="flex items-center gap-2"><Server className="h-5 w-5" /><span className="font-medium tracking-wide">FastAPI</span></div>
        <div className="flex items-center gap-2"><Activity className="h-5 w-5" /><span className="font-medium tracking-wide">Scikit-learn</span></div>
        <div className="flex items-center gap-2"><Database className="h-5 w-5" /><span className="font-medium tracking-wide">Supabase</span></div>
        <div className="flex items-center gap-2"><Box className="h-5 w-5" /><span className="font-medium tracking-wide">Docker</span></div>
        <div className="flex items-center gap-2"><Map className="h-5 w-5" /><span className="font-medium tracking-wide">Google Maps</span></div>
        <div className="flex items-center gap-2"><Code2 className="h-5 w-5" /><span className="font-medium tracking-wide">React</span></div>
      </div>
    </div>
  </Section>
);

const FeaturesSection = () => (
  <Section>
    <div className="space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-4xl md:text-5xl font-serif tracking-tight">Everything Your Pet Needs</h2>
        <p className="text-textSecondary font-light text-lg">A comprehensive suite of tools designed with elegant simplicity.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FeatureCard 
          icon={Activity}
          title="Disease Prediction"
          description="Advanced machine learning models to analyze symptoms and provide instant health insights."
          link="/predictions"
        />
        <FeatureCard 
          icon={FileText}
          title="Pet Records"
          description="A centralized, beautifully organized repository for all your pet's vital medical history."
          link="/pets"
        />
        <FeatureCard 
          icon={Syringe}
          title="Vaccination Reminder"
          description="Never miss a shot with automated tracking and visual timelines for immunizations."
          link="/vaccinations"
        />
        <FeatureCard 
          icon={MapPin}
          title="Nearby Services"
          description="Locate trusted veterinary clinics and emergency hospitals in your immediate area."
          link="/nearby"
        />
      </div>
    </div>
  </Section>
);

const HowItWorksSection = () => (
  <Section className="bg-gray-50/50 border-y border-borderLight/50" disableContainer>
    <div className="mx-auto w-full max-w-[1280px] px-6 md:px-12 lg:px-24 py-[120px]">
      <div className="space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-serif tracking-tight">How It Works</h2>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-borderLight -translate-y-1/2" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            <div className="bg-white p-8 rounded-xl border border-borderLight text-center space-y-4 shadow-sm">
              <span className="text-xs uppercase tracking-widest text-textSecondary font-medium">01</span>
              <h3 className="text-2xl font-serif">Register</h3>
              <p className="text-textSecondary text-sm leading-relaxed">Create your account to unlock personalized pet care.</p>
            </div>
            
            {/* Mobile arrow */}
            <div className="md:hidden flex justify-center text-borderLight">↓</div>
            
            <div className="bg-white p-8 rounded-xl border border-borderLight text-center space-y-4 shadow-sm">
              <span className="text-xs uppercase tracking-widest text-textSecondary font-medium">02</span>
              <h3 className="text-2xl font-serif">Add Pet</h3>
              <p className="text-textSecondary text-sm leading-relaxed">Input your pet's basic information and medical history.</p>
            </div>
            
            {/* Mobile arrow */}
            <div className="md:hidden flex justify-center text-borderLight">↓</div>
            
            <div className="bg-white p-8 rounded-xl border border-borderLight text-center space-y-4 shadow-sm">
              <span className="text-xs uppercase tracking-widest text-textSecondary font-medium">03</span>
              <h3 className="text-2xl font-serif">Predict Disease</h3>
              <p className="text-textSecondary text-sm leading-relaxed">Describe symptoms and get instant AI-driven health insights.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Section>
);

const WhySection = () => (
  <Section>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
      <div className="space-y-6 lg:sticky lg:top-32">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-tight">
          Why<br />VetiCare
        </h2>
        <p className="text-lg text-textSecondary font-light leading-relaxed max-w-md">
          We bring the precision of modern technology to the empathy of pet ownership.
        </p>
      </div>
      <div className="space-y-12 pt-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-textPrimary" />
            <h3 className="text-2xl font-serif">AI-powered diagnosis</h3>
          </div>
          <p className="text-textSecondary font-light leading-relaxed pl-8">
            Our machine learning pipeline analyzes thousands of data points to provide accurate early-warning indicators for potential illnesses.
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-textPrimary" />
            <h3 className="text-2xl font-serif">Easy pet management</h3>
          </div>
          <p className="text-textSecondary font-light leading-relaxed pl-8">
            A beautiful, minimalist interface that makes managing multiple pets, their weights, and their histories effortless.
          </p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-textPrimary" />
            <h3 className="text-2xl font-serif">Smart vaccination reminders</h3>
          </div>
          <p className="text-textSecondary font-light leading-relaxed pl-8">
            Stay ahead of preventive care with automated timelines that alert you when it's time for the next visit.
          </p>
        </div>
      </div>
    </div>
  </Section>
);

const QuickPreviewSection = () => (
  <Section className="bg-gray-50/50 border-y border-borderLight/50">
    <div className="space-y-16">
      <div className="text-center">
        <h2 className="text-4xl md:text-5xl font-serif tracking-tight">Quick Preview</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <PreviewCard title="Disease Prediction" placeholder="UI Preview" />
        <PreviewCard title="Pet Records" placeholder="UI Preview" />
        <PreviewCard title="Vaccination Timeline" placeholder="UI Preview" />
      </div>
    </div>
  </Section>
);

const TestimonialsSection = () => (
  <Section>
    <div className="space-y-16">
      <div className="text-center">
        <h2 className="text-4xl md:text-5xl font-serif tracking-tight">Trusted by Pet Owners</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { text: "VetiCare’s prediction tool helped me catch my cat’s kidney issue early. The interface is stunningly simple.", author: "Sarah M.", role: "Cat Owner" },
          { text: "Finally, an app that doesn't feel cluttered. Managing my two Golden Retrievers' vaccines is now a breeze.", author: "David K.", role: "Dog Owner" },
          { text: "The elegant design matched with powerful AI makes this the only pet health app I'll ever need.", author: "Elena R.", role: "Pet Parent" }
        ].map((t, i) => (
          <div key={i} className="p-8 border border-borderLight rounded-xl space-y-6 bg-white">
            <p className="text-textSecondary font-light leading-relaxed text-lg">"{t.text}"</p>
            <div>
              <p className="font-medium text-textPrimary">{t.author}</p>
              <p className="text-xs uppercase tracking-widest text-textSecondary">{t.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </Section>
);

const CTASection = () => (
  <Section className="pb-32">
    <div className="bg-textPrimary text-white rounded-3xl p-12 md:p-24 text-center space-y-8 max-w-4xl mx-auto shadow-2xl">
      <h2 className="text-4xl md:text-6xl font-serif tracking-tight">
        Ready to keep your pets healthier?
      </h2>
      <p className="text-gray-300 font-light text-lg max-w-xl mx-auto">
        Join VetiCare today and experience the future of intelligent, elegant pet management.
      </p>
      <Link to="/register" className="inline-block pt-4">
        <Button size="lg" className="bg-white text-textPrimary hover:bg-gray-100 rounded-full px-12 h-14 text-lg">
          Get Started
        </Button>
      </Link>
    </div>
  </Section>
);

// ============================================================================
// MAIN PAGE EXPORT
// ============================================================================

export default function Home() {
  return (
    <div className="w-full">
      <HeroSection />
      <TrustSection />
      <FeaturesSection />
      <HowItWorksSection />
      <WhySection />
      <QuickPreviewSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}
