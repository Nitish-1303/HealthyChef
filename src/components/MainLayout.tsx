import { useLocation } from "react-router-dom";
import Navigation from "./Navigation";
import { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const isLanding = pathname === "/";

  return (
    <div className="min-h-screen bg-health-bg flex">
      <Navigation />
      <main className={`flex-1 transition-all duration-300 ${isLanding ? "ml-0" : "ml-64 p-12 lg:p-20"}`}>
        {children}
      </main>
    </div>
  );
}
