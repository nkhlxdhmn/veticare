import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Calendar, Clock, MapPin, Loader2, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { petService, appointmentService } from '@/services';
import { toast } from '@/hooks/use-toast';
import type { AppointmentCreatePayload, Appointment, AppointmentStatus } from '@/types';

function formatTime(timeString: string): string {
  if (!timeString) return '';
  // Convert "HH:MM:SS" to "HH:MM AM/PM"
  const [hours, minutes] = timeString.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

export default function Appointments() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Appointment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Appointment | null>(null);

  const { data: pets, isLoading: petsLoading } = useQuery({
    queryKey: ['pets'],
    queryFn: () => petService.getAll(),
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => appointmentService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: AppointmentCreatePayload) => appointmentService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setDialogOpen(false);
      toast({ title: 'Appointment scheduled', variant: 'success' });
    },
    onError: () => toast({ title: 'Failed to schedule appointment', variant: 'destructive' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AppointmentCreatePayload> & { status?: AppointmentStatus } }) => 
      appointmentService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setDialogOpen(false);
      setEditingRecord(null);
      toast({ title: 'Appointment updated', variant: 'success' });
    },
    onError: () => toast({ title: 'Failed to update appointment', variant: 'destructive' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => appointmentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setDeleteTarget(null);
      toast({ title: 'Appointment cancelled', variant: 'success' });
    },
    onError: () => toast({ title: 'Failed to cancel appointment', variant: 'destructive' }),
  });

  const filteredAppointments = appointments?.filter(apt => {
    return apt.reason.toLowerCase().includes(searchTerm.toLowerCase()) || 
           (apt.clinic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
           (apt.veterinarian_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
  });

  // Separate upcoming and past
  const upcoming = filteredAppointments?.filter(a => a.status === 'scheduled' || a.status === 'confirmed') || [];
  const past = filteredAppointments?.filter(a => a.status === 'completed' || a.status === 'cancelled') || [];

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      pet_id: fd.get('pet_id') as string,
      appointment_date: fd.get('appointment_date') as string,
      appointment_time: fd.get('appointment_time') as string,
      reason: fd.get('reason') as string,
      veterinarian_name: (fd.get('veterinarian_name') as string) || undefined,
      clinic_name: (fd.get('clinic_name') as string) || undefined,
      notes: (fd.get('notes') as string) || undefined,
    };

    if (editingRecord) {
      updateMutation.mutate({ 
        id: editingRecord.id, 
        payload: {
          ...payload,
          status: fd.get('status') as AppointmentStatus
        }
      });
    } else {
      createMutation.mutate(payload as AppointmentCreatePayload);
    }
  };

  const openCreateDialog = () => {
    setEditingRecord(null);
    setDialogOpen(true);
  };

  const openEditDialog = (record: Appointment) => {
    setEditingRecord(record);
    setDialogOpen(true);
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  const AppointmentCard = ({ apt }: { apt: Appointment }) => {
    const isPast = apt.status === 'completed' || apt.status === 'cancelled';
    
    return (
      <Card className={`relative group ${isPast ? 'opacity-80 bg-muted/30' : ''}`}>
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          <Button variant="secondary" size="icon" className="h-8 w-8" onClick={() => openEditDialog(apt)}>
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => setDeleteTarget(apt)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-sm text-foreground">{apt.pet_name || 'Unknown Pet'}</span>
            <Badge variant={
              apt.status === 'confirmed' ? 'success' : 
              apt.status === 'cancelled' ? 'destructive' : 
              apt.status === 'completed' ? 'secondary' : 'default'
            } className="capitalize">
              {apt.status}
            </Badge>
          </div>
          <CardTitle className="text-xl">{apt.reason}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="font-medium text-foreground">{new Date(apt.appointment_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="font-medium text-foreground">{formatTime(apt.appointment_time)}</span>
            </div>
            {(apt.clinic_name || apt.veterinarian_name) && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  {apt.clinic_name}
                  {apt.clinic_name && apt.veterinarian_name && ' · '}
                  {apt.veterinarian_name && `Dr. ${apt.veterinarian_name}`}
                </span>
              </div>
            )}
          </div>
          {apt.notes && (
            <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
              {apt.notes}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
        <Button onClick={openCreateDialog} disabled={!pets || pets.length === 0}>
          <Plus className="mr-2 h-4 w-4" /> Schedule Appointment
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search appointments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {appointmentsLoading || petsLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full" />)}
          </div>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Upcoming</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcoming.map(apt => <AppointmentCard key={apt.id} apt={apt} />)}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div className="space-y-4 pt-6 mt-6 border-t">
              <h3 className="text-lg font-semibold text-muted-foreground">Past & Cancelled</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {past.map(apt => <AppointmentCard key={apt.id} apt={apt} />)}
              </div>
            </div>
          )}

          {upcoming.length === 0 && past.length === 0 && (
            <Card className="p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-semibold mb-1">No appointments found</h3>
              <p className="text-sm text-muted-foreground mb-4">Schedule your pet's next checkup or visit.</p>
              <Button onClick={openCreateDialog} disabled={!pets || pets.length === 0}>
                <Plus className="mr-2 h-4 w-4" /> Schedule Appointment
              </Button>
            </Card>
          )}
        </>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) setEditingRecord(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRecord ? 'Edit Appointment' : 'Schedule Appointment'}</DialogTitle>
            <DialogDescription>Set up a visit to the veterinarian.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pet_id">Pet *</Label>
              <Select id="pet_id" name="pet_id" required defaultValue={editingRecord?.pet_id || ''} disabled={isMutating || !!editingRecord}>
                <option value="" disabled>Select a pet...</option>
                {pets?.map(pet => <option key={pet.id} value={pet.id}>{pet.name}</option>)}
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appointment_date">Date *</Label>
                <Input id="appointment_date" name="appointment_date" type="date" required defaultValue={editingRecord?.appointment_date || ''} disabled={isMutating} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointment_time">Time *</Label>
                <Input id="appointment_time" name="appointment_time" type="time" required defaultValue={editingRecord?.appointment_time || ''} disabled={isMutating} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Visit *</Label>
              <Input id="reason" name="reason" required placeholder="e.g., Annual Checkup, Vaccination" defaultValue={editingRecord?.reason || ''} disabled={isMutating} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clinic_name">Clinic Name</Label>
                <Input id="clinic_name" name="clinic_name" defaultValue={editingRecord?.clinic_name || ''} disabled={isMutating} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="veterinarian_name">Veterinarian</Label>
                <Input id="veterinarian_name" name="veterinarian_name" placeholder="Name without 'Dr.'" defaultValue={editingRecord?.veterinarian_name || ''} disabled={isMutating} />
              </div>
            </div>

            {editingRecord && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select id="status" name="status" defaultValue={editingRecord.status} disabled={isMutating}>
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" placeholder="Any special instructions..." defaultValue={editingRecord?.notes || ''} disabled={isMutating} className="h-20" />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={isMutating}>Cancel</Button>
              <Button type="submit" disabled={isMutating}>
                {isMutating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {editingRecord ? 'Save Changes' : 'Schedule'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel Appointment?</DialogTitle>
            <DialogDescription>Are you sure you want to delete this appointment? This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleteMutation.isPending}>Keep Appointment</Button>
            <Button variant="destructive" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
