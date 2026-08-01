import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Tag } from "@/components/daycare-ui";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ageLabel, useDaycare } from "@/lib/daycare-store";

export const Route = createFileRoute("/classrooms")({
  head: () => ({
    meta: [
      { title: "Classrooms — Little Oak Daycare" },
      {
        name: "description",
        content:
          "Organise children into age groups, watch capacity and see which teachers cover each room.",
      },
      { property: "og:title", content: "Classrooms — Little Oak Daycare" },
      {
        property: "og:description",
        content: "Group assignment, capacity and teacher coverage per room.",
      },
    ],
  }),
  component: ClassroomsPage,
});

function ClassroomsPage() {
  const { state, updateChild } = useDaycare();

  return (
    <AppShell title="Classrooms" subtitle="Assign children to groups and keep ratios in check.">
      <div className="grid gap-6 lg:grid-cols-3">
        {state.classrooms.map((room) => {
          const kids = state.children.filter((c) => c.classroomId === room.id);
          const teachers = state.staff.filter((s) => s.classroomId === room.id);
          const pct = Math.round((kids.length / room.capacity) * 100);
          return (
            <section key={room.id} className="surface flex flex-col p-5">
              <header className="mb-4">
                <h2 className="font-display text-xl font-semibold">{room.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {room.ageRange} · {kids.length}/{room.capacity} places used
                </p>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={pct > 90 ? "h-full bg-accent" : "h-full bg-primary"}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
              </header>

              <p className="stat-label mb-2">Teachers</p>
              <div className="mb-4 flex flex-wrap gap-1">
                {teachers.length ? (
                  teachers.map((t) => <Tag key={t.id}>{t.name}</Tag>)
                ) : (
                  <Tag tone="warning">Unstaffed</Tag>
                )}
              </div>

              <p className="stat-label mb-2">Children</p>
              <ul className="space-y-2">
                {kids.map((c) => (
                  <li key={c.id} className="flex items-center gap-2 text-sm">
                    <span className="flex-1">
                      {c.firstName} {c.lastName}
                      <span className="ml-1 text-xs text-muted-foreground">
                        {ageLabel(c.birthDate)}
                      </span>
                    </span>
                    <Select
                      value={c.classroomId}
                      onValueChange={(v) => {
                        updateChild(c.id, { classroomId: v });
                        toast.success(
                          `${c.firstName} moved to ${state.classrooms.find((r) => r.id === v)?.name}`,
                        );
                      }}
                    >
                      <SelectTrigger className="h-8 w-32 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {state.classrooms.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </li>
                ))}
                {kids.length === 0 ? (
                  <li className="text-sm text-muted-foreground">No children assigned.</li>
                ) : null}
              </ul>

              <Button variant="ghost" className="mt-4 w-full" disabled>
                {room.capacity - kids.length} places available
              </Button>
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}
