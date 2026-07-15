import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { ngoService } from '@/services';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Phone, ArrowLeft, ShieldAlert, HeartHandshake } from 'lucide-react';

export default function NGODetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: ngo, isLoading, isError } = useQuery({
    queryKey: ['ngo', id],
    queryFn: () => ngoService.getById(id!),
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

  if (isError || !ngo) {
    return (
      <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold mb-2">NGO Not Found</h2>
        <p className="text-muted-foreground mb-6">The organization you are looking for does not exist or has been removed.</p>
        <Button onClick={() => navigate('/ngos')}>Return to Directory</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-5xl mx-auto">
      <Button variant="ghost" onClick={() => navigate('/ngos')} className="mb-2 -ml-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Directory
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">{ngo.name}</h1>
            {ngo.is_active && <Badge variant="success">Active Partner</Badge>}
          </div>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4" />
            {ngo.address}, {ngo.city}, {ngo.state}
          </div>
        </div>
        <Button size="lg" variant="destructive" onClick={() => navigate('/rescue-request')} className="w-full md:w-auto">
          <ShieldAlert className="mr-2 h-5 w-5" /> Report Emergency
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About this Organization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
                {ngo.description || 'No detailed description provided for this organization.'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HeartHandshake className="h-5 w-5 text-primary" />
                Services Provided
              </CardTitle>
            </CardHeader>
            <CardContent>
              {ngo.services && ngo.services.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {ngo.services.map((service, idx) => (
                    <Badge key={idx} variant="secondary" className="px-3 py-1 text-sm">
                      {service}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No specific services listed.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="border-destructive/20 bg-destructive/5 shadow-none">
            <CardHeader>
              <CardTitle className="text-destructive">Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 text-lg font-bold">
                <Phone className="h-6 w-6 text-destructive" />
                {ngo.emergency_contact}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Please call only in case of genuine animal emergencies.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm">{ngo.address}</p>
                  <p className="text-sm">{ngo.city}, {ngo.state}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
