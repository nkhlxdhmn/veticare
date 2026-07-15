import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { rescueRequestService } from '@/services';
import type { RescueRequestCreatePayload } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ShieldAlert, Loader2, MapPin } from 'lucide-react';

export default function RescueRequestForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<RescueRequestCreatePayload>({
    description: '',
    address: '',
    location_lat: 0,
    location_lng: 0,
    emergency_priority: true,
  });

  const mutation = useMutation({
    mutationFn: (data: RescueRequestCreatePayload) => rescueRequestService.create(data),
    onSuccess: () => {
      toast({
        title: "Emergency Request Submitted",
        description: "Local NGOs have been notified. Please stay safe.",
        variant: "success",
      });
      navigate('/ngos');
    },
    onError: () => {
      toast({
        title: "Failed to submit request",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.address) {
      toast({ title: 'Missing fields', description: 'Please provide a description and address.', variant: 'destructive' });
      return;
    }
    mutation.mutate(formData);
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location_lat: position.coords.latitude,
            location_lng: position.coords.longitude
          }));
          toast({ title: "Location detected", variant: "default" });
        },
        () => {
          toast({ title: "Location access denied", variant: "destructive" });
        }
      );
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 pt-6 max-w-2xl mx-auto">
      <Card className="border-destructive/20 shadow-sm">
        <CardHeader className="bg-destructive/5 border-b border-destructive/10 rounded-t-xl pb-6">
          <CardTitle className="text-2xl flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-6 w-6" />
            Report Animal Emergency
          </CardTitle>
          <CardDescription className="text-foreground/80">
            Submit a rescue request. This will broadcast to all registered NGOs in your vicinity.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="description">Describe the situation <span className="text-destructive">*</span></Label>
              <Textarea 
                id="description" 
                placeholder="E.g., Injured stray dog near the highway, unable to walk..." 
                className="min-h-[120px]"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <Label htmlFor="address">Location / Address <span className="text-destructive">*</span></Label>
                <Button type="button" variant="ghost" size="sm" onClick={getUserLocation} className="h-8 text-xs gap-1">
                  <MapPin className="h-3 w-3" /> Get Current Location
                </Button>
              </div>
              <Input 
                id="address" 
                placeholder="Nearest landmark or street address" 
                value={formData.address || ''}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                required
              />
              {formData.location_lat !== 0 && (
                <p className="text-xs text-muted-foreground">Coordinates: {formData.location_lat.toFixed(4)}, {formData.location_lng.toFixed(4)}</p>
              )}
            </div>

            <div className="flex items-center space-x-2 bg-muted/50 p-4 rounded-lg border">
              <Checkbox 
                id="emergency" 
                checked={formData.emergency_priority}
                onCheckedChange={(checked) => setFormData({...formData, emergency_priority: checked as boolean})}
              />
              <div className="space-y-1 leading-none">
                <Label htmlFor="emergency" className="font-semibold cursor-pointer">
                  High Priority Emergency
                </Label>
                <p className="text-sm text-muted-foreground">
                  Check this if the animal is in immediate life-threatening danger.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between border-t p-6">
            <Button type="button" variant="outline" onClick={() => navigate('/ngos')}>Cancel</Button>
            <Button type="submit" variant="destructive" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldAlert className="mr-2 h-4 w-4" />}
              {mutation.isPending ? 'Broadcasting...' : 'Broadcast Emergency'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
