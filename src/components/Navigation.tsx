import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, FilePlus, Receipt, ArrowLeft } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import HealthyChefLogo from "./HealthyChefLogo";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Navigation() {
  const { pathname } = useLocation();
  const isLanding = pathname === "/";

  if (isLanding) return null;

  const links = [
    { to: "/dashboard", label: "Analytics", icon: LayoutDashboard },
    { to: "/inventory", label: "Ingredient Registry", icon: Package },
    { to: "/invoices/new", label: "Draft Protocol", icon: FilePlus },
  ];

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-health-cream border-r border-health-muted/10 py-12 px-8 flex flex-col z-50 shadow-xl shadow-health-ink/5">
      <HealthyChefLogo size={40} className="mb-20" />
      
      <div className="flex flex-col gap-3">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              "flex items-center gap-4 py-4 px-5 rounded-2xl font-medium text-sm transition-all duration-300",
              isActive 
                ? "bg-health-olive text-white shadow-md shadow-health-olive/20" 
                : "text-health-muted hover:bg-health-bg hover:text-health-leaf"
            )}
          >
            <Icon size={18} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>

      <div className="mt-auto space-y-6">
        <NavLink 
          to="/" 
          className="flex items-center gap-4 py-3 px-5 font-medium text-sm text-health-muted hover:text-health-leaf transition-all group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Return Home
        </NavLink>
        
        <div className="health-card p-6 bg-health-olive/5 border-none">
          <p className="health-label mb-2 text-health-olive">Kitchen Monitor</p>
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-health-sage animate-pulse" />
             <p className="health-value text-sm font-semibold text-health-leaf">Organic Source Active</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
