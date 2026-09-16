"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ExportCsvButton } from "@/components/export-csv-button";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { useApiList } from "@/hooks/use-api-list";
import type { LaunchVehicleWithCount } from "@/lib/types";
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
import { Badge } from "@/components/ui/badge";

type FormState = { vehicleName: string; manufacturer: string };
const emptyForm: FormState = { vehicleName: "", manufacturer: "" };

export default function LaunchVehiclesPage() {
  const { data: vehicles, loading, refetch } = useApiList<LaunchVehicleWithCount>(
    "/api/launch-vehicles"
  );

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LaunchVehicleWithCount | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LaunchVehicleWithCount | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter(
      (v) =>
        v.vehicleName.toLowerCase().includes(q) ||
        v.manufacturer.toLowerCase().includes(q)
    );
  }, [vehicles, search]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(vehicle: LaunchVehicleWithCount) {
    setEditing(vehicle);
    setForm({ vehicleName: vehicle.vehicleName, manufacturer: vehicle.manufacturer });
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editing
        ? `/api/launch-vehicles/${editing.vehicleId}`
        : "/api/launch-vehicles";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Request failed");
      }
      toast.success(editing ? "Launch vehicle updated" : "Launch vehicle created");
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
      const res = await fetch(`/api/launch-vehicles/${deleteTarget.vehicleId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Delete failed");
      }
      toast.success("Launch vehicle deleted");
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
        title="Launch Vehicles"
        description="Rockets used to launch missions."
        actions={
          <>
            <ExportCsvButton
              rows={filtered}
              filename="launch-vehicles.csv"
              columns={[
                { header: "Vehicle ID", accessor: (r) => r.vehicleId },
                { header: "Vehicle Name", accessor: (r) => r.vehicleName },
                { header: "Manufacturer", accessor: (r) => r.manufacturer },
                { header: "Missions", accessor: (r) => r._count.missions },
              ]}
            />
            <Button size="sm" className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add Vehicle
            </Button>
          </>
        }
      />

      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Search vehicles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle Name</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead>Missions</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No launch vehicles found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((vehicle) => (
                  <TableRow key={vehicle.vehicleId}>
                    <TableCell className="font-medium">{vehicle.vehicleName}</TableCell>
                    <TableCell>{vehicle.manufacturer}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{vehicle._count.missions}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(vehicle)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(vehicle)}
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
            <DialogTitle>{editing ? "Edit Launch Vehicle" : "Add Launch Vehicle"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleName">Vehicle Name</Label>
              <Input
                id="vehicleName"
                value={form.vehicleName}
                onChange={(e) => setForm({ ...form, vehicleName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                value={form.manufacturer}
                onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                required
              />
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
        title="Delete launch vehicle?"
        description={`This will permanently delete "${deleteTarget?.vehicleName}".`}
        onConfirm={handleDelete}
        isDeleting={deleting}
      />
    </div>
  );
}
