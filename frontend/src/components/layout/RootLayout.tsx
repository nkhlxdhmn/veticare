import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <Navbar />
      <main className="flex-1 w-full max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-12 xl:px-24 py-8 md:py-12 lg:py-24 animate-fade-in">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
