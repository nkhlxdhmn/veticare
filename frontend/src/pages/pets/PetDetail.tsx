import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft, Edit2, Trash2, Camera, Activity, 
  Stethoscope, Syringe, AlertTriangle, Loader2, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { petService, vaccinationService, medicalRecordService } from '@/services';
import { toast } from '@/hooks/use-toast';
import type { PetUpdatePayload, Species, Gender } from '@/types';

const SPECIES_OPTIONS: Species[] = ['Dog', 'Cat', 'Cow', 'Buffalo', 'Sheep', 'Goat', 'Horse', 'Pig', 'Rabbit', 'Other'];
const GENDER_OPTIONS: Gender[] = ['Male', 'Female', 'Unknown'];
const SPECIES_EMOJI: Record<string, string> = {
  Dog: '🐶', Cat: '🐱', Cow: '🐄', Buffalo: '🐃', Sheep: '🐑',
  Goat: '🐐', Horse: '🐴', Pig: '🐷', Rabbit: '🐰', Other: '🐾',
};

function getAge(dob: string | null): string {
  if (!dob) return 'Unknown';
  const born = new Date(dob);
  const now = new Date();
  const years = now.getFullYear() - born.getFullYear();
  const months = now.getMonth() - born.getMonth();
  if (years > 0) return `${years} ${years === 1 ? 'year' : 'years'}`;
  if (months > 0) return `${months} ${months === 1 ? 'month' : 'months'}`;
  return 'Less than a month';
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
}

