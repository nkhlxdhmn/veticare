import { Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-primary">
            <span className="text-accent">Veti</span>Care
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium">
            <a href="/" className="transition-colors hover:text-foreground/80 text-foreground/60">Home</a>
            <a href="/about" className="transition-colors hover:text-foreground/80 text-foreground/60">About</a>
            <a href="/contact" className="transition-colors hover:text-foreground/80 text-foreground/60">Contact</a>
          </nav>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-sm font-medium hover:underline">Login</a>
            <a href="/register" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">Sign Up</a>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex h-16 items-center justify-between text-sm text-muted-foreground">
          <p>© 2026 VetiCare. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
