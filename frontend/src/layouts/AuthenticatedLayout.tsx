import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';
import {
  LayoutDashboard,
  PawPrint,
  Stethoscope,
  Syringe,
  Brain,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Calendar,
  HeartHandshake,
  Building,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/pets', label: 'My Pets', icon: PawPrint },
  { to: '/medical-records', label: 'Medical Records', icon: Stethoscope },
  { to: '/vaccinations', label: 'Vaccinations', icon: Syringe },
  { to: '/predictions', label: 'AI Predictions', icon: Brain },
  { to: '/appointments', label: 'Appointments', icon: Calendar },
  { to: '/clinics', label: 'Health Centres', icon: Building },
  { to: '/ngos', label: 'NGOs & Rescues', icon: HeartHandshake },
];

const BOTTOM_ITEMS = [
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function AuthenticatedLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: notificationService.getUnreadCount,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const displayName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.username || 'User';

  const initials = user?.first_name && user?.last_name
    ? `${user.first_name[0]}${user.last_name[0]}`
    : user?.username?.slice(0, 2)?.toUpperCase() || 'U';

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const NavLink = ({ to, label, icon: Icon, badge }: { to: string; label: string; icon: React.ElementType; badge?: number }) => (
    <Link
      to={to}
      onClick={() => setMobileMenuOpen(false)}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
        isActive(to)
          ? 'bg-accent/10 text-accent'
          : 'text-muted-foreground hover:text-primary hover:bg-muted'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white px-1.5">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );

  const sidebarContent = (
    <>
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-xl">
          <span className="text-accent">Veti</span>Care
        </Link>
      </div>
      <div className="flex-1 flex flex-col justify-between py-4">
        <nav className="grid items-start gap-1 px-2 lg:px-4">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} {...item} />
          ))}
        </nav>
        <nav className="grid items-start gap-1 px-2 lg:px-4 border-t pt-4 mt-4">
          {BOTTOM_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              {...item}
              badge={item.to === '/notifications' ? unreadCount : undefined}
            />
          ))}
          <button
            onClick={logout}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </nav>
      </div>
    </>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr]">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/40 md:flex md:flex-col">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative z-10 h-full w-72 bg-background flex flex-col shadow-xl">
            <div className="flex items-center justify-between px-4 h-14 border-b">
              <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-xl">
                <span className="text-accent">Veti</span>Care
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-md hover:bg-muted">
                <X className="h-5 w-5" />
                <span className="sr-only">Close menu</span>
              </button>
            </div>
            <div className="flex-1 flex flex-col justify-between py-4 overflow-y-auto">
              <nav className="grid items-start gap-1 px-2">
                {NAV_ITEMS.map((item) => (
                  <NavLink key={item.to} {...item} />
                ))}
              </nav>
              <nav className="grid items-start gap-1 px-2 border-t pt-4 mt-4">
                {BOTTOM_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    {...item}
                    badge={item.to === '/notifications' ? unreadCount : undefined}
                  />
                ))}
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  Sign out
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-1.5 rounded-md hover:bg-muted"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <Link
            to="/notifications"
            className="relative p-1.5 rounded-md hover:bg-muted transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            {unreadCount !== undefined && unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          <Link to="/profile" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent text-xs font-bold">
              {initials}
            </div>
            <span className="text-sm font-medium hidden sm:inline">{displayName}</span>
          </Link>
        </header>
        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
