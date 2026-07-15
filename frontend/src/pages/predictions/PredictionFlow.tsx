import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Activity, Download, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PredictionFlow() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const handlePredict = async () => {
    setLoading(true);
    // Simulate AI inference delay
    await new Promise(r => setTimeout(r, 2500));
    setLoading(false);
    setStep(3);
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Health Prediction</h2>
          <p className="text-muted-foreground mt-1">Analyze symptoms using our trained veterinary models.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span className={step >= 1 ? 'text-primary' : ''}>Pet</span>
          <ArrowRight className="h-4 w-4" />
          <span className={step >= 2 ? 'text-primary' : ''}>Symptoms</span>
          <ArrowRight className="h-4 w-4" />
          <span className={step >= 3 ? 'text-primary' : ''}>Results</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Select a Pet</CardTitle>
                <CardDescription>Which pet are you requesting a prediction for?</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {['Buddy (Golden Retriever)', 'Luna (Siamese)'].map((pet, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setStep(2)}
                    className="flex items-center gap-4 p-4 rounded-lg border cursor-pointer hover:border-accent transition-colors"
                  >
                    <div className="h-12 w-12 rounded-full bg-zinc-100 flex items-center justify-center text-xl">
                      {idx === 0 ? '🐶' : '🐱'}
                    </div>
                    <span className="font-medium">{pet}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Describe Symptoms</CardTitle>
                <CardDescription>Select all symptoms that apply to Buddy.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-6">
                  {['Lethargy', 'Vomiting', 'Diarrhea', 'Loss of Appetite', 'Coughing', 'Sneezing', 'Fever'].map((symptom, idx) => (
                    <Badge 
                      key={idx} 
                      variant="outline" 
                      className={`cursor-pointer text-sm py-1.5 px-3 hover:bg-zinc-100 ${idx === 0 || idx === 3 ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground' : ''}`}
                    >
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="justify-between border-t p-6">
                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={handlePredict} disabled={loading} className="gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                  {loading ? 'Analyzing...' : 'Generate Prediction'}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="border-accent overflow-hidden">
              <div className="bg-accent/10 p-6 border-b border-accent/20 flex items-start gap-4">
                <div className="p-3 bg-accent rounded-full text-white">
                  <Activity className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-accent-foreground">Parvovirus Infection Risk</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="destructive">High Risk</Badge>
                    <span className="text-sm font-medium text-muted-foreground">Confidence: 89%</span>
                  </div>
                </div>
              </div>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Recommendation</h4>
                  <p className="text-muted-foreground bg-zinc-50 p-4 rounded-md border">
                    The symptoms presented (Lethargy, Loss of Appetite) combined with the pet's age and breed strongly indicate a potential parvovirus infection. Immediate veterinary attention is highly recommended. Ensure the pet stays hydrated.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground block mb-1">Matched Symptoms</span>
                    <span className="font-medium">Lethargy, Loss of Appetite</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block mb-1">Processing Time</span>
                    <span className="font-medium">1.24s (Model v2.4)</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 p-6 flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>New Prediction</Button>
                <Button variant="secondary" className="gap-2">
                  <Download className="h-4 w-4" /> Download Report
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
