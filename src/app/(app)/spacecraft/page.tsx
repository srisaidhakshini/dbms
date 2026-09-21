"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { useApiList } from "@/hooks/use-api-list";
import type { MissionWithRelations, SpacecraftWithRelations } from "@/lib/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormState = {
  name: string;
  model: string;
  crewCapacity: string;
  missionId: string;
};

const emptyForm: FormState = { name: "", model: "", crewCapacity: "0", missionId: "" };

export default function SpacecraftPage() {
  const { data: spacecraft, loading, refetch } = useApiList<SpacecraftWithRelations>(
    "/api/spacecraft"
  );
  const { data: missions } = useApiList<MissionWithRelations>("/api/missions");

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SpacecraftWithRelations | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SpacecraftWithRelations | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return spacecraft;
    return spacecraft.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.model.toLowerCase().includes(q) ||
        s.mission.missionName.toLowerCase().includes(q)
    );
  }, [spacecraft, search]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(sc: SpacecraftWithRelations) {
    setEditing(sc);
    setForm({
      name: sc.name,
      model: sc.model,
      crewCapacity: String(sc.crewCapacity),
      missionId: String(sc.missionId),
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editing ? `/api/spacecraft/${editing.spacecraftId}` : "/api/spacecraft";
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
      toast.success(editing ? "Spacecraft updated" : "Spacecraft created");
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
      const res = await fetch(`/api/spacecraft/${deleteTarget.spacecraftId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Delete failed");
      }
      toast.success("Spacecraft deleted");
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
        title="Spacecraft"
        description="Vehicles that carry astronauts and payloads for a mission."
        actions={
          <Button size="sm" className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add Spacecraft
          </Button>
        }
      />

      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Search spacecraft..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Crew Capacity</TableHead>
                <TableHead>Mission</TableHead>
                <TableHead>Astronauts</TableHead>
                <TableHead>Payloads</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No spacecraft found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((sc) => (
                  <TableRow key={sc.spacecraftId}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/spacecraft/${sc.spacecraftId}`}
                        className="flex items-center gap-1 hover:underline"
                      >
                        {sc.name}
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </Link>
                    </TableCell>
                    <TableCell>{sc.model}</TableCell>
                    <TableCell>{sc.crewCapacity}</TableCell>
                    <TableCell>{sc.mission.missionName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{sc._count.astronauts}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{sc._count.payloads}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(sc)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(sc)}
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
            <DialogTitle>{editing ? "Edit Spacecraft" : "Add Spacecraft"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="crewCapacity">Crew Capacity</Label>
              <Input
                id="crewCapacity"
                type="number"
                min={0}
                value={form.crewCapacity}
                onChange={(e) => setForm({ ...form, crewCapacity: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Mission</Label>
              <Select
                value={form.missionId}
                onValueChange={(v) => setForm({ ...form, missionId: v ?? "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mission" />
                </SelectTrigger>
                <SelectContent>
                  {missions.map((m) => (
                    <SelectItem key={m.missionId} value={String(m.missionId)}>
                      {m.missionName}
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
        title="Delete spacecraft?"
        description={`This will permanently delete "${deleteTarget?.name}". Its links to astronauts and payloads will be removed; the astronauts and payloads themselves are kept.`}
        onConfirm={handleDelete}
        isDeleting={deleting}
      />
    </div>
  );
}
