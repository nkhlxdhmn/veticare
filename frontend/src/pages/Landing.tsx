import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Activity, ShieldCheck, Stethoscope, ArrowRight, Brain, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  const features = [
    {
      icon: <Brain className="h-6 w-6 text-accent" />,
      title: 'AI Disease Prediction',
      description: 'Leverage our advanced machine learning models to predict potential health risks based on symptoms and history.'
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-success" />,
      title: 'Vaccination Tracking',
      description: 'Never miss a shot with automated timelines and timely reminders for your pets.'
    },
    {
      icon: <Stethoscope className="h-6 w-6 text-primary" />,
      title: 'Comprehensive Records',
      description: 'Keep all your medical history, prescriptions, and vet notes securely in one place.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 -z-10" />
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col justify-center space-y-4"
            >
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  AI Powered Pet <br />
                  <span className="text-accent">Healthcare Platform</span>
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Predict diseases, manage vaccinations, and monitor your pets using state-of-the-art Artificial Intelligence.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg">
                  <Link to="/register">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/about">View Demo</Link>
                </Button>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center justify-center"
            >
              <div className="relative w-full aspect-square md:aspect-video lg:aspect-square bg-zinc-200 dark:bg-zinc-800 rounded-2xl overflow-hidden shadow-xl border">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Activity className="w-24 h-24 text-zinc-400 opacity-20" />
                  <span className="sr-only">Dashboard Illustration</span>
                </div>
                {/* Mock UI overlaid */}
                <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur p-4 rounded-lg shadow-lg border w-64">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">AI Analysis</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-accent w-[85%]" />
                  </div>
                  <div className="text-xs font-medium mt-2 flex justify-between">
                    <span>Healthy</span>
                    <span className="text-accent">85% Confidence</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-zinc-200 dark:bg-zinc-800 px-3 py-1 text-sm font-medium text-accent">
                Enterprise Grade
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Everything you need for your pet's health
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                VetiCare provides a comprehensive suite of tools designed to keep your companions healthy and happy, powered by advanced data analytics.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5 }}
                className="flex flex-col items-start space-y-4 rounded-lg border bg-background p-6 shadow-sm"
              >
                <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 border-t">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to protect your pet?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                Join thousands of pet owners who trust VetiCare for proactive health management.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row pt-4">
              <Button size="lg" asChild className="px-8">
                <Link to="/register">Create Free Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
