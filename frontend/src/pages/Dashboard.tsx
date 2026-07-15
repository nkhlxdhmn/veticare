import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Bell, Calendar, PawPrint, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { petService, vaccinationService, predictionService, notificationService } from '@/services';
import { useAuth } from '@/store/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const { data: pets, isLoading: petsLoading } = useQuery({
    queryKey: ['pets'],
    queryFn: () => petService.getAll(),
  });

  const { data: upcomingVaccinations, isLoading: vaccLoading } = useQuery({
    queryKey: ['vaccinations', 'upcoming'],
    queryFn: () => vaccinationService.getUpcoming(),
  });

  const { data: predictionHistory, isLoading: predLoading } = useQuery({
    queryKey: ['predictions', 'history'],
    queryFn: () => predictionService.getHistory(),
  });

  const { data: unreadCount, isLoading: notifLoading } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationService.getUnreadCount(),
  });

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const displayName = user?.first_name || user?.username || 'there';

  const metrics = [
    {
      label: 'Total Pets',
      value: pets?.length ?? 0,
      icon: PawPrint,
      description: pets?.length === 0 ? 'Add your first pet' : `${pets?.filter(p => p.is_active).length} active`,
      to: '/pets',
      loading: petsLoading,
    },
    {
      label: 'Upcoming Vaccinations',
      value: upcomingVaccinations?.length ?? 0,
      icon: Calendar,
      description: upcomingVaccinations?.length === 0 ? 'All up to date' : 'Due in the next 30 days',
      to: '/vaccinations',
      loading: vaccLoading,
    },
    {
      label: 'Predictions Run',
      value: predictionHistory?.length ?? 0,
      icon: Activity,
      description: predictionHistory?.length === 0 ? 'Run your first prediction' : 'Total AI analyses',
      to: '/predictions',
      loading: predLoading,
    },
    {
      label: 'Unread Notifications',
      value: unreadCount ?? 0,
      icon: Bell,
      description: (unreadCount ?? 0) === 0 ? 'All caught up' : 'Require your attention',
      to: '/notifications',
      loading: notifLoading,
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {greeting}, {displayName}
          </h2>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your pets today.
          </p>
        </div>
        <Button asChild>
          <Link to="/predictions">
            <Activity className="mr-2 h-4 w-4" /> Run AI Prediction
          </Link>
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Link key={metric.label} to={metric.to} className="group">
            <Card className="transition-colors border-zinc-200 group-hover:border-accent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {metric.loading ? (
                  <>
                    <Skeleton className="h-8 w-16 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <p className="text-xs text-muted-foreground">{metric.description}</p>
                  </>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Pets */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Pets</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/pets" className="gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {petsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : pets && pets.length > 0 ? (
              <div className="space-y-3">
                {pets.slice(0, 5).map((pet) => (
                  <Link
                    key={pet.id}
                    to={`/pets/${pet.id}`}
                    className="flex items-center gap-3 rounded-lg p-2 -mx-2 hover:bg-muted transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-lg">
                      {pet.species === 'Dog' ? '🐶' : pet.species === 'Cat' ? '🐱' : '🐾'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{pet.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {pet.species}{pet.breed ? ` · ${pet.breed}` : ''}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <PawPrint className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground mb-3">No pets added yet</p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/pets">Add your first pet</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Predictions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Predictions</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/predictions" className="gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {predLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : predictionHistory && predictionHistory.length > 0 ? (
              <div className="space-y-3">
                {predictionHistory.slice(0, 5).map((pred) => (
                  <div
                    key={pred.id}
                    className="flex items-center gap-3 rounded-lg p-2 -mx-2"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10">
                      <Activity className="h-4 w-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{pred.predicted_disease}</p>
                      <p className="text-xs text-muted-foreground">
                        {pred.pet_name} · {Math.round(pred.confidence * 100)}% confidence
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground mb-3">No predictions yet</p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/predictions">Run your first analysis</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
