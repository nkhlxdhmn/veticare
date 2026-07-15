import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, Activity, Download, ArrowRight, Loader2, ListPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { petService, predictionService } from '@/services';
import { toast } from '@/hooks/use-toast';
import type { PredictionRequestPayload, PredictionResult, PredictionHistoryItem } from '@/types';

// Minimal list of symptoms. In reality this could come from a backend dictionary.
const SYMPTOMS = [
  'Lethargy', 'Vomiting', 'Diarrhea', 'Loss of Appetite', 'Coughing', 
  'Sneezing', 'Fever', 'Increased Thirst', 'Frequent Urination', 
  'Weight Loss', 'Lameness', 'Skin Lesions'
];

export default function PredictionFlow() {
  const [step, setStep] = useState(1);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const { data: pets, isLoading: petsLoading } = useQuery({
    queryKey: ['pets'],
    queryFn: () => petService.getAll(),
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['predictions', 'history'],
    queryFn: () => predictionService.getHistory(),
  });

  const predictMutation = useMutation({
    mutationFn: (payload: PredictionRequestPayload) => predictionService.predict(payload),
    onSuccess: (data) => {
      setResult(data);
      setStep(3);
      toast({ title: 'Prediction complete', variant: 'success' });
    },
    onError: () => {
      toast({ title: 'Prediction failed', description: 'Could not contact the AI service.', variant: 'destructive' });
    }
  });

  const handlePredict = () => {
    if (!selectedPetId || selectedSymptoms.length === 0) return;
    predictMutation.mutate({
      pet_id: selectedPetId,
      symptoms: selectedSymptoms,
    });
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const resetFlow = () => {
    setStep(1);
    setSelectedPetId(null);
    setSelectedSymptoms([]);
    setResult(null);
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Health Prediction</h2>
          <p className="text-muted-foreground mt-1">Analyze symptoms using our trained veterinary models.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted px-4 py-2 rounded-full">
          <span className={step >= 1 ? 'text-primary font-bold' : ''}>Pet</span>
          <ArrowRight className="h-4 w-4 opacity-50" />
          <span className={step >= 2 ? 'text-primary font-bold' : ''}>Symptoms</span>
          <ArrowRight className="h-4 w-4 opacity-50" />
          <span className={step >= 3 ? 'text-primary font-bold' : ''}>Results</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div className="relative">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="min-h-[400px]">
                  <CardHeader>
                    <CardTitle>Select a Pet</CardTitle>
                    <CardDescription>Which pet are you requesting a prediction for?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {petsLoading ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
                      </div>
                    ) : pets && pets.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        {pets.map((pet) => (
                          <div 
                            key={pet.id}
                            onClick={() => {
                              setSelectedPetId(pet.id);
                              setStep(2);
                            }}
                            className="flex items-center gap-4 p-4 rounded-lg border cursor-pointer hover:border-accent hover:bg-accent/5 transition-colors"
                          >
                            <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xl shrink-0">
                              {pet.species === 'Dog' ? '🐶' : pet.species === 'Cat' ? '🐱' : '🐾'}
                            </div>
                            <div className="min-w-0">
                              <span className="font-medium block truncate">{pet.name}</span>
                              <span className="text-xs text-muted-foreground truncate block">{pet.species}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-muted-foreground mb-4">You need to add a pet first.</p>
                      </div>
                    )}
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
                <Card className="min-h-[400px] flex flex-col">
                  <CardHeader>
                    <CardTitle>Describe Symptoms</CardTitle>
                    <CardDescription>Select all symptoms that apply to the pet.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="flex flex-wrap gap-2">
                      {SYMPTOMS.map((symptom) => {
                        const isSelected = selectedSymptoms.includes(symptom);
                        return (
                          <Badge 
                            key={symptom} 
                            variant="outline" 
                            onClick={() => toggleSymptom(symptom)}
                            className={`cursor-pointer text-sm py-2 px-4 select-none transition-colors ${
                              isSelected 
                                ? 'bg-primary text-primary-foreground hover:bg-primary/90 border-primary' 
                                : 'hover:bg-muted'
                            }`}
                          >
                            {isSelected && <Activity className="mr-1.5 h-3.5 w-3.5" />}
                            {symptom}
                          </Badge>
                        );
                      })}
                    </div>
                  </CardContent>
                  <CardFooter className="justify-between border-t p-6 mt-auto">
                    <Button variant="ghost" onClick={() => setStep(1)} disabled={predictMutation.isPending}>Back</Button>
                    <Button 
                      onClick={handlePredict} 
                      disabled={predictMutation.isPending || selectedSymptoms.length === 0} 
                      className="gap-2"
                    >
                      {predictMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
                      {predictMutation.isPending ? 'Analyzing...' : 'Generate Prediction'}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {step === 3 && result && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className={`overflow-hidden border-2 ${result.dangerous ? 'border-destructive' : 'border-success'}`}>
                  <div className={`p-6 border-b flex items-start gap-4 ${result.dangerous ? 'bg-destructive/10 border-destructive/20' : 'bg-success/10 border-success/20'}`}>
                    <div className={`p-3 rounded-full text-white ${result.dangerous ? 'bg-destructive' : 'bg-success'}`}>
                      <Activity className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold">{result.predicted_disease}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={result.dangerous ? "destructive" : "success"}>
                          {result.dangerous ? 'High Risk' : 'Low Risk'}
                        </Badge>
                        <span className="text-sm font-medium text-muted-foreground">Confidence: {Math.round(result.confidence * 100)}%</span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">Recommendation</h4>
                      <p className="text-foreground/90 bg-muted/50 p-4 rounded-md border leading-relaxed">
                        {result.recommendation}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground block mb-1">Symptoms Evaluated</span>
                        <span className="font-medium">{selectedSymptoms.join(', ')}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/50 p-6 flex flex-col sm:flex-row justify-between gap-4">
                    <Button variant="outline" onClick={resetFlow}>New Prediction</Button>
                    <Button variant="secondary" className="gap-2">
                      <Download className="h-4 w-4" /> Download Report
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* History Sidebar */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <ListPlus className="h-5 w-5" /> Recent History
          </h3>
          {historyLoading ? (
             <div className="space-y-3">
               {[1,2,3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
             </div>
          ) : history && history.length > 0 ? (
            <div className="space-y-3">
              {history.slice(0, 5).map(item => (
                <Card key={item.id} className="p-4 bg-muted/30 border-muted">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-sm line-clamp-1" title={item.predicted_disease}>{item.predicted_disease}</span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{item.pet_name}</span>
                    <span>{Math.round(item.confidence * 100)}%</span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-6 border rounded-lg text-center text-muted-foreground text-sm bg-muted/10">
              No previous predictions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
