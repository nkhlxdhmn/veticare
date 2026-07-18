import { useCallback, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, Menu, Settings, UserRound, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

const navLinks = [
  { name: "Animals", path: "/animals" },
  { name: "Prediction", path: "/predictions" },
  { name: "Pets", path: "/pets" },
  { name: "Vaccinations", path: "/vaccinations" },
  { name: "Care Guide", path: "/care-guide" },
  { name: "Nearby", path: "/nearby" },
  { name: "AI Assistant", path: "/ai-assistant" },
];

const isActivePath = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`);

function NavLink({ name, path, active }: { name: string; path: string; active: boolean }) {
  const reduced = useReducedMotion();

  return (
    <Link
      to={path}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative py-1 text-xs md:text-sm transition-colors duration-200",
        active
          ? "font-medium text-textPrimary"
          : "text-textSecondary hover:text-textPrimary",
      )}
    >
      {name}
      <span
        className={cn(
          "absolute -bottom-px left-0 h-[2px] bg-textPrimary transition-[transform,opacity] duration-200",
          reduced ? "hidden" : "",
          active ? "w-full" : "w-0 scale-x-0",
        )}
        style={reduced ? {} : { transformOrigin: "left" }}
      />
    </Link>
  );
}

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [prevPathname, setPrevPathname] = useState<string | null>(null);
  const location = useLocation();
  const { user, logout } = useAuth();
  const reduced = useReducedMotion();

  if (location.pathname !== prevPathname) {
    setPrevPathname(location.pathname);
    setIsMobileMenuOpen(false);
    setExiting(false);
  }

  const closeMobile = useCallback(() => {
    setExiting(true);
    setTimeout(() => {
      setIsMobileMenuOpen(false);
      setExiting(false);
    }, 200);
  }, []);

  const toggleMobile = useCallback(() => {
    if (isMobileMenuOpen) closeMobile();
    else { setExiting(false); setIsMobileMenuOpen(true); }
  }, [isMobileMenuOpen, closeMobile]);

  const signOut = () => {
    logout();
    closeMobile();
  };

  const showMenu = isMobileMenuOpen || exiting;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-borderLight bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 md:h-[72px] w-full max-w-[1280px] items-center justify-between px-4 md:px-6 lg:px-12 xl:px-24">
        <Link
          to="/"
          className={cn(
            "shrink-0 text-xl md:text-2xl font-serif font-medium tracking-widest text-textPrimary",
            reduced ? "" : "transition-transform duration-[180ms] ease-out hover:rotate-[3deg]",
          )}
          aria-label="VetiCare home"
        >
          VETICARE
        </Link>

        <nav
          aria-label="Primary navigation"
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-4 md:gap-5 lg:flex"
        >
          {navLinks.map((link) => {
            const active = isActivePath(location.pathname, link.path);
            return (
              <NavLink key={link.path} name={link.name} path={link.path} active={active} />
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 md:gap-3 lg:flex">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="hidden md:block text-xs md:text-sm font-medium text-textSecondary transition-colors duration-200 hover:text-textPrimary"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                aria-label="Open profile"
                className="grid h-8 md:h-9 w-8 md:w-9 place-items-center rounded-full bg-gray-100 text-xs md:text-sm font-medium transition-[transform,background-color] duration-[180ms] ease-out hover:bg-gray-200 active:scale-95"
              >
                {user.name.trim().slice(0, 1).toUpperCase() || "U"}
              </Link>
              <button
                onClick={signOut}
                className="hidden md:block text-xs md:text-sm text-textSecondary transition-colors duration-200 hover:text-textPrimary"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden md:block text-xs md:text-sm font-medium text-textSecondary transition-colors duration-200 hover:text-textPrimary"
              >
                Login
              </Link>
              <Link to="/register">
                <Button size="sm" className="rounded-full px-4 md:px-5">
                  Get started
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-textPrimary transition-colors duration-200 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary lg:hidden"
          onClick={toggleMobile}
          aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 top-16 md:top-[72px] z-40 bg-black/20 lg:hidden"
            style={{
              opacity: reduced ? 1 : (exiting ? 0 : 1),
              transition: reduced ? "none" : "opacity 200ms ease-out",
            }}
            onClick={closeMobile}
            aria-hidden="true"
          />
          <div
            id="mobile-navigation"
            className={cn(
              "fixed right-0 top-16 md:top-[72px] z-50 h-[calc(100vh-4rem)] md:h-[calc(100vh-72px)] w-72 overflow-y-auto border-l border-borderLight bg-white shadow-xl lg:hidden",
            )}
            style={reduced ? {} : {
              transform: exiting ? "translateX(100%)" : "translateX(0)",
              transition: "transform 200ms ease-out",
            }}
          >
            <nav aria-label="Mobile navigation" className="flex flex-col px-4 md:px-6 py-4">
              <Link
                to="/"
                className={cn(
                  "border-b border-borderLight py-3 text-base transition-colors duration-200",
                  location.pathname === "/"
                    ? "font-medium text-textPrimary"
                    : "text-textSecondary hover:text-textPrimary",
                )}
              >
                Home
              </Link>
              {navLinks.map((link) => {
                const active = isActivePath(location.pathname, link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "border-b border-borderLight py-3 text-base transition-colors duration-200",
                      active
                        ? "font-medium text-textPrimary"
                        : "text-textSecondary hover:text-textPrimary",
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
              <Link
                to="/about"
                className={cn(
                  "border-b border-borderLight py-3 text-base transition-colors duration-200",
                  location.pathname === "/about"
                    ? "font-medium text-textPrimary"
                    : "text-textSecondary hover:text-textPrimary",
                )}
              >
                About
              </Link>
              <div className="flex flex-col gap-3 pt-5">
                {user ? (
                  <>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 text-base text-textSecondary transition-colors duration-200 hover:text-textPrimary"
                    >
                      <UserRound className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 text-base text-textSecondary transition-colors duration-200 hover:text-textPrimary"
                    >
                      <UserRound className="h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-2 text-base text-textSecondary transition-colors duration-200 hover:text-textPrimary"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <button
                      onClick={signOut}
                      className="flex items-center gap-2 text-left text-base text-textSecondary transition-colors duration-200 hover:text-textPrimary"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="text-base text-textSecondary transition-colors duration-200 hover:text-textPrimary"
                    >
                      Login
                    </Link>
                    <Link to="/register">
                      <Button className="w-full">Get started</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
