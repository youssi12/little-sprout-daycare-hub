import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  AttendanceRecord,
  Child,
  DailyReport,
  DaycareState,
  InventoryItem,
  Payment,
  Staff,
} from "./daycare-types";
import { currentMonth, seedState, todayISO } from "./daycare-seed";

const STORAGE_KEY = "littleoak-daycare-v1";

interface Ctx {
  state: DaycareState;
  hydrated: boolean;
  addChild: (c: Omit<Child, "id">) => void;
  updateChild: (id: string, patch: Partial<Child>) => void;
  removeChild: (id: string) => void;
  checkIn: (childId: string, by: string) => void;
  checkOut: (childId: string, by: string) => void;
  markAbsent: (childId: string) => void;
  togglePaid: (paymentId: string) => void;
  addStaff: (s: Omit<Staff, "id">) => void;
  removeStaff: (id: string) => void;
  addReport: (r: Omit<DailyReport, "id">) => void;
  adjustStock: (id: string, delta: number) => void;
  addInventory: (i: Omit<InventoryItem, "id">) => void;
  reset: () => void;
}

const DaycareContext = createContext<Ctx | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);
const nowTime = () =>
  new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export function DaycareProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DaycareState>(() => seedState());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState(JSON.parse(raw) as DaycareState);
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable */
    }
  }, [state, hydrated]);

  const upsertAttendance = useCallback(
    (childId: string, patch: Partial<AttendanceRecord>) => {
      const date = todayISO();
      setState((s) => {
        const idx = s.attendance.findIndex((a) => a.childId === childId && a.date === date);
        const base: AttendanceRecord =
          idx >= 0
            ? s.attendance[idx]!
            : { id: uid(), childId, date, status: "expected" };
        const next = { ...base, ...patch };
        const attendance = [...s.attendance];
        if (idx >= 0) attendance[idx] = next;
        else attendance.push(next);
        return { ...s, attendance };
      });
    },
    [],
  );

  const value = useMemo<Ctx>(
    () => ({
      state,
      hydrated,
      addChild: (c) => {
        const id = uid();
        setState((s) => ({
          ...s,
          children: [...s.children, { ...c, id }],
          payments: [
            ...s.payments,
            {
              id: uid(),
              childId: id,
              month: currentMonth(),
              amount: c.monthlyFee,
              paid: false,
            } as Payment,
          ],
        }));
      },
      updateChild: (id, patch) =>
        setState((s) => ({
          ...s,
          children: s.children.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      removeChild: (id) =>
        setState((s) => ({
          ...s,
          children: s.children.filter((c) => c.id !== id),
          attendance: s.attendance.filter((a) => a.childId !== id),
          payments: s.payments.filter((p) => p.childId !== id),
          reports: s.reports.filter((r) => r.childId !== id),
        })),
      checkIn: (childId, by) =>
        upsertAttendance(childId, {
          status: "present",
          checkInAt: nowTime(),
          droppedOffBy: by,
          checkOutAt: undefined,
          pickedUpBy: undefined,
        }),
      checkOut: (childId, by) =>
        upsertAttendance(childId, {
          status: "checked-out",
          checkOutAt: nowTime(),
          pickedUpBy: by,
        }),
      markAbsent: (childId) => upsertAttendance(childId, { status: "absent" }),
      togglePaid: (paymentId) =>
        setState((s) => ({
          ...s,
          payments: s.payments.map((p) =>
            p.id === paymentId
              ? { ...p, paid: !p.paid, paidAt: !p.paid ? todayISO() : undefined }
              : p,
          ),
        })),
      addStaff: (st) => setState((s) => ({ ...s, staff: [...s.staff, { ...st, id: uid() }] })),
      removeStaff: (id) => setState((s) => ({ ...s, staff: s.staff.filter((x) => x.id !== id) })),
      addReport: (r) => setState((s) => ({ ...s, reports: [{ ...r, id: uid() }, ...s.reports] })),
      adjustStock: (id, delta) =>
        setState((s) => ({
          ...s,
          inventory: s.inventory.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i,
          ),
        })),
      addInventory: (i) =>
        setState((s) => ({ ...s, inventory: [...s.inventory, { ...i, id: uid() }] })),
      reset: () => setState(seedState()),
    }),
    [state, hydrated, upsertAttendance],
  );

  return <DaycareContext.Provider value={value}>{children}</DaycareContext.Provider>;
}

export function useDaycare() {
  const ctx = useContext(DaycareContext);
  if (!ctx) throw new Error("useDaycare must be used inside DaycareProvider");
  return ctx;
}

export function ageLabel(birthDate: string) {
  const b = new Date(birthDate);
  const now = new Date();
  let months = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
  if (now.getDate() < b.getDate()) months -= 1;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return `${y}y ${m}m`;
}

export function initials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

export function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
