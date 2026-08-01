import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Avatar, Tag } from "@/components/daycare-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { initials, useDaycare } from "@/lib/daycare-store";
import { todayISO } from "@/lib/daycare-seed";
import type { Mood } from "@/lib/daycare-types";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Daily reports — Little Oak Daycare" },
      {
        name: "description",
        content:
          "Log meals eaten, nap duration, mood and activities for each child, then share the day with parents.",
      },
      { property: "og:title", content: "Daily reports — Little Oak Daycare" },
      {
        property: "og:description",
        content: "Meals, naps, mood and activities logged per child, per day.",
      },
    ],
  }),
  component: ReportsPage,
});

const moods: { value: Mood; label: string }[] = [
  { value: "happy", label: "😊 Happy" },
  { value: "calm", label: "🙂 Calm" },
  { value: "sleepy", label: "😴 Sleepy" },
  { value: "fussy", label: "😕 Fussy" },
];

const amounts = ["all", "most", "some", "none"] as const;

function ReportsPage() {
  const { state, addReport } = useDaycare();
  const day = todayISO();
  const [childId, setChildId] = useState(state.children[0]?.id ?? "");
  const [meals, setMeals] = useState("");
  const [mealAmount, setMealAmount] = useState<(typeof amounts)[number]>("most");
  const [napMinutes, setNapMinutes] = useState("60");
  const [mood, setMood] = useState<Mood>("happy");
  const [activities, setActivities] = useState("");
  const [notes, setNotes] = useState("");

  const submit = () => {
    if (!childId) return;
    if (!meals.trim()) {
      toast.error("Describe what was eaten");
      return;
    }
    addReport({
      childId,
      date: day,
      meals: meals.trim().slice(0, 200),
      mealAmount,
      napMinutes: Math.max(0, Math.min(600, Number(napMinutes) || 0)),
      mood,
      activities: activities.trim().slice(0, 200),
      notes: notes.trim().slice(0, 400),
    });
    toast.success("Daily report saved");
    setMeals("");
    setActivities("");
    setNotes("");
  };

  const named = (id: string) => {
    const c = state.children.find((x) => x.id === id);
    return c ? `${c.firstName} ${c.lastName}` : "Unknown";
  };

  return (
    <AppShell
      title="Daily reports"
      subtitle="Meals, naps, mood and activities — the note parents actually read."
    >
      <div className="grid gap-8 lg:grid-cols-3">
        <section className="surface h-fit space-y-4 p-6">
          <h2 className="font-display text-lg font-semibold">New entry</h2>

          <div>
            <Label className="mb-1.5 block text-xs">Child</Label>
            <Select value={childId} onValueChange={setChildId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {state.children.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.firstName} {c.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs">Meals</Label>
            <Input
              value={meals}
              onChange={(e) => setMeals(e.target.value)}
              placeholder="Turkey wrap, grapes"
              maxLength={200}
            />
          </div>

          <div>
            <Label className="mb-1.5 block text-xs">Amount eaten</Label>
            <div className="grid grid-cols-4 gap-2">
              {amounts.map((a) => (
                <Button
                  key={a}
                  type="button"
                  size="sm"
                  variant={mealAmount === a ? "default" : "outline"}
                  onClick={() => setMealAmount(a)}
                  className="capitalize"
                >
                  {a}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block text-xs">Nap (minutes)</Label>
              <Input
                type="number"
                value={napMinutes}
                onChange={(e) => setNapMinutes(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Mood</Label>
              <Select value={mood} onValueChange={(v) => setMood(v as Mood)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {moods.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="mb-1.5 block text-xs">Activities</Label>
            <Input
              value={activities}
              onChange={(e) => setActivities(e.target.value)}
              placeholder="Sandpit, story circle"
              maxLength={200}
            />
          </div>

          <div>
            <Label className="mb-1.5 block text-xs">Notes for parents</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={400} />
          </div>

          <Button className="w-full" onClick={submit}>
            Save report
          </Button>
        </section>

        <section className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Logged entries
          </h2>
          <div className="space-y-3">
            {state.reports.length === 0 ? (
              <p className="surface p-6 text-sm text-muted-foreground">No reports logged yet.</p>
            ) : null}
            {state.reports.map((r) => {
              const c = state.children.find((x) => x.id === r.childId);
              return (
                <article key={r.id} className="surface flex gap-4 p-5">
                  <Avatar text={c ? initials(c.firstName, c.lastName) : "?"} />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium">{named(r.childId)}</h3>
                      <Tag>{r.date}</Tag>
                      <Tag tone={r.mood === "fussy" ? "warning" : "success"}>{r.mood}</Tag>
                    </div>
                    <dl className="mt-2 grid gap-x-6 gap-y-1 text-xs sm:grid-cols-3">
                      <div>
                        <dt className="stat-label">Meals</dt>
                        <dd>
                          {r.meals} · ate {r.mealAmount}
                        </dd>
                      </div>
                      <div>
                        <dt className="stat-label">Nap</dt>
                        <dd>{r.napMinutes} min</dd>
                      </div>
                      <div>
                        <dt className="stat-label">Activities</dt>
                        <dd>{r.activities || "—"}</dd>
                      </div>
                    </dl>
                    {r.notes ? (
                      <p className="mt-2 rounded-lg bg-secondary p-3 text-xs leading-relaxed">
                        {r.notes}
                      </p>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
