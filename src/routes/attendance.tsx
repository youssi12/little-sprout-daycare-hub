import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Avatar, StatusPill, Tag } from "@/components/daycare-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ageLabel, initials, useDaycare } from "@/lib/daycare-store";
import { todayISO } from "@/lib/daycare-seed";

export const Route = createFileRoute("/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance — Little Oak Daycare" },
      {
        name: "description",
        content:
          "Check children in and out with timestamps and record exactly who dropped off or collected them.",
      },
      { property: "og:title", content: "Attendance — Little Oak Daycare" },
      {
        property: "og:description",
        content: "Timestamped check-in and check-out with authorized pickup tracking.",
      },
    ],
  }),
  component: AttendancePage,
});

function AttendancePage() {
  const { state, checkIn, checkOut, markAbsent } = useDaycare();
  const day = todayISO();
  const [dialog, setDialog] = useState<{ childId: string; mode: "in" | "out" } | null>(null);
  const [person, setPerson] = useState("");
  const [filter, setFilter] = useState("all");

  const child = state.children.find((c) => c.id === dialog?.childId);

  const rows = state.children
    .map((c) => ({
      child: c,
      record: state.attendance.find((a) => a.childId === c.id && a.date === day),
    }))
    .filter((r) => filter === "all" || (r.record?.status ?? "expected") === filter);

  const open = (childId: string, mode: "in" | "out") => {
    const c = state.children.find((x) => x.id === childId);
    setPerson(c?.parentName ?? "");
    setDialog({ childId, mode });
  };

  const confirm = () => {
    if (!dialog || !person.trim()) return;
    if (dialog.mode === "in") checkIn(dialog.childId, person.trim());
    else checkOut(dialog.childId, person.trim());
    toast.success(
      `${child?.firstName} ${dialog.mode === "in" ? "checked in" : "checked out"} · ${person}`,
    );
    setDialog(null);
  };

  return (
    <AppShell
      title="Attendance"
      subtitle="Every arrival and departure is timestamped and attributed to a named adult."
      actions={
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All children</SelectItem>
            <SelectItem value="expected">Expected</SelectItem>
            <SelectItem value="present">Present</SelectItem>
            <SelectItem value="checked-out">Checked out</SelectItem>
            <SelectItem value="absent">Absent</SelectItem>
          </SelectContent>
        </Select>
      }
    >
      <div className="surface divide-y divide-border overflow-hidden">
        {rows.map(({ child: c, record }) => {
          const status = record?.status ?? "expected";
          return (
            <div key={c.id} className="flex flex-wrap items-center gap-4 p-4">
              <Avatar text={initials(c.firstName, c.lastName)} />
              <div className="min-w-44 flex-1">
                <p className="font-medium">
                  {c.firstName} {c.lastName}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    {ageLabel(c.birthDate)}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {state.classrooms.find((r) => r.id === c.classroomId)?.name}
                </p>
                {c.allergies.map((a) => (
                  <Tag key={a} tone="danger">
                    {a}
                  </Tag>
                ))}
              </div>
              <div className="w-40 font-mono text-xs text-muted-foreground">
                <div>in: {record?.checkInAt ?? "--:--"}</div>
                <div>out: {record?.checkOutAt ?? "--:--"}</div>
              </div>
              <div className="w-52 text-xs text-muted-foreground">
                {record?.droppedOffBy ? <div>Dropped off by {record.droppedOffBy}</div> : null}
                {record?.pickedUpBy ? <div>Picked up by {record.pickedUpBy}</div> : null}
              </div>
              <StatusPill status={status} />
              <div className="flex gap-2">
                {status === "present" ? (
                  <Button size="sm" variant="outline" onClick={() => open(c.id, "out")}>
                    Check out
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => open(c.id, "in")}>
                    Check in
                  </Button>
                )}
                {status === "expected" ? (
                  <Button size="sm" variant="ghost" onClick={() => markAbsent(c.id)}>
                    Absent
                  </Button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!dialog} onOpenChange={(o) => !o && setDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog?.mode === "in" ? "Check in" : "Check out"} {child?.firstName}{" "}
              {child?.lastName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>{dialog?.mode === "in" ? "Dropped off by" : "Picked up by"}</Label>
            <Select value={person} onValueChange={setPerson}>
              <SelectTrigger>
                <SelectValue placeholder="Select authorized adult" />
              </SelectTrigger>
              <SelectContent>
                {child?.authorizedPickups.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              value={person}
              onChange={(e) => setPerson(e.target.value)}
              placeholder="Or type a name"
              maxLength={80}
            />
            {child?.allergies.length ? (
              <p className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                Allergy alert: {child.allergies.join(", ")}. {child.medicalNotes}
              </p>
            ) : null}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(null)}>
              Cancel
            </Button>
            <Button onClick={confirm} disabled={!person.trim()}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
