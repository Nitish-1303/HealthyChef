import { Link, NavLink } from "react-router-dom";
import HealthyChefLogo from "./HealthyChefLogo";

const REPO_URL = "https://github.com/Nitish-1303/HealthyChef";

const tabs = [
  { to: "/", label: "Overview", end: true },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/inventory", label: "Pantry" },
  { to: "/invoices/new", label: "Invoices" },
];

export default function Navigation() {
  return (
    <header className="sticky top-0 z-50 bg-health-bg/90 backdrop-blur">
      <nav className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-4 px-6 py-5 lg:grid-cols-[1fr_auto_1fr] lg:px-12">
        <Link to="/" aria-label="HealthyChef home">
          <HealthyChefLogo />
        </Link>

        <div className="order-3 col-span-2 flex justify-center overflow-x-auto lg:order-none lg:col-span-1">
          <div className="flex gap-0.5 rounded-xl border-2 border-health-ink bg-white p-1">
            {tabs.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
                    isActive ? "bg-citrus text-health-ink" : "text-health-muted hover:text-health-ink"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-bold text-health-muted transition-colors hover:text-health-ink"
            >
              Source ↗
            </a>
          </div>
        </div>

        <div className="justify-self-end">
          <Link to="/invoices/new" className="btn-health">
            New invoice
          </Link>
        </div>
      </nav>
    </header>
  );
}
