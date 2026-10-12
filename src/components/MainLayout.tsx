import { useLocation } from "react-router-dom";
import Navigation from "./Navigation";
import { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const isLanding = pathname === "/";

  return (
    <div className="min-h-screen bg-health-bg">
      <Navigation />
      <main className={isLanding ? "" : "mx-auto max-w-7xl px-6 pb-20 pt-8 lg:px-12"}>{children}</main>
    </div>
  );
}
