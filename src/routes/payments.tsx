import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { StatCard, Tag } from "@/components/daycare-ui";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { money, useDaycare } from "@/lib/daycare-store";
import { currentMonth } from "@/lib/daycare-seed";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments — Little Oak Daycare" },
      {
        name: "description",
        content:
          "Track monthly fees, paid and unpaid status per family, and generate a printable receipt.",
      },
      { property: "og:title", content: "Payments — Little Oak Daycare" },
      {
        property: "og:description",
        content: "Monthly fees, paid/unpaid status and printable receipts.",
      },
    ],
  }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const { state, togglePaid } = useDaycare();
  const month = currentMonth();
  const [receiptId, setReceiptId] = useState<string | null>(null);

  const rows = state.payments
    .filter((p) => p.month === month)
    .map((p) => ({ p, child: state.children.find((c) => c.id === p.childId) }))
    .filter((r) => r.child);

  const total = rows.reduce((s, r) => s + r.p.amount, 0);
  const paid = rows.filter((r) => r.p.paid).reduce((s, r) => s + r.p.amount, 0);

  const receipt = rows.find((r) => r.p.id === receiptId);

  return (
    <AppShell
      title="Payments"
      subtitle={`Billing period ${month}. Toggle a row when a family settles their fee.`}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Expected" value={money(total)} hint={`${rows.length} families`} />
        <StatCard label="Collected" value={money(paid)} />
        <StatCard label="Outstanding" value={money(total - paid)} accent />
      </div>

      <div className="surface mt-8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/60 text-left">
              <th className="p-4 stat-label">Child</th>
              <th className="p-4 stat-label">Parent</th>
              <th className="p-4 stat-label">Amount</th>
              <th className="p-4 stat-label">Status</th>
              <th className="p-4 stat-label">Method</th>
              <th className="p-4 stat-label text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map(({ p, child }) => (
              <tr key={p.id} className="transition-colors hover:bg-secondary/40">
                <td className="p-4 font-medium">
                  {child!.firstName} {child!.lastName}
                </td>
                <td className="p-4 text-muted-foreground">{child!.parentName}</td>
                <td className="p-4 font-mono">{money(p.amount)}</td>
                <td className="p-4">
                  {p.paid ? (
                    <Tag tone="success">Paid {p.paidAt}</Tag>
                  ) : (
                    <Tag tone="danger">Unpaid</Tag>
                  )}
                </td>
                <td className="p-4 text-muted-foreground">{p.method ?? "—"}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant={p.paid ? "outline" : "default"}
                      onClick={() => {
                        togglePaid(p.id);
                        toast.success(p.paid ? "Marked unpaid" : "Payment recorded");
                      }}
                    >
                      {p.paid ? "Mark unpaid" : "Mark paid"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setReceiptId(p.id)}>
                      Receipt
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!receipt} onOpenChange={(o) => !o && setReceiptId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Receipt</DialogTitle>
          </DialogHeader>
          {receipt ? (
            <div className="space-y-3 rounded-xl border border-border bg-secondary/40 p-5 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg font-semibold">Little Oak Daycare</span>
                <span className="font-mono text-xs text-muted-foreground">
                  #{receipt.p.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <hr className="border-border" />
              <Line label="Child" value={`${receipt.child!.firstName} ${receipt.child!.lastName}`} />
              <Line label="Billed to" value={receipt.child!.parentName} />
              <Line label="Period" value={receipt.p.month} />
              <Line label="Method" value={receipt.p.method ?? "—"} />
              <Line label="Status" value={receipt.p.paid ? "Paid" : "Outstanding"} />
              <hr className="border-border" />
              <div className="flex justify-between font-display text-xl font-semibold">
                <span>Total</span>
                <span>{money(receipt.p.amount)}</span>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiptId(null)}>
              Close
            </Button>
            <Button onClick={() => window.print()}>Print</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
