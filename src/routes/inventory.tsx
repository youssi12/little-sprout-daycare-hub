import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatCard, Tag } from "@/components/daycare-ui";
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
import type { InventoryItem } from "@/lib/daycare-types";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — Little Oak Daycare" },
      {
        name: "description",
        content: "Track toys, food and supplies with reorder thresholds and low-stock warnings.",
      },
      { property: "og:title", content: "Inventory — Little Oak Daycare" },
      {
        property: "og:description",
        content: "Toys, food and supplies with reorder thresholds and low-stock warnings.",
      },
    ],
  }),
  component: InventoryPage,
});

const categories: InventoryItem["category"][] = ["Toys", "Food", "Supplies"];

function InventoryPage() {
  const { state, adjustStock, addInventory } = useDaycare();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "Supplies" as InventoryItem["category"],
    quantity: "10",
    threshold: "5",
    unit: "packs",
  });

  const low = state.inventory.filter((i) => i.quantity < i.threshold);

  const submit = () => {
    if (!form.name.trim()) {
      toast.error("Item name required");
      return;
    }
    addInventory({
      name: form.name.trim().slice(0, 60),
      category: form.category,
      quantity: Math.max(0, Number(form.quantity) || 0),
      threshold: Math.max(0, Number(form.threshold) || 0),
      unit: form.unit.trim().slice(0, 20) || "units",
    });
    toast.success("Item added");
    setForm({ ...form, name: "" });
    setOpen(false);
  };

  return (
    <AppShell
      title="Inventory"
      subtitle="Toys, food and supplies with reorder thresholds."
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add inventory item</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="mb-1.5 block text-xs">Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  maxLength={60}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1.5 block text-xs">Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) =>
                      setForm({ ...form, category: v as InventoryItem["category"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Unit</Label>
                  <Input
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    maxLength={20}
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Quantity</Label>
                  <Input
                    type="number"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Reorder below</Label>
                  <Input
                    type="number"
                    value={form.threshold}
                    onChange={(e) => setForm({ ...form, threshold: e.target.value })}
                  />
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
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Tracked items" value={String(state.inventory.length)} />
        <StatCard label="Below threshold" value={String(low.length)} accent />
        <StatCard
          label="Units on hand"
          value={String(state.inventory.reduce((s, i) => s + i.quantity, 0))}
        />
      </div>

      {categories.map((cat) => {
        const items = state.inventory.filter((i) => i.category === cat);
        if (items.length === 0) return null;
        return (
          <section key={cat} className="mt-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              {cat}
            </h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((i) => (
                <article key={i.id} className="surface flex items-center gap-4 p-5">
                  <div className="flex-1">
                    <h3 className="font-medium">{i.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {i.quantity} {i.unit} · reorder below {i.threshold}
                    </p>
                    <div className="mt-2">
                      {i.quantity < i.threshold ? (
                        <Tag tone="danger">Low stock</Tag>
                      ) : (
                        <Tag tone="success">Stocked</Tag>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label={`Decrease ${i.name}`}
                      onClick={() => adjustStock(i.id, -1)}
                    >
                      <Minus className="size-4" />
                    </Button>
                    <span className="w-10 text-center font-mono text-sm">{i.quantity}</span>
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label={`Increase ${i.name}`}
                      onClick={() => adjustStock(i.id, 1)}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </AppShell>
  );
}
