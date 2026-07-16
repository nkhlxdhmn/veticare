import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, Menu, Settings, UserRound, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { name: "Animals", path: "/animals" },
  { name: "Prediction", path: "/predictions" },
  { name: "Pets", path: "/pets" },
  { name: "Vaccinations", path: "/vaccinations" },
  { name: "Care Guide", path: "/care-guide" },
  { name: "Nearby", path: "/nearby" },
];

const isActivePath = (pathname: string, path: string) => pathname === path || pathname.startsWith(`${path}/`);

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => setIsMobileMenuOpen(false), [location.pathname]);

  const signOut = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-borderLight bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 md:h-[72px] w-full max-w-[1280px] items-center justify-between px-4 md:px-6 lg:px-12 xl:px-24">
        <Link to="/" className="shrink-0 text-xl md:text-2xl font-serif font-medium tracking-widest text-textPrimary" aria-label="VetiCare home">VETICARE</Link>

        <nav aria-label="Primary navigation" className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-4 md:gap-5 lg:flex">
          {navLinks.map((link) => {
            const active = isActivePath(location.pathname, link.path);
            return <Link key={link.path} to={link.path} aria-current={active ? "page" : undefined} className={cn("border-b border-transparent py-1 text-xs md:text-sm transition-colors hover:text-textPrimary", active ? "border-textPrimary font-medium text-textPrimary" : "text-textSecondary")}>{link.name}</Link>;
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 md:gap-3 lg:flex">
          {user ? <>
            <Link to="/dashboard" className="hidden md:block text-xs md:text-sm font-medium text-textSecondary transition-colors hover:text-textPrimary">Dashboard</Link>
            <Link to="/profile" aria-label="Open profile" className="grid h-8 md:h-9 w-8 md:w-9 place-items-center rounded-full bg-gray-100 text-xs md:text-sm font-medium transition-colors hover:bg-gray-200">{user.name.trim().slice(0, 1).toUpperCase() || "U"}</Link>
            <button onClick={signOut} className="hidden md:block text-xs md:text-sm text-textSecondary transition-colors hover:text-textPrimary">Logout</button>
          </> : <>
            <Link to="/login" className="hidden md:block text-xs md:text-sm font-medium text-textSecondary transition-colors hover:text-textPrimary">Login</Link>
            <Link to="/register"><Button size="sm" className="rounded-full px-4 md:px-5">Get started</Button></Link>
          </>}
        </div>

        <button type="button" className="rounded-md p-2 text-textPrimary transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary lg:hidden" onClick={() => setIsMobileMenuOpen((open) => !open)} aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={isMobileMenuOpen} aria-controls="mobile-navigation">
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div id="mobile-navigation" className={cn("absolute left-0 top-16 md:top-[72px] w-full overflow-y-auto border-b border-borderLight bg-white transition-[max-height,opacity] duration-200 lg:hidden", isMobileMenuOpen ? "max-h-[calc(100vh-4rem)] md:max-h-[calc(100vh-72px)] opacity-100" : "max-h-0 opacity-0")}>
        <nav aria-label="Mobile navigation" className="flex flex-col px-4 md:px-6 py-4">
          <Link to="/" className={cn("border-b border-borderLight py-3 text-base", location.pathname === "/" ? "font-medium text-textPrimary" : "text-textSecondary")}>Home</Link>
          {navLinks.map((link) => { const active = isActivePath(location.pathname, link.path); return <Link key={link.path} to={link.path} aria-current={active ? "page" : undefined} className={cn("border-b border-borderLight py-3 text-base", active ? "font-medium text-textPrimary" : "text-textSecondary")}>{link.name}</Link>; })}
          <Link to="/about" className={cn("border-b border-borderLight py-3 text-base", location.pathname === "/about" ? "font-medium text-textPrimary" : "text-textSecondary")}>About</Link>
          <div className="flex flex-col gap-3 pt-5">
            {user ? <><Link to="/dashboard" className="flex items-center gap-2 text-base text-textSecondary"><UserRound className="h-4 w-4" />Dashboard</Link><Link to="/profile" className="flex items-center gap-2 text-base text-textSecondary"><UserRound className="h-4 w-4" />Profile</Link><Link to="/settings" className="flex items-center gap-2 text-base text-textSecondary"><Settings className="h-4 w-4" />Settings</Link><button onClick={signOut} className="flex items-center gap-2 text-left text-base text-textSecondary"><LogOut className="h-4 w-4" />Logout</button></> : <><Link to="/login" className="text-base text-textSecondary">Login</Link><Link to="/register"><Button className="w-full">Get started</Button></Link></>}
          </div>
        </nav>
      </div>
    </header>
  );
}
