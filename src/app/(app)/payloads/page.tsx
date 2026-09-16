"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ExportCsvButton } from "@/components/export-csv-button";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { useApiList } from "@/hooks/use-api-list";
import type { PayloadWithRelations, SpacecraftWithRelations } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const UNASSIGNED = "unassigned";

type FormState = {
  payloadName: string;
  payloadType: string;
  weight: string;
  spacecraftId: string;
};

const emptyForm: FormState = {
  payloadName: "",
  payloadType: "",
  weight: "",
  spacecraftId: UNASSIGNED,
};

export default function PayloadsPage() {
  const { data: payloads, loading, refetch } = useApiList<PayloadWithRelations>(
    "/api/payloads"
  );
  const { data: spacecraft } = useApiList<SpacecraftWithRelations>("/api/spacecraft");

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PayloadWithRelations | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PayloadWithRelations | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return payloads;
    return payloads.filter(
      (p) =>
        p.payloadName.toLowerCase().includes(q) ||
        p.payloadType.toLowerCase().includes(q)
    );
  }, [payloads, search]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(payload: PayloadWithRelations) {
    setEditing(payload);
    setForm({
      payloadName: payload.payloadName,
      payloadType: payload.payloadType,
      weight: String(payload.weight),
      spacecraftId: payload.spacecraftId ? String(payload.spacecraftId) : UNASSIGNED,
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editing ? `/api/payloads/${editing.payloadId}` : "/api/payloads";
      const method = editing ? "PUT" : "POST";
      const payload = {
        ...form,
        spacecraftId: form.spacecraftId === UNASSIGNED ? null : form.spacecraftId,
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Request failed");
      }
      toast.success(editing ? "Payload updated" : "Payload created");
      setDialogOpen(false);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/payloads/${deleteTarget.payloadId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Delete failed");
      }
      toast.success("Payload deleted");
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Payloads"
        description="Instruments and cargo carried by spacecraft."
        actions={
          <>
            <ExportCsvButton
              rows={filtered}
              filename="payloads.csv"
              columns={[
                { header: "Payload ID", accessor: (r) => r.payloadId },
                { header: "Payload Name", accessor: (r) => r.payloadName },
                { header: "Type", accessor: (r) => r.payloadType },
                { header: "Weight (kg)", accessor: (r) => String(r.weight) },
                { header: "Spacecraft", accessor: (r) => r.spacecraft?.name ?? "" },
                { header: "Mission", accessor: (r) => r.spacecraft?.mission.missionName ?? "" },
              ]}
            />
            <Button size="sm" className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add Payload
            </Button>
          </>
        }
      />

      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Search payloads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payload Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Weight (kg)</TableHead>
                <TableHead>Spacecraft</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No payloads found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((payload) => (
                  <TableRow key={payload.payloadId}>
                    <TableCell className="font-medium">{payload.payloadName}</TableCell>
                    <TableCell>{payload.payloadType}</TableCell>
                    <TableCell>{Number(payload.weight).toFixed(1)}</TableCell>
                    <TableCell>
                      {payload.spacecraft ? (
                        payload.spacecraft.name
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(payload)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(payload)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Payload" : "Add Payload"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payloadName">Payload Name</Label>
              <Input
                id="payloadName"
                value={form.payloadName}
                onChange={(e) => setForm({ ...form, payloadName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payloadType">Payload Type</Label>
              <Input
                id="payloadType"
                value={form.payloadType}
                onChange={(e) => setForm({ ...form, payloadType: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                min={0}
                step="0.1"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Spacecraft</Label>
              <Select
                value={form.spacecraftId}
                onValueChange={(v) => setForm({ ...form, spacecraftId: v ?? UNASSIGNED })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                  {spacecraft.map((sc) => (
                    <SelectItem key={sc.spacecraftId} value={String(sc.spacecraftId)}>
                      {sc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete payload?"
        description={`This will permanently delete "${deleteTarget?.payloadName}".`}
        onConfirm={handleDelete}
        isDeleting={deleting}
      />
    </div>
  );
}
