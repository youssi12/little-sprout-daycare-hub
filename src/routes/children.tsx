import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Phone, Trash2 } from "lucide-react";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import { Avatar, Tag } from "@/components/daycare-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { ageLabel, initials, money, useDaycare } from "@/lib/daycare-store";

export const Route = createFileRoute("/children")({
  head: () => ({
    meta: [
      { title: "Children — Little Oak Daycare" },
      {
        name: "description",
        content:
          "Registration records for every child: age, allergies, medical notes, parent and emergency contacts.",
      },
      { property: "og:title", content: "Children — Little Oak Daycare" },
      {
        property: "og:description",
        content: "Allergies, medical notes, parent and emergency contacts in one record.",
      },
    ],
  }),
  component: ChildrenPage,
});

const schema = z.object({
  firstName: z.string().trim().min(1, "First name required").max(50),
  lastName: z.string().trim().min(1, "Last name required").max(50),
  birthDate: z.string().min(1, "Birth date required"),
  parentName: z.string().trim().min(1, "Parent name required").max(80),
  parentPhone: z.string().trim().min(4, "Phone required").max(30),
  parentEmail: z.string().trim().email("Invalid email").max(120),
  emergencyName: z.string().trim().min(1, "Emergency contact required").max(80),
  emergencyPhone: z.string().trim().min(4, "Emergency phone required").max(30),
  monthlyFee: z.number().min(0).max(10000),
});

const empty = {
  firstName: "",
  lastName: "",
  birthDate: "",
  classroomId: "c1",
  allergies: "",
  medicalNotes: "",
  parentName: "",
  parentPhone: "",
  parentEmail: "",
  emergencyName: "",
  emergencyPhone: "",
  monthlyFee: "450",
};

function ChildrenPage() {
  const { state, addChild, removeChild } = useDaycare();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState("");

  const set = (k: keyof typeof empty, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    const parsed = schema.safeParse({ ...form, monthlyFee: Number(form.monthlyFee) });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    const d = parsed.data;
    addChild({
      ...d,
      classroomId: form.classroomId,
      allergies: form.allergies
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      medicalNotes: form.medicalNotes.trim().slice(0, 500),
      authorizedPickups: [d.parentName, d.emergencyName],
      vaccinations: [],
    });
    toast.success(`${d.firstName} ${d.lastName} registered`);
    setForm(empty);
    setOpen(false);
  };

  const list = state.children.filter((c) =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AppShell
      title="Children"
      subtitle={`${state.children.length} registered · ${state.children.filter((c) => c.allergies.length).length} with allergies`}
      actions={
        <>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search children"
            className="w-52"
            maxLength={60}
          />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>New registration</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Register a child</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name">
                  <Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
                </Field>
                <Field label="Last name">
                  <Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
                </Field>
                <Field label="Date of birth">
                  <Input
                    type="date"
                    value={form.birthDate}
                    onChange={(e) => set("birthDate", e.target.value)}
                  />
                </Field>
                <Field label="Classroom">
                  <Select
                    value={form.classroomId}
                    onValueChange={(v) => set("classroomId", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {state.classrooms.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name} ({r.ageRange})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Allergies (comma separated)" full>
                  <Input
                    value={form.allergies}
                    onChange={(e) => set("allergies", e.target.value)}
                    placeholder="Peanuts, Dairy"
                  />
                </Field>
                <Field label="Medical notes" full>
                  <Textarea
                    value={form.medicalNotes}
                    onChange={(e) => set("medicalNotes", e.target.value)}
                    maxLength={500}
                  />
                </Field>
                <Field label="Parent / guardian">
                  <Input
                    value={form.parentName}
                    onChange={(e) => set("parentName", e.target.value)}
                  />
                </Field>
                <Field label="Parent phone">
                  <Input
                    value={form.parentPhone}
                    onChange={(e) => set("parentPhone", e.target.value)}
                  />
                </Field>
                <Field label="Parent email" full>
                  <Input
                    type="email"
                    value={form.parentEmail}
                    onChange={(e) => set("parentEmail", e.target.value)}
                  />
                </Field>
                <Field label="Emergency contact">
                  <Input
                    value={form.emergencyName}
                    onChange={(e) => set("emergencyName", e.target.value)}
                  />
                </Field>
                <Field label="Emergency phone">
                  <Input
                    value={form.emergencyPhone}
                    onChange={(e) => set("emergencyPhone", e.target.value)}
                  />
                </Field>
                <Field label="Monthly fee (USD)">
                  <Input
                    type="number"
                    value={form.monthlyFee}
                    onChange={(e) => set("monthlyFee", e.target.value)}
                  />
                </Field>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={submit}>Save child</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((c) => (
          <article key={c.id} className="surface flex flex-col gap-3 p-5">
            <div className="flex items-start gap-3">
              <Avatar text={initials(c.firstName, c.lastName)} />
              <div className="flex-1">
                <h2 className="font-display text-lg font-semibold">
                  {c.firstName} {c.lastName}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {ageLabel(c.birthDate)} ·{" "}
                  {state.classrooms.find((r) => r.id === c.classroomId)?.name}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Remove ${c.firstName}`}
                onClick={() => {
                  removeChild(c.id);
                  toast.success("Record removed");
                }}
              >
                <Trash2 className="size-4 text-muted-foreground" />
              </Button>
            </div>

            {c.allergies.length ? (
              <div className="flex flex-wrap gap-1">
                {c.allergies.map((a) => (
                  <Tag key={a} tone="danger">
                    {a}
                  </Tag>
                ))}
              </div>
            ) : (
              <Tag tone="success">No known allergies</Tag>
            )}

            {c.medicalNotes ? (
              <p className="text-xs leading-relaxed text-muted-foreground">{c.medicalNotes}</p>
            ) : null}

            <dl className="space-y-1.5 border-t border-border pt-3 text-xs">
              <Row label="Parent" value={c.parentName} sub={c.parentPhone} />
              <Row label="Email" value={c.parentEmail} />
              <Row label="Emergency" value={c.emergencyName} sub={c.emergencyPhone} />
              <Row label="Pickup" value={c.authorizedPickups.join(", ")} />
              <Row label="Monthly fee" value={money(c.monthlyFee)} />
            </dl>

            <a
              href={`tel:${c.parentPhone}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <Phone className="size-3.5" /> Call parent
            </a>
          </article>
        ))}
      </div>
    </AppShell>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <Label className="mb-1.5 block text-xs">{label}</Label>
      {children}
    </div>
  );
}

function Row({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">
        {value}
        {sub ? <span className="block font-mono text-muted-foreground">{sub}</span> : null}
      </dd>
    </div>
  );
}
