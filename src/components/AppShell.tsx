import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Baby,
  Boxes,
  CalendarCheck,
  ChartNoAxesColumn,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  School,
  Users,
} from "lucide-react";
import { useDaycare } from "@/lib/daycare-store";
import { todayISO } from "@/lib/daycare-seed";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck, exact: false },
  { to: "/children", label: "Children", icon: Baby, exact: false },
  { to: "/reports", label: "Daily reports", icon: ClipboardList, exact: false },
  { to: "/classrooms", label: "Classrooms", icon: School, exact: false },
  { to: "/staff", label: "Staff", icon: Users, exact: false },
  { to: "/payments", label: "Payments", icon: CreditCard, exact: false },
  { to: "/inventory", label: "Inventory", icon: Boxes, exact: false },
  { to: "/statistics", label: "Statistics", icon: ChartNoAxesColumn, exact: false },
] as const;

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { state } = useDaycare();
  const day = todayISO();
  const present = state.attendance.filter((a) => a.date === day && a.status === "present").length;

  return (
    <div className="flex min-h-screen gap-4 lg:p-4">
      <aside className="sticky top-4 hidden h-[calc(100vh-2rem)] w-60 shrink-0 flex-col rounded-3xl bg-brand-gradient px-4 py-6 text-sidebar-foreground shadow-soft lg:flex">
        <Link to="/" className="mb-8 flex items-center gap-2.5 px-2">
          <span className="grid size-9 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <School className="size-4.5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">Little Oak</span>
        </Link>

        <nav className="space-y-0.5">
          {nav.map(({ to, label, icon: Icon, exact }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact }}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-accent-foreground data-[status=active]:ring-1 data-[status=active]:ring-sidebar-border"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl bg-sidebar-accent p-4 ring-1 ring-sidebar-border">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-sidebar-foreground/70">On site now</p>
          <p className="font-display text-2xl font-semibold">
            {present}
            <span className="text-base text-sidebar-foreground/60">/{state.children.length}</span>
          </p>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-card px-4 py-2 lg:hidden">
          {nav.map(({ to, label, exact }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact }}
              className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground data-[status=active]:bg-primary/10 data-[status=active]:text-primary"
            >
              {label}
            </Link>
          ))}
        </nav>

        <header className="mx-4 mb-6 mt-4 flex flex-wrap items-end justify-between gap-4 rounded-3xl bg-brand-gradient px-6 py-6 text-primary-foreground shadow-soft lg:mx-0 lg:mt-0 lg:px-8">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-primary-foreground/70">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <h1 className="font-display text-3xl font-bold">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-primary-foreground/80">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2 [&_button]:shadow-none [&_.bg-background]:text-foreground">{actions}</div> : null}
        </header>

        <main className="px-4 pb-16 lg:px-0">{children}</main>
      </div>
    </div>
  );
}
