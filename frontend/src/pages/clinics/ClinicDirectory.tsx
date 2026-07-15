import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { healthCentreService } from '@/services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, MapPin, Phone, Clock, Stethoscope } from 'lucide-react';

export default function ClinicDirectory() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: clinics, isLoading } = useQuery({
    queryKey: ['clinics'],
    queryFn: () => healthCentreService.getAll(),
  });

  const filteredClinics = clinics?.filter((clinic) => 
    clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clinic.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto">
      <div className="flex flex-col mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Veterinary Clinics & Hospitals</h2>
        <p className="text-muted-foreground mt-1">Find the best healthcare facilities for your pet.</p>
      </div>

      <div className="relative max-w-md mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search clinics or cities..." 
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[250px] w-full rounded-xl" />
          ))}
        </div>
      ) : filteredClinics && filteredClinics.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClinics.map((clinic) => (
            <Card key={clinic.id} className="flex flex-col cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all" onClick={() => navigate(`/clinics/${clinic.id}`)}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    {clinic.name}
                  </CardTitle>
                  {clinic.emergency_services && <Badge variant="destructive">24/7 Emergency</Badge>}
                </div>
                <CardDescription className="line-clamp-2">{clinic.description || 'Veterinary Health Centre'}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  {clinic.city}, {clinic.state}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="mr-2 h-4 w-4" />
                  {clinic.contact_number}
                </div>
                {clinic.timings && Object.keys(clinic.timings).length > 0 && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    {clinic.timings[Object.keys(clinic.timings)[0]]} (Today)
                  </div>
                )}
                
                {clinic.facilities && clinic.facilities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {clinic.facilities.slice(0, 3).map(facility => (
                      <Badge key={facility} variant="secondary" className="text-[10px]">
                        {facility}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
          <p className="text-muted-foreground">No health centres found matching your search.</p>
        </div>
      )}
    </div>
  );
}
