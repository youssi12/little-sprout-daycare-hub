import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Syringe, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Avatar, StatCard, StatusPill, Tag } from "@/components/daycare-ui";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ageLabel, initials, money, useDaycare } from "@/lib/daycare-store";
import { currentMonth, todayISO } from "@/lib/daycare-seed";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Little Oak Daycare" },
      {
        name: "description",
        content:
          "Today's attendance, allergy alerts, unpaid fees and low stock at a glance for your daycare.",
      },
      { property: "og:title", content: "Dashboard — Little Oak Daycare" },
      {
        property: "og:description",
        content: "Today's attendance, alerts, unpaid fees and low stock at a glance.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { state, checkIn, checkOut } = useDaycare();
  const day = todayISO();
  const month = currentMonth();

  const attendanceFor = (childId: string) =>
    state.attendance.find((a) => a.childId === childId && a.date === day);

  const present = state.children.filter((c) => attendanceFor(c.id)?.status === "present");
  const unpaid = state.payments.filter((p) => p.month === month && !p.paid);
  const lowStock = state.inventory.filter((i) => i.quantity < i.threshold);
  const loggedToday = state.reports.filter((r) => r.date === day).length;

  const soonVaccines = state.children
    .flatMap((c) => c.vaccinations.map((v) => ({ ...v, child: c })))
    .filter((v) => {
      const diff = (new Date(v.dueDate).getTime() - Date.now()) / 86_400_000;
      return diff < 21;
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  const alerts = state.children.filter(
    (c) => (c.allergies.length > 0 || c.medicalNotes) && attendanceFor(c.id)?.status === "present",
  );

  return (
    <AppShell
      title="Morning reception"
      subtitle={`${present.length} of ${state.children.length} children are on site right now.`}
      actions={
        <>
          <Button asChild variant="outline">
            <Link to="/reports">Log daily report</Link>
          </Button>
          <Button asChild>
            <Link to="/attendance">Open check-in</Link>
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Checked in"
          value={`${present.length}/${state.children.length}`}
          hint={`${state.classrooms.length} classrooms open`}
        />
        <StatCard label="Daily reports logged" value={`${loggedToday}/${present.length}`} />
        <StatCard
          label="Unpaid this month"
          value={money(unpaid.reduce((s, p) => s + p.amount, 0))}
          hint={`${unpaid.length} families`}
          accent
        />
        <StatCard label="Low stock items" value={String(lowStock.length)} hint="Needs reorder" />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-3">
        <section className="xl:col-span-2">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Live roster
          </h2>
          <div className="surface divide-y divide-border overflow-hidden">
            {state.children.map((c) => {
              const a = attendanceFor(c.id);
              const status = a?.status ?? "expected";
              const room = state.classrooms.find((r) => r.id === c.classroomId);
              return (
                <div
                  key={c.id}
                  className="flex flex-wrap items-center gap-4 p-4 transition-colors hover:bg-secondary/50"
                >
                  <Avatar text={initials(c.firstName, c.lastName)} />
                  <div className="min-w-40 flex-1">
                    <p className="font-medium">
                      {c.firstName} {c.lastName}{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        {ageLabel(c.birthDate)}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {room?.name}
                      {a?.checkInAt ? ` · in ${a.checkInAt}` : ""}
                      {a?.pickedUpBy ? ` · picked up by ${a.pickedUpBy}` : ""}
                    </p>
                    {c.allergies.length > 0 ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {c.allergies.map((al) => (
                          <Tag key={al} tone="danger">
                            {al}
                          </Tag>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <StatusPill status={status} />
                  {status === "present" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => checkOut(c.id, c.parentName)}
                    >
                      Check out
                    </Button>
                  ) : status === "checked-out" ? (
                    <span className="w-24 text-right text-xs text-muted-foreground">
                      {a?.checkOutAt}
                    </span>
                  ) : (
                    <Button size="sm" onClick={() => checkIn(c.id, c.parentName)}>
                      Check in
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="surface p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              <AlertTriangle className="size-4 text-destructive" /> Care alerts
            </h2>
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active alerts on site.</p>
            ) : (
              <ul className="space-y-4">
                {alerts.map((c) => (
                  <li key={c.id} className="text-sm">
                    <p className="font-medium">
                      {c.firstName} {c.lastName}
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {c.allergies.length ? `Allergies: ${c.allergies.join(", ")}. ` : ""}
                      {c.medicalNotes}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="surface p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              <Syringe className="size-4 text-accent" /> Vaccination reminders
            </h2>
            <ul className="space-y-3">
              {soonVaccines.map((v) => (
                <li key={`${v.child.id}-${v.name}`} className="flex justify-between text-sm">
                  <span>
                    {v.child.firstName} {v.child.lastName}
                    <span className="block text-xs text-muted-foreground">{v.name}</span>
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">{v.dueDate}</span>
                </li>
              ))}
              {soonVaccines.length === 0 ? (
                <li className="text-sm text-muted-foreground">Nothing due in the next 3 weeks.</li>
              ) : null}
            </ul>
          </div>

          <div className="surface p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              <TrendingUp className="size-4 text-primary" /> Monthly collection
            </h2>
            {(() => {
              const all = state.payments.filter((p) => p.month === month);
              const total = all.reduce((s, p) => s + p.amount, 0);
              const paid = all.filter((p) => p.paid).reduce((s, p) => s + p.amount, 0);
              const pct = total ? Math.round((paid / total) * 100) : 0;
              return (
                <>
                  <p className="font-display text-3xl font-semibold">{money(paid)}</p>
                  <p className="mb-3 text-xs text-muted-foreground">
                    of {money(total)} expected · {pct}%
                  </p>
                  <Progress value={pct} />
                </>
              );
            })()}
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
