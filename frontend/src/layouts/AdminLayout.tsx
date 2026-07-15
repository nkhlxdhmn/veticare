import { Outlet } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-zinc-950 text-zinc-50 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b border-zinc-800 px-4 lg:h-[60px] lg:px-6">
            <a href="/" className="flex items-center gap-2 font-semibold text-xl">
              <span className="text-accent">Veti</span>Care Admin
            </a>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4 mt-4">
              <a href="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2 text-zinc-400 transition-all hover:text-zinc-50">
                Overview
              </a>
              <a href="/admin/users" className="flex items-center gap-3 rounded-lg px-3 py-2 text-zinc-400 transition-all hover:text-zinc-50">
                User Management
              </a>
              <a href="/admin/roles" className="flex items-center gap-3 rounded-lg px-3 py-2 text-zinc-400 transition-all hover:text-zinc-50">
                Roles
              </a>
              <a href="/admin/metrics" className="flex items-center gap-3 rounded-lg px-3 py-2 text-zinc-400 transition-all hover:text-zinc-50">
                System Health
              </a>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 justify-between">
          <div className="font-semibold text-lg hidden md:block">Admin Console</div>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium">{user?.name || 'Administrator'}</div>
            <button onClick={logout} className="text-sm text-destructive hover:underline">Logout</button>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-zinc-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
