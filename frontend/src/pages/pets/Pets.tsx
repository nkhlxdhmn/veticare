import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, Search, PawPrint, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { petService } from '@/services/pet.service';
import { toast } from '@/hooks/use-toast';
import type { Pet, PetCreatePayload, Species, Gender } from '@/types';

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

export default function Pets() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Pet | null>(null);

  const { data: pets, isLoading, isError, error } = useQuery({
    queryKey: ['pets'],
    queryFn: () => petService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: PetCreatePayload) => petService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      setDialogOpen(false);
      toast({ title: 'Pet added successfully', variant: 'success' });
    },
    onError: () => toast({ title: 'Failed to add pet', variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PetCreatePayload }) =>
      petService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      setDialogOpen(false);
      setEditingPet(null);
      toast({ title: 'Pet updated successfully', variant: 'success' });
    },
    onError: () => toast({ title: 'Failed to update pet', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => petService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      setDeleteTarget(null);
      toast({ title: 'Pet removed', variant: 'success' });
    },
    onError: () => toast({ title: 'Failed to remove pet', variant: 'destructive' }),
  });

  const filteredPets = pets?.filter((pet) => {
    const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pet.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesSpecies = !speciesFilter || pet.species === speciesFilter;
    return matchesSearch && matchesSpecies;
  });

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: PetCreatePayload = {
      name: fd.get('name') as string,
      species: fd.get('species') as Species,
      breed: (fd.get('breed') as string) || undefined,
      gender: (fd.get('gender') as Gender) || 'Unknown',
      weight: fd.get('weight') ? Number(fd.get('weight')) : undefined,
      date_of_birth: (fd.get('date_of_birth') as string) || undefined,
    };

    if (editingPet) {
      updateMutation.mutate({ id: editingPet.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openEditDialog = (pet: Pet) => {
    setEditingPet(pet);
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingPet(null);
    setDialogOpen(true);
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">My Pets</h2>
        <Button onClick={openCreateDialog} className="hidden sm:flex">
          <Plus className="mr-2 h-4 w-4" /> Add Pet
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or breed..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={speciesFilter}
          onChange={(e) => setSpeciesFilter(e.target.value)}
          className="sm:w-40"
        >
          <option value="">All Species</option>
          {SPECIES_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader className="gap-2">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-24 mb-2" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : isError ? (
        <Card className="p-12 text-center">
          <p className="text-destructive font-medium mb-2">Failed to load pets</p>
          <p className="text-sm text-muted-foreground">{(error as Error)?.message || 'An error occurred'}</p>
        </Card>
      ) : filteredPets && filteredPets.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPets.map((pet) => (
            <Card
              key={pet.id}
              className="flex flex-col relative overflow-hidden group border-zinc-200 hover:border-accent transition-colors"
            >
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5 z-10">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => { e.preventDefault(); openEditDialog(pet); }}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => { e.preventDefault(); setDeleteTarget(pet); }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Link to={`/pets/${pet.id}`} className="flex flex-col flex-1">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl shrink-0">
                      {SPECIES_EMOJI[pet.species] || '🐾'}
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-xl truncate">{pet.name}</CardTitle>
                      <p className="text-sm text-muted-foreground truncate">
                        {pet.breed || pet.species}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-0.5">Age</p>
                    <p className="font-medium">{getAge(pet.date_of_birth)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5">Weight</p>
                    <p className="font-medium">{pet.weight ? `${pet.weight} kg` : 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5">Gender</p>
                    <p className="font-medium">{pet.gender}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5">Status</p>
                    <Badge variant={pet.is_active ? 'success' : 'secondary'}>
                      {pet.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/50 p-4 mt-auto">
                  <span className="text-sm text-muted-foreground">View details →</span>
                </CardFooter>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <PawPrint className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold mb-1">
            {searchTerm || speciesFilter ? 'No pets match your filters' : 'No pets added yet'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {searchTerm || speciesFilter
              ? 'Try adjusting your search or filter criteria.'
              : 'Start by adding your first pet to keep track of their health.'}
          </p>
          {!searchTerm && !speciesFilter && (
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" /> Add Your First Pet
            </Button>
          )}
        </Card>
      )}

      {/* Mobile FAB */}
      <Button
        className="sm:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-20"
        size="icon"
        onClick={openCreateDialog}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingPet(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPet ? 'Edit Pet' : 'Add New Pet'}</DialogTitle>
            <DialogDescription>
              {editingPet ? 'Update your pet\'s information.' : 'Enter your pet\'s details to add them to your records.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pet-name">Name *</Label>
              <Input id="pet-name" name="name" required defaultValue={editingPet?.name || ''} disabled={isMutating} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pet-species">Species *</Label>
                <Select id="pet-species" name="species" required defaultValue={editingPet?.species || ''} disabled={isMutating}>
                  <option value="" disabled>Select...</option>
                  {SPECIES_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pet-gender">Gender</Label>
                <Select id="pet-gender" name="gender" defaultValue={editingPet?.gender || 'Unknown'} disabled={isMutating}>
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pet-breed">Breed</Label>
              <Input id="pet-breed" name="breed" defaultValue={editingPet?.breed || ''} disabled={isMutating} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pet-weight">Weight (kg)</Label>
                <Input id="pet-weight" name="weight" type="number" step="0.01" min="0" defaultValue={editingPet?.weight ?? ''} disabled={isMutating} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pet-dob">Date of Birth</Label>
                <Input id="pet-dob" name="date_of_birth" type="date" max={new Date().toISOString().split('T')[0]} defaultValue={editingPet?.date_of_birth || ''} disabled={isMutating} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isMutating}>
                Cancel
              </Button>
              <Button type="submit" disabled={isMutating}>
                {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingPet ? 'Save Changes' : 'Add Pet'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove {deleteTarget?.name}?</DialogTitle>
            <DialogDescription>
              This will remove {deleteTarget?.name} from your records. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleteMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
