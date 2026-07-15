import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ngoService } from '@/services';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, MapPin, Phone, ShieldAlert } from 'lucide-react';

export default function NGODirectory() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: ngos, isLoading } = useQuery({
    queryKey: ['ngos'],
    queryFn: () => ngoService.getAll(),
  });

  const filteredNgos = ngos?.filter((ngo) => 
    ngo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ngo.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">NGO & Animal Rescue Directory</h2>
          <p className="text-muted-foreground mt-1">Find and connect with animal welfare organizations near you.</p>
        </div>
        <Button onClick={() => navigate('/rescue-request')} variant="destructive" className="gap-2">
          <ShieldAlert className="h-4 w-4" /> Report Rescue Emergency
        </Button>
      </div>

      <div className="relative max-w-md mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by name or city..." 
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
      ) : filteredNgos && filteredNgos.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredNgos.map((ngo) => (
            <Card key={ngo.id} className="flex flex-col cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all" onClick={() => navigate(`/ngos/${ngo.id}`)}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{ngo.name}</CardTitle>
                  {ngo.is_active && <Badge variant="success">Active</Badge>}
                </div>
                <CardDescription className="line-clamp-2">{ngo.description || 'Animal Welfare Organization'}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  {ngo.city}, {ngo.state}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="mr-2 h-4 w-4" />
                  {ngo.emergency_contact}
                </div>
                
                {ngo.services && ngo.services.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {ngo.services.slice(0, 3).map(service => (
                      <Badge key={service} variant="secondary" className="text-[10px]">
                        {service}
                      </Badge>
                    ))}
                    {ngo.services.length > 3 && (
                      <Badge variant="outline" className="text-[10px]">+{ngo.services.length - 3}</Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
          <p className="text-muted-foreground">No NGOs found matching your search.</p>
        </div>
      )}
    </div>
  );
}
