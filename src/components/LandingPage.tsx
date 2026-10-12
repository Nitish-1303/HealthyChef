import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, FileText, Package, BadgeCheck } from "lucide-react";
import HealthyChefLogo from "./HealthyChefLogo";

const sampleInvoices = [
  { id: "INV-2026-0004", client: "Aarav Mehta", due: "27 Oct", status: "paid", amount: "₹1,770" },
  { id: "INV-2026-0003", client: "Sana Iyer", due: "25 Oct", status: "pending", amount: "₹2,655" },
  { id: "INV-2026-0002", client: "Rohan Kapoor", due: "07 Oct", status: "overdue", amount: "₹4,248" },
  { id: "INV-2026-0001", client: "Meera Nair", due: "27 Sep", status: "paid", amount: "₹8,085" },
];

const statusClass: Record<string, string> = {
  paid: "bg-lime",
  pending: "bg-citrus",
  overdue: "bg-health-olive text-white",
};

const features = [
  {
    icon: FileText,
    title: "Invoices in a minute",
    text: "Pick a client, add dishes from your pantry, and GST and discounts are worked out for you. Numbers run in order, generated on the server.",
    color: "bg-citrus",
  },
  {
    icon: BadgeCheck,
    title: "Know who has paid",
    text: "Mark invoices paid, and anything unpaid past its due date turns overdue by itself. Revenue only counts what was actually collected.",
    color: "bg-lime",
  },
  {
    icon: Package,
    title: "A pantry that prices for you",
    text: "Keep ingredients and dishes with base prices and GST rates once, then reuse them on every invoice.",
    color: "bg-white",
  },
];

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      <section className="mx-auto max-w-7xl px-6 pb-16 pt-10 text-center lg:px-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-6xl leading-[0.98] tracking-[-0.04em] md:text-8xl">
            Feed people.
            <br />
            <span className="text-health-olive">Get paid.</span>
          </h1>
          <p className="mx-auto mb-8 mt-6 max-w-xl text-lg leading-relaxed text-health-muted md:text-xl">
            Invoices, pantry and payment tracking for meal-prep and nutrition businesses. Friendly, fast and GST-ready.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/dashboard" className="btn-health bg-health-sage px-7 py-4 text-base">
              Open dashboard <ArrowRight size={18} className="ml-2 inline" />
            </Link>
            <Link to="/invoices/new" className="btn-health bg-white px-7 py-4 text-base text-health-ink">
              Create an invoice
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-14 grid gap-6 text-left lg:grid-cols-[1fr_1.6fr_1fr]"
        >
          <div className="health-card flex flex-col justify-between bg-health-olive p-6 text-white">
            <p className="health-label !text-white/80">Collected</p>
            <p className="font-display text-5xl font-extrabold">₹9,855</p>
          </div>

          <div className="health-card overflow-x-auto p-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  {["Invoice", "Client", "Due", "Status", "Amount"].map((h) => (
                    <th key={h} className="health-label px-3 py-2 !text-[11px]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sampleInvoices.map((inv) => (
                  <tr key={inv.id} className="border-t-2 border-dashed border-health-ink/15">
                    <td className="whitespace-nowrap px-3 py-3 font-bold">{inv.id}</td>
                    <td className="px-3 py-3">{inv.client}</td>
                    <td className="px-3 py-3">{inv.due}</td>
                    <td className="px-3 py-3">
                      <span className={`status-pill ${statusClass[inv.status]}`}>{inv.status}</span>
                    </td>
                    <td className="px-3 py-3 font-bold">{inv.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="px-3 pb-1 pt-2 text-xs text-health-muted">Sample data</p>
          </div>

          <div className="health-card flex flex-col justify-between bg-lime p-6">
            <div>
              <p className="health-label !text-health-ink">Awaiting</p>
              <p className="font-display text-4xl font-extrabold">₹2,655</p>
            </div>
            <div className="mt-6">
              <p className="health-label !text-health-ink">Overdue</p>
              <p className="font-display text-4xl font-extrabold">₹4,248</p>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 lg:px-12">
        <h2 className="mb-10 text-center text-4xl md:text-5xl">Everything a small kitchen needs</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map(({ icon: Icon, title, text, color }) => (
            <div key={title} className={`health-card p-8 ${color}`}>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border-2 border-health-ink bg-white">
                <Icon size={22} />
              </div>
              <h3 className="mb-2 text-2xl">{title}</h3>
              <p className="leading-relaxed text-health-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-12">
        <div className="health-card bg-health-ink p-10 text-center text-white md:p-16">
          <h2 className="!text-health-bg text-4xl md:text-5xl">Send your next invoice from here.</h2>
          <p className="mx-auto mb-8 mt-4 max-w-md text-white/70">Add a few pantry items, create the invoice, email it to your client.</p>
          <Link to="/invoices/new" className="btn-health px-7 py-4 text-base">
            New invoice
          </Link>
        </div>
      </section>

      <footer className="border-t-2 border-health-ink">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-health-muted md:flex-row lg:px-12">
          <HealthyChefLogo size={26} />
          <p>Built by Yeluru Nitish</p>
        </div>
      </footer>
    </div>
  );
}
