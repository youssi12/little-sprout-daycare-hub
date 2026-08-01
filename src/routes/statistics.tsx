import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/daycare-ui";
import { money, useDaycare } from "@/lib/daycare-store";
import { currentMonth, todayISO } from "@/lib/daycare-seed";

export const Route = createFileRoute("/statistics")({
  head: () => ({
    meta: [
      { title: "Statistics — Little Oak Daycare" },
      {
        name: "description",
        content:
          "Enrolment by classroom, attendance breakdown, mood trends and fee collection statistics.",
      },
      { property: "og:title", content: "Statistics — Little Oak Daycare" },
      {
        property: "og:description",
        content: "Enrolment, attendance, mood trends and fee collection at a glance.",
      },
    ],
  }),
  component: StatisticsPage,
});

const PIE_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
];

function StatisticsPage() {
  const { state } = useDaycare();
  const day = todayISO();
  const month = currentMonth();

  const byRoom = state.classrooms.map((r) => ({
    name: r.name,
    children: state.children.filter((c) => c.classroomId === r.id).length,
    capacity: r.capacity,
  }));

  const statuses = ["present", "checked-out", "absent", "expected"] as const;
  const attendanceData = statuses.map((s) => ({
    name: s,
    value: state.children.filter(
      (c) =>
        (state.attendance.find((a) => a.childId === c.id && a.date === day)?.status ??
          "expected") === s,
    ).length,
  }));

  const moods = ["happy", "calm", "sleepy", "fussy"] as const;
  const moodData = moods.map((m) => ({
    name: m,
    value: state.reports.filter((r) => r.mood === m).length,
  }));

  const monthPayments = state.payments.filter((p) => p.month === month);
  const collected = monthPayments.filter((p) => p.paid).reduce((s, p) => s + p.amount, 0);
  const expected = monthPayments.reduce((s, p) => s + p.amount, 0);
  const avgNap = state.reports.length
    ? Math.round(state.reports.reduce((s, r) => s + r.napMinutes, 0) / state.reports.length)
    : 0;

  return (
    <AppShell title="Statistics" subtitle="Operational snapshot across enrolment, care and fees.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Enrolled children" value={String(state.children.length)} />
        <StatCard
          label="Occupancy"
          value={`${Math.round((state.children.length / state.classrooms.reduce((s, r) => s + r.capacity, 0)) * 100)}%`}
        />
        <StatCard
          label="Collection rate"
          value={`${expected ? Math.round((collected / expected) * 100) : 0}%`}
          hint={`${money(collected)} of ${money(expected)}`}
          accent
        />
        <StatCard label="Average nap" value={`${avgNap} min`} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="surface p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Enrolment vs capacity
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byRoom}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="capacity" fill="var(--color-muted)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="children" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="surface p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Attendance today
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendanceData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {attendanceData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-xs">
            {attendanceData.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1.5 capitalize">
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </section>

        <section className="surface p-6 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Mood distribution from daily reports
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis allowDecimals={false} stroke="var(--color-muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="value" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
