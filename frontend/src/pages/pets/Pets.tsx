import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const MOCK_PETS = [
  { id: 1, name: 'Buddy', species: 'Dog', breed: 'Golden Retriever', age: 3, weight: '30kg', status: 'Healthy', vaccinationStatus: 'Up to Date' },
  { id: 2, name: 'Luna', species: 'Cat', breed: 'Siamese', age: 2, weight: '4kg', status: 'Needs Checkup', vaccinationStatus: 'Overdue' },
  { id: 3, name: 'Max', species: 'Dog', breed: 'German Shepherd', age: 5, weight: '35kg', status: 'Healthy', vaccinationStatus: 'Upcoming' },
];

export default function Pets() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 relative">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">My Pets</h2>
        <Button className="hidden md:flex">
          <Plus className="mr-2 h-4 w-4" /> Add Pet
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader className="gap-2">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MOCK_PETS.map((pet) => (
            <Card key={pet.id} className="flex flex-col relative overflow-hidden group border-zinc-200 hover:border-accent transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <Button variant="secondary" size="icon" className="h-8 w-8">
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" className="h-8 w-8">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl">
                    {pet.species === 'Dog' ? '🐶' : '🐱'}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{pet.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{pet.breed}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Age</p>
                  <p className="font-medium">{pet.age} Years</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Weight</p>
                  <p className="font-medium">{pet.weight}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Health Status</p>
                  <Badge variant={pet.status === 'Healthy' ? 'success' : 'warning'}>
                    {pet.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Vaccinations</p>
                  <Badge variant={
                    pet.vaccinationStatus === 'Up to Date' ? 'success' : 
                    pet.vaccinationStatus === 'Overdue' ? 'destructive' : 'secondary'
                  }>
                    {pet.vaccinationStatus}
                  </Badge>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 p-4 mt-auto">
                <Button variant="outline" className="w-full">View Medical Records</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Floating Action Button for Mobile */}
      <Button className="md:hidden fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg" size="icon">
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