export default function PetDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);


  // Queries
  const { data: pet, isLoading: petLoading, isError: petError } = useQuery({
    queryKey: ['pets', id],
    queryFn: () => petService.getById(id!),
    enabled: !!id,
  });

  const { data: vaccinations, isLoading: vacLoading } = useQuery({
    queryKey: ['vaccinations', 'pet', id],
    queryFn: () => vaccinationService.getForPet(id!),
    enabled: !!id,
  });

  const { data: records, isLoading: recLoading } = useQuery({
    queryKey: ['medical-records', 'pet', id],
    queryFn: () => medicalRecordService.getForPet(id!),
    enabled: !!id,
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: (payload: PetUpdatePayload) => petService.update(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets', id] });
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      setEditDialogOpen(false);
      toast({ title: 'Pet updated', variant: 'success' });
    },
    onError: () => toast({ title: 'Update failed', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => petService.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      toast({ title: 'Pet removed', variant: 'success' });
      navigate('/pets');
    },
    onError: () => toast({ title: 'Failed to remove pet', variant: 'destructive' }),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => petService.uploadImage(id!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets', id] });
      toast({ title: 'Image updated', variant: 'success' });
    },
    onError: () => toast({ title: 'Upload failed', variant: 'destructive' }),
  });

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: PetUpdatePayload = {
      name: fd.get('name') as string,
      species: fd.get('species') as Species,
      breed: (fd.get('breed') as string) || undefined,
      gender: (fd.get('gender') as Gender) || 'Unknown',
      weight: fd.get('weight') ? Number(fd.get('weight')) : undefined,
      date_of_birth: (fd.get('date_of_birth') as string) || undefined,
      is_active: fd.get('is_active') === 'true',
    };
    updateMutation.mutate(payload);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadMutation.mutate(e.target.files[0]);
    }
  };

  if (petLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
          <Skeleton className="h-[400px] rounded-xl" />
          <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (petError || !pet) {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Pet not found</h2>
        <p className="text-muted-foreground mb-6">The pet you are looking for does not exist or you don't have access.</p>
        <Button asChild>
          <Link to="/pets">Return to Pets</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link to="/pets"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              {pet.name}
              <Badge variant={pet.is_active ? 'success' : 'secondary'}>
                {pet.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </h2>
            <p className="text-muted-foreground">
              {pet.species} {pet.breed ? `· ${pet.breed}` : ''}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
            <Edit2 className="mr-2 h-4 w-4" /> Edit
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" /> Remove
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative group">
                  <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-background shadow-lg bg-zinc-100 flex items-center justify-center text-5xl mb-4">
                    {pet.image_url ? (
                      <img src={pet.image_url} alt={pet.name} className="h-full w-full object-cover" />
                    ) : (
                      SPECIES_EMOJI[pet.species] || '🐾'
                    )}
                  </div>
                  <label className="absolute bottom-4 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-md cursor-pointer hover:bg-primary/90 transition-colors opacity-0 group-hover:opacity-100">
                    {uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={uploadMutation.isPending} />
                  </label>
                </div>
                <h3 className="font-semibold text-lg">{pet.name}</h3>
                <p className="text-sm text-muted-foreground">{getAge(pet.date_of_birth)} old</p>
              </div>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Gender</span>
                  <span className="font-medium">{pet.gender}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Weight</span>
                  <span className="font-medium">{pet.weight ? `${pet.weight} kg` : 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Born</span>
                  <span className="font-medium">{formatDate(pet.date_of_birth)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Added</span>
                  <span className="font-medium">{formatDate(pet.created_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Button className="w-full" asChild>
            <Link to="/predictions">
              <Activity className="mr-2 h-4 w-4" /> Run Health Check
            </Link>
          </Button>
        </div>

        {/* Main Content Tabs */}
        <Card className="flex flex-col h-full">
          <Tabs defaultValue="medical" className="flex flex-col h-full">
            <div className="px-6 pt-6 pb-2 border-b">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="medical">Medical Records</TabsTrigger>
                <TabsTrigger value="vaccines">Vaccinations</TabsTrigger>
                <TabsTrigger value="predictions">AI History</TabsTrigger>
              </TabsList>
            </div>
            
            <CardContent className="flex-1 p-6">
              {/* Medical Records Tab */}
              <TabsContent value="medical" className="mt-0 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Visit History</h3>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/medical-records"><Plus className="mr-2 h-3 w-3" /> Add Record</Link>
                  </Button>
                </div>
                
                {recLoading ? (
                  <div className="space-y-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></div>
                ) : records && records.length > 0 ? (
                  <div className="space-y-4">
                    {records.map((record) => (
                      <div key={record.id} className="p-4 rounded-lg border bg-zinc-50 dark:bg-zinc-900/50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-primary flex items-center gap-2">
                            <Stethoscope className="h-4 w-4" /> {record.diagnosis}
                          </h4>
                          <span className="text-xs text-muted-foreground">{formatDate(record.visit_date)}</span>
                        </div>
                        {record.treatment && <p className="text-sm text-muted-foreground mb-1"><span className="font-medium">Treatment:</span> {record.treatment}</p>}
                        {record.clinic_name && <p className="text-xs text-muted-foreground">{record.clinic_name} {record.doctor_name ? `· Dr. ${record.doctor_name}` : ''}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Stethoscope className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p>No medical records found.</p>
                  </div>
                )}
              </TabsContent>

              {/* Vaccinations Tab */}
              <TabsContent value="vaccines" className="mt-0 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Vaccination History</h3>
                  <Button size="sm" variant="outline" asChild>
                    <Link to="/vaccinations"><Plus className="mr-2 h-3 w-3" /> Add Vaccine</Link>
                  </Button>
                </div>

                {vacLoading ? (
                  <div className="space-y-4"><Skeleton className="h-16 w-full" /><Skeleton className="h-16 w-full" /></div>
                ) : vaccinations && vaccinations.length > 0 ? (
                  <div className="space-y-3">
                    {vaccinations.map((vac) => {
                      const isUpcoming = vac.next_due_date && new Date(vac.next_due_date) > new Date();
                      const isOverdue = vac.next_due_date && new Date(vac.next_due_date) < new Date();
                      
                      return (
                        <div key={vac.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-accent/10 text-accent">
                              <Syringe className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{vac.vaccine_name}</p>
                              <p className="text-xs text-muted-foreground">Administered: {formatDate(vac.date_administered)}</p>
                            </div>
                          </div>
                          {vac.next_due_date && (
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground mb-1">Next Due</p>
                              <Badge variant={isOverdue ? 'destructive' : isUpcoming ? 'warning' : 'secondary'} className="text-[10px]">
                                {formatDate(vac.next_due_date)}
                              </Badge>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Syringe className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p>No vaccinations recorded.</p>
                  </div>
                )}
              </TabsContent>

              {/* AI Predictions Tab */}
              <TabsContent value="predictions" className="mt-0 h-full">
                <div className="text-center py-12 text-muted-foreground">
                    <Activity className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="mb-4">Prediction history will appear here.</p>
                    <Button variant="outline" asChild>
                      <Link to="/predictions">Run New Prediction</Link>
                    </Button>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {pet.name}</DialogTitle>
            <DialogDescription>Update your pet's information.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pet-name">Name *</Label>
              <Input id="pet-name" name="name" required defaultValue={pet.name} disabled={updateMutation.isPending} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pet-species">Species *</Label>
                <Select id="pet-species" name="species" required defaultValue={pet.species} disabled={updateMutation.isPending}>
                  {SPECIES_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pet-gender">Gender</Label>
                <Select id="pet-gender" name="gender" defaultValue={pet.gender} disabled={updateMutation.isPending}>
                  {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pet-breed">Breed</Label>
              <Input id="pet-breed" name="breed" defaultValue={pet.breed || ''} disabled={updateMutation.isPending} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pet-weight">Weight (kg)</Label>
                <Input id="pet-weight" name="weight" type="number" step="0.01" min="0" defaultValue={pet.weight ?? ''} disabled={updateMutation.isPending} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pet-dob">Date of Birth</Label>
                <Input id="pet-dob" name="date_of_birth" type="date" max={new Date().toISOString().split('T')[0]} defaultValue={pet.date_of_birth?.split('T')[0] || ''} disabled={updateMutation.isPending} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pet-status">Status</Label>
              <Select id="pet-status" name="is_active" defaultValue={pet.is_active ? 'true' : 'false'} disabled={updateMutation.isPending}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)} disabled={updateMutation.isPending}>Cancel</Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove {pet.name}?</DialogTitle>
            <DialogDescription>This will remove {pet.name} from your records. This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleteMutation.isPending}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
