import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { notificationService } from '@/services';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function Notifications() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getAll(),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => toast({ title: 'Failed to mark as read', variant: 'destructive' })
  });

  const markAllRead = async () => {
    if (!notifications) return;
    const unread = notifications.filter(n => !n.is_read);
    for (const n of unread) {
      await markReadMutation.mutateAsync(n.id);
    }
    toast({ title: 'All marked as read' });
  };

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
          <p className="text-muted-foreground mt-1">Stay updated on your pets' health and appointments.</p>
        </div>
        <Button variant="outline" onClick={markAllRead} disabled={unreadCount === 0 || markReadMutation.isPending}>
          <Check className="mr-2 h-4 w-4" /> Mark all as read
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <CardTitle className="flex items-center gap-2">
            Inbox
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-accent text-white hover:bg-accent/90">
                {unreadCount} new
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            You have {unreadCount} unread messages.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-4 text-accent" />
              <p>Loading notifications...</p>
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={cn(
                    "flex items-start gap-4 p-4 transition-colors",
                    !notification.is_read ? "bg-accent/5" : "bg-background",
                    "hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "mt-1 p-2 rounded-full",
                    !notification.is_read ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                  )}>
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className={cn("text-sm font-semibold truncate", !notification.is_read ? "text-foreground" : "text-muted-foreground")}>
                        {notification.title}
                      </p>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={cn("text-sm", !notification.is_read ? "text-foreground/90 font-medium" : "text-muted-foreground")}>
                      {notification.message}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => markReadMutation.mutate(notification.id)}
                      className="shrink-0 h-8 w-8 rounded-full"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="bg-muted p-4 rounded-full mb-4">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg">No notifications yet</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                When you have upcoming appointments, vaccinations, or important alerts, they will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
