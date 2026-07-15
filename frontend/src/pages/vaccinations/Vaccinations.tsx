import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Syringe, Loader2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { petService, vaccinationService } from '@/services';
import { toast } from '@/hooks/use-toast';
import type { VaccinationCreatePayload, Vaccination } from '@/types';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString();
}

export default function Vaccinations() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Vaccination | null>(null);

  const { data: pets, isLoading: petsLoading } = useQuery({
    queryKey: ['pets'],
    queryFn: () => petService.getAll(),
  });

  const { data: allRecords, isLoading: recordsLoading } = useQuery({
    queryKey: ['vaccinations', 'all'],
    queryFn: async () => {
      if (!pets || pets.length === 0) return [];
      
      if (selectedPetId) {
         return vaccinationService.getForPet(selectedPetId);
      }
      
      const promises = pets.map(pet => vaccinationService.getForPet(pet.id));
      const results = await Promise.all(promises);
      return results.flat().sort((a, b) => new Date(b.date_administered).getTime() - new Date(a.date_administered).getTime());
    },
    enabled: !!pets,
  });

  const { data: upcomingRecords } = useQuery({
    queryKey: ['vaccinations', 'upcoming'],
    queryFn: () => vaccinationService.getUpcoming(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: { petId: string, data: VaccinationCreatePayload }) => vaccinationService.create(payload.petId, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccinations'] });
      setDialogOpen(false);
      toast({ title: 'Vaccination added', variant: 'success' });
    },
    onError: () => toast({ title: 'Failed to add vaccination', variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: VaccinationCreatePayload }) => 
      vaccinationService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccinations'] });
      setDialogOpen(false);
      setEditingRecord(null);
      toast({ title: 'Vaccination updated', variant: 'success' });
    },
    onError: () => toast({ title: 'Failed to update vaccination', variant: 'destructive' }),
  });

  const filteredRecords = allRecords?.filter(record => {
    return record.vaccine_name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: VaccinationCreatePayload = {
      vaccine_name: fd.get('vaccine_name') as string,
      date_administered: fd.get('date_administered') as string,
      dose_number: fd.get('dose_number') ? Number(fd.get('dose_number')) : undefined,
      batch_number: (fd.get('batch_number') as string) || undefined,
      next_due_date: (fd.get('next_due_date') as string) || undefined,
      clinic_name: (fd.get('clinic_name') as string) || undefined,
      notes: (fd.get('notes') as string) || undefined,
    };

    if (editingRecord) {
      updateMutation.mutate({ id: editingRecord.id, payload });
    } else {
      const petId = fd.get('pet_id') as string;
      createMutation.mutate({ petId, data: payload });
    }
  };

  const openCreateDialog = () => {
    setEditingRecord(null);
    setDialogOpen(true);
  };

  const openEditDialog = (record: Vaccination) => {
    setEditingRecord(record);
    setDialogOpen(true);
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Vaccinations</h2>
        <Button onClick={openCreateDialog} disabled={!pets || pets.length === 0}>
          <Plus className="mr-2 h-4 w-4" /> Add Vaccination
        </Button>
      </div>

      {upcomingRecords && upcomingRecords.length > 0 && (
        <Card className="border-warning bg-warning/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-warning-foreground">Upcoming Vaccinations</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-3">
                {upcomingRecords.map((vac) => {
                  const pet = pets?.find(p => p.id === vac.pet_id);
                  const isOverdue = vac.next_due_date && new Date(vac.next_due_date) < new Date();
                  
                  return (
                    <div key={`upcoming-${vac.id}`} className="flex items-center justify-between p-3 rounded-lg border bg-background">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-warning/20 text-warning-foreground">
                          <Syringe className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{vac.vaccine_name}</p>
                          <p className="text-xs text-muted-foreground">{pet?.name || 'Unknown Pet'}</p>
                        </div>
                      </div>
                      {vac.next_due_date && (
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground mb-1">Due</p>
                          <Badge variant={isOverdue ? 'destructive' : 'warning'} className="text-[10px]">
                            {formatDate(vac.next_due_date)}
                          </Badge>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search vaccines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={selectedPetId}
          onChange={(e) => setSelectedPetId(e.target.value)}
          className="sm:w-48"
          disabled={petsLoading}
        >
          <option value="">All Pets</option>
          {pets?.map((pet) => (
            <option key={pet.id} value={pet.id}>{pet.name}</option>
          ))}
        </Select>
      </div>

      {recordsLoading || petsLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : filteredRecords && filteredRecords.length > 0 ? (
        <div className="space-y-4">
          {filteredRecords.map((record) => {
            const pet = pets?.find(p => p.id === record.pet_id);
            return (
              <Card key={record.id} className="relative group">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => openEditDialog(record)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <span className="font-medium text-foreground">{pet?.name || 'Unknown Pet'}</span>
                  </div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Syringe className="h-5 w-5 text-accent" />
                    {record.vaccine_name} {record.dose_number ? `(Dose ${record.dose_number})` : ''}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                    <div><span className="text-muted-foreground block mb-0.5">Administered</span><span className="font-medium">{formatDate(record.date_administered)}</span></div>
                    {record.next_due_date && (
                       <div><span className="text-muted-foreground block mb-0.5">Next Due</span><span className="font-medium">{formatDate(record.next_due_date)}</span></div>
                    )}
                    {record.batch_number && (
                      <div><span className="text-muted-foreground block mb-0.5">Batch No.</span><span className="font-medium">{record.batch_number}</span></div>
                    )}
                    {record.clinic_name && (
                      <div><span className="text-muted-foreground block mb-0.5">Clinic</span><span className="font-medium">{record.clinic_name}</span></div>
                    )}
                  </div>
                  {record.notes && (
                    <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                      <span className="block font-medium mb-1">Notes</span>
                      {record.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Syringe className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold mb-1">No vaccinations found</h3>
          <p className="text-sm text-muted-foreground mb-4">Keep track of your pet's vaccination schedule.</p>
          <Button onClick={openCreateDialog} disabled={!pets || pets.length === 0}>
            <Plus className="mr-2 h-4 w-4" /> Add First Vaccination
          </Button>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingRecord(null); }}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecord ? 'Edit Vaccination' : 'Add Vaccination'}</DialogTitle>
            <DialogDescription>Record a new vaccination dose.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pet_id">Pet *</Label>
                <Select id="pet_id" name="pet_id" required defaultValue={editingRecord?.pet_id || selectedPetId || ''} disabled={isMutating || !!editingRecord}>
                  <option value="" disabled>Select a pet...</option>
                  {pets?.map(pet => <option key={pet.id} value={pet.id}>{pet.name}</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vaccine_name">Vaccine Name *</Label>
                <Input id="vaccine_name" name="vaccine_name" required placeholder="e.g., Rabies" defaultValue={editingRecord?.vaccine_name || ''} disabled={isMutating} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_administered">Date Administered *</Label>
                <Input id="date_administered" name="date_administered" type="date" required defaultValue={editingRecord?.date_administered?.split('T')[0] || new Date().toISOString().split('T')[0]} disabled={isMutating} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="next_due_date">Next Due Date</Label>
                <Input id="next_due_date" name="next_due_date" type="date" defaultValue={editingRecord?.next_due_date?.split('T')[0] || ''} disabled={isMutating} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dose_number">Dose Number</Label>
                <Input id="dose_number" name="dose_number" type="number" min="1" defaultValue={editingRecord?.dose_number || ''} disabled={isMutating} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch_number">Batch Number</Label>
                <Input id="batch_number" name="batch_number" defaultValue={editingRecord?.batch_number || ''} disabled={isMutating} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clinic_name">Clinic Name</Label>
              <Input id="clinic_name" name="clinic_name" defaultValue={editingRecord?.clinic_name || ''} disabled={isMutating} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea id="notes" name="notes" placeholder="Any special instructions..." defaultValue={editingRecord?.notes || ''} disabled={isMutating} className="h-20" />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isMutating}>Cancel</Button>
              <Button type="submit" disabled={isMutating}>
                {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {editingRecord ? 'Save Changes' : 'Add Vaccination'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
