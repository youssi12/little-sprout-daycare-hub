import { cn } from "@/lib/utils";
import type { AttendanceStatus } from "@/lib/daycare-types";

const map: Record<AttendanceStatus, { label: string; className: string }> = {
  present: { label: "Present", className: "bg-success/10 text-success ring-success/20" },
  "checked-out": { label: "Checked out", className: "bg-info/10 text-info ring-info/20" },
  absent: { label: "Absent", className: "bg-destructive/10 text-destructive ring-destructive/20" },
  expected: { label: "Expected", className: "bg-muted text-muted-foreground ring-border" },
};

export function StatusPill({ status }: { status: AttendanceStatus }) {
  const s = map[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ring-1",
        s.className,
      )}
    >
      {s.label}
    </span>
  );
}

export function Tag({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "danger" | "warning" | "success";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1",
        tone === "danger" && "bg-destructive/10 text-destructive ring-destructive/20",
        tone === "warning" && "bg-warning/15 text-warning-foreground ring-warning/30",
        tone === "success" && "bg-success/10 text-success ring-success/20",
        tone === "muted" && "bg-secondary text-secondary-foreground ring-border",
      )}
    >
      {children}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="surface p-5">
      <p className="stat-label">{label}</p>
      <p
        className={cn(
          "mt-2 font-display text-3xl font-semibold tracking-tight",
          accent && "text-accent",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function Avatar({ text }: { text: string }) {
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground ring-1 ring-border">
      {text}
    </span>
  );
}
