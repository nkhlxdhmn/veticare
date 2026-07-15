import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Stethoscope, Loader2, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { petService, medicalRecordService } from '@/services';
import { toast } from '@/hooks/use-toast';
import type { MedicalRecordCreatePayload, MedicalRecord } from '@/types';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString();
}

export default function MedicalRecords() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MedicalRecord | null>(null);

  // Queries
  const { data: pets, isLoading: petsLoading } = useQuery({
    queryKey: ['pets'],
    queryFn: () => petService.getAll(),
  });

  const { data: allRecords, isLoading: recordsLoading } = useQuery({
    queryKey: ['medical-records', 'all'],
    // In a real app, we'd have a specific "get all for user" endpoint or fetch per pet.
    // Assuming we want to fetch records for the selected pet, or all if none selected.
    queryFn: async () => {
      if (!pets || pets.length === 0) return [];
      
      if (selectedPetId) {
         return medicalRecordService.getForPet(selectedPetId);
      }
      
      // If no pet selected, fetch for all (Naïve approach for demonstration)
      const promises = pets.map(pet => medicalRecordService.getForPet(pet.id));
      const results = await Promise.all(promises);
      return results.flat().sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime());
    },
    enabled: !!pets,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (payload: MedicalRecordCreatePayload) => medicalRecordService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] });
      setDialogOpen(false);
      toast({ title: 'Record added', variant: 'success' });
    },
    onError: () => toast({ title: 'Failed to add record', variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MedicalRecordCreatePayload }) => 
      medicalRecordService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] });
      setDialogOpen(false);
      setEditingRecord(null);
      toast({ title: 'Record updated', variant: 'success' });
    },
    onError: () => toast({ title: 'Failed to update record', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => medicalRecordService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] });
      setDeleteTarget(null);
      toast({ title: 'Record removed', variant: 'success' });
    },
    onError: () => toast({ title: 'Failed to remove record', variant: 'destructive' }),
  });

  const filteredRecords = allRecords?.filter(record => {
    const matchesSearch = record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (record.clinic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    return matchesSearch;
  });

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: MedicalRecordCreatePayload = {
      pet_id: fd.get('pet_id') as string,
      visit_date: fd.get('visit_date') as string,
      diagnosis: fd.get('diagnosis') as string,
      treatment: (fd.get('treatment') as string) || undefined,
      medicines: (fd.get('medicines') as string) || undefined,
      doctor_name: (fd.get('doctor_name') as string) || undefined,
      clinic_name: (fd.get('clinic_name') as string) || undefined,
      notes: (fd.get('notes') as string) || undefined,
    };

    if (editingRecord) {
      updateMutation.mutate({ id: editingRecord.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openCreateDialog = () => {
    setEditingRecord(null);
    setDialogOpen(true);
  };

  const openEditDialog = (record: MedicalRecord) => {
    setEditingRecord(record);
    setDialogOpen(true);
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Medical Records</h2>
        <Button onClick={openCreateDialog} disabled={!pets || pets.length === 0}>
          <Plus className="mr-2 h-4 w-4" /> Add Record
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search diagnosis or clinic..."
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
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      ) : filteredRecords && filteredRecords.length > 0 ? (
        <div className="space-y-4">
          {filteredRecords.map((record) => {
            const pet = pets?.find(p => p.id === record.pet_id);
            return (
              <Card key={record.id} className="relative group">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => openEditDialog(record)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(record)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <span className="font-medium text-foreground">{pet?.name || 'Unknown Pet'}</span>
                    <span>•</span>
                    <span>{formatDate(record.visit_date)}</span>
                  </div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    {record.diagnosis}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    {record.treatment && (
                      <div><span className="text-muted-foreground block mb-0.5">Treatment</span><span className="font-medium">{record.treatment}</span></div>
                    )}
                    {record.medicines && (
                      <div><span className="text-muted-foreground block mb-0.5">Medicines</span><span className="font-medium">{record.medicines}</span></div>
                    )}
                    {record.clinic_name && (
                      <div><span className="text-muted-foreground block mb-0.5">Clinic</span><span className="font-medium">{record.clinic_name}</span></div>
                    )}
                    {record.doctor_name && (
                      <div><span className="text-muted-foreground block mb-0.5">Veterinarian</span><span className="font-medium">Dr. {record.doctor_name}</span></div>
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
          <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold mb-1">No medical records found</h3>
          <p className="text-sm text-muted-foreground mb-4">Keep track of your pet's health history.</p>
          <Button onClick={openCreateDialog} disabled={!pets || pets.length === 0}>
            <Plus className="mr-2 h-4 w-4" /> Add First Record
          </Button>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingRecord(null); }}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingRecord ? 'Edit Record' : 'Add Medical Record'}</DialogTitle>
            <DialogDescription>Enter details from the veterinary visit.</DialogDescription>
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
                <Label htmlFor="visit_date">Visit Date *</Label>
                <Input id="visit_date" name="visit_date" type="date" required defaultValue={editingRecord?.visit_date?.split('T')[0] || new Date().toISOString().split('T')[0]} disabled={isMutating} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis / Reason for visit *</Label>
              <Input id="diagnosis" name="diagnosis" required placeholder="e.g., Annual Checkup, Limping" defaultValue={editingRecord?.diagnosis || ''} disabled={isMutating} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="treatment">Treatment provided</Label>
              <Input id="treatment" name="treatment" placeholder="e.g., Wound cleaned, X-Rays taken" defaultValue={editingRecord?.treatment || ''} disabled={isMutating} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicines">Prescribed Medicines</Label>
              <Input id="medicines" name="medicines" placeholder="e.g., Amoxicillin 50mg" defaultValue={editingRecord?.medicines || ''} disabled={isMutating} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clinic_name">Clinic Name</Label>
                <Input id="clinic_name" name="clinic_name" defaultValue={editingRecord?.clinic_name || ''} disabled={isMutating} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor_name">Veterinarian Name</Label>
                <Input id="doctor_name" name="doctor_name" placeholder="Name without 'Dr.'" defaultValue={editingRecord?.doctor_name || ''} disabled={isMutating} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea id="notes" name="notes" placeholder="Any special instructions or observations..." defaultValue={editingRecord?.notes || ''} disabled={isMutating} className="h-24" />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isMutating}>Cancel</Button>
              <Button type="submit" disabled={isMutating}>
                {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {editingRecord ? 'Save Changes' : 'Add Record'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete record?</DialogTitle>
            <DialogDescription>Are you sure you want to delete this medical record? This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleteMutation.isPending}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
