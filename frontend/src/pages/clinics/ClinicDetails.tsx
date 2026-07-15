import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { healthCentreService } from '@/services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Phone, Clock, Stethoscope, ArrowLeft, CalendarPlus } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function ClinicDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: clinic, isLoading, isError } = useQuery({
    queryKey: ['clinic', id],
    queryFn: () => healthCentreService.getById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex-1 p-4 md:p-8 pt-6 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-10 w-32 mb-4" />
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-[300px] md:col-span-2 rounded-xl" />
          <Skeleton className="h-[300px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !clinic) {
    return (
      <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold mb-2">Clinic Not Found</h2>
        <p className="text-muted-foreground mb-6">The health centre you are looking for does not exist or has been removed.</p>
        <Button onClick={() => navigate('/clinics')}>Return to Directory</Button>
      </div>
    );
  }

  const handleBookAppointment = () => {
    if (user?.role !== 'pet_owner') {
      toast({
        title: "Action Not Allowed",
        description: "Only Pet Owners can book appointments.",
        variant: "destructive"
      });
      return;
    }
    // Navigate to a dedicated booking flow passing the clinic ID
    navigate(`/appointments/new?clinic_id=${clinic.id}&clinic_name=${encodeURIComponent(clinic.name)}`);
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-5xl mx-auto">
      <Button variant="ghost" onClick={() => navigate('/clinics')} className="mb-2 -ml-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Directory
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{clinic.name}</h1>
            {clinic.emergency_services && <Badge variant="destructive">24/7 Emergency</Badge>}
            {clinic.is_active && <Badge variant="success">Active</Badge>}
          </div>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4" />
            {clinic.address}, {clinic.city}, {clinic.state}
          </div>
        </div>
        <Button size="lg" onClick={handleBookAppointment} className="w-full md:w-auto">
          <CalendarPlus className="mr-2 h-5 w-5" /> Book Appointment
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About this Clinic</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
                {clinic.description || 'No description provided for this facility.'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                Medical Facilities & Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              {clinic.facilities && clinic.facilities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {clinic.facilities.map((facility, idx) => (
                    <Badge key={idx} variant="secondary" className="px-3 py-1 text-sm">
                      {facility}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No specific facilities listed.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-muted-foreground">{clinic.contact_number}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-muted-foreground">{clinic.address}</p>
                  <p className="text-muted-foreground">{clinic.city}, {clinic.state}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Working Hours</CardTitle>
            </CardHeader>
            <CardContent>
              {clinic.timings && Object.keys(clinic.timings).length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {Object.entries(clinic.timings).map(([day, hours]) => (
                    <li key={day} className="flex justify-between items-center py-1 border-b last:border-0">
                      <span className="capitalize font-medium">{day}</span>
                      <span className="text-muted-foreground">{hours as string}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <p>Standard hours (9 AM - 5 PM). Please call to confirm.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
