import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Avatar, Tag } from "@/components/daycare-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDaycare } from "@/lib/daycare-store";

export const Route = createFileRoute("/staff")({
  head: () => ({
    meta: [
      { title: "Staff — Little Oak Daycare" },
      {
        name: "description",
        content: "Teachers, roles, shift times and the weekly schedule grid for your daycare team.",
      },
      { property: "og:title", content: "Staff — Little Oak Daycare" },
      {
        property: "og:description",
        content: "Teachers, roles, shifts and the weekly coverage grid.",
      },
    ],
  }),
  component: StaffPage,
});

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

function StaffPage() {
  const { state, addStaff, removeStaff } = useDaycare();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    role: "Teacher",
    phone: "",
    classroomId: "c1",
    shift: "08:00 – 16:00",
    days: [...DAYS],
  });

  const toggleDay = (d: string) =>
    setForm((f) => ({
      ...f,
      days: f.days.includes(d) ? f.days.filter((x) => x !== d) : [...f.days, d],
    }));

  const submit = () => {
    if (!form.name.trim()) {
      toast.error("Name required");
      return;
    }
    addStaff({ ...form, name: form.name.trim().slice(0, 80), phone: form.phone.trim().slice(0, 30) });
    toast.success(`${form.name} added to the team`);
    setForm({ ...form, name: "", phone: "" });
    setOpen(false);
  };

  return (
    <AppShell
      title="Staff"
      subtitle={`${state.staff.length} team members across ${state.classrooms.length} rooms.`}
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add staff member</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add staff member</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="mb-1.5 block text-xs">Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  maxLength={80}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5 block text-xs">Role</Label>
                  <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["Director", "Lead Teacher", "Teacher", "Assistant", "Cook"].map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Classroom</Label>
                  <Select
                    value={form.classroomId}
                    onValueChange={(v) => setForm({ ...form, classroomId: v })}
                  >
                    <SelectTrigger>
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
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5 block text-xs">Phone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    maxLength={30}
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Shift</Label>
                  <Input
                    value={form.shift}
                    onChange={(e) => setForm({ ...form, shift: e.target.value })}
                    maxLength={30}
                  />
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">Working days</Label>
                <div className="flex gap-2">
                  {DAYS.map((d) => (
                    <Button
                      key={d}
                      type="button"
                      size="sm"
                      variant={form.days.includes(d) ? "default" : "outline"}
                      onClick={() => toggleDay(d)}
                    >
                      {d}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submit}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {state.staff.map((s) => (
          <article key={s.id} className="surface flex gap-3 p-5">
            <Avatar
              text={s.name
                .split(" ")
                .map((p) => p[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            />
            <div className="flex-1">
              <h2 className="font-medium">{s.name}</h2>
              <p className="text-xs text-muted-foreground">
                {s.role} · {state.classrooms.find((r) => r.id === s.classroomId)?.name}
              </p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {s.shift} · {s.phone}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {s.days.map((d) => (
                  <Tag key={d}>{d}</Tag>
                ))}
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              aria-label={`Remove ${s.name}`}
              onClick={() => {
                removeStaff(s.id);
                toast.success("Staff member removed");
              }}
            >
              <Trash2 className="size-4 text-muted-foreground" />
            </Button>
          </article>
        ))}
      </div>

      <h2 className="mb-3 mt-10 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        Weekly schedule
      </h2>
      <div className="surface overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/60 text-left">
              <th className="p-3 stat-label">Staff</th>
              {DAYS.map((d) => (
                <th key={d} className="p-3 stat-label">
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {state.staff.map((s) => (
              <tr key={s.id}>
                <td className="p-3 font-medium">{s.name}</td>
                {DAYS.map((d) => (
                  <td key={d} className="p-3">
                    {s.days.includes(d) ? (
                      <span className="rounded-md bg-primary/10 px-2 py-1 font-mono text-xs text-primary">
                        {s.shift}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">off</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
