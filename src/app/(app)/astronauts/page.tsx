"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ExportCsvButton } from "@/components/export-csv-button";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { useApiList } from "@/hooks/use-api-list";
import type { AstronautWithRelations, SpacecraftWithRelations } from "@/lib/types";
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

type FormState = {
  name: string;
  nationality: string;
  rank: string;
  spacecraftIds: number[];
};

const emptyForm: FormState = {
  name: "",
  nationality: "",
  rank: "",
  spacecraftIds: [],
};

export default function AstronautsPage() {
  const { data: astronauts, loading, refetch } = useApiList<AstronautWithRelations>(
    "/api/astronauts"
  );
  const { data: spacecraft } = useApiList<SpacecraftWithRelations>("/api/spacecraft");

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AstronautWithRelations | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AstronautWithRelations | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return astronauts;
    return astronauts.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.nationality.toLowerCase().includes(q) ||
        a.rank.toLowerCase().includes(q)
    );
  }, [astronauts, search]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(astronaut: AstronautWithRelations) {
    setEditing(astronaut);
    setForm({
      name: astronaut.name,
      nationality: astronaut.nationality,
      rank: astronaut.rank,
      spacecraftIds: astronaut.spacecraft.map((sc) => sc.spacecraftId),
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editing ? `/api/astronauts/${editing.astronautId}` : "/api/astronauts";
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
      toast.success(editing ? "Astronaut updated" : "Astronaut created");
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
      const res = await fetch(`/api/astronauts/${deleteTarget.astronautId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Delete failed");
      }
      toast.success("Astronaut deleted");
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
        title="Astronauts"
        description="Crew members and the spacecraft they are assigned to."
        actions={
          <>
            <ExportCsvButton
              rows={filtered}
              filename="astronauts.csv"
              columns={[
                { header: "Astronaut ID", accessor: (r) => r.astronautId },
                { header: "Name", accessor: (r) => r.name },
                { header: "Nationality", accessor: (r) => r.nationality },
                { header: "Rank", accessor: (r) => r.rank },
                { header: "Spacecraft", accessor: (r) => r.spacecraft.map((sc) => sc.name).join("; ") },
                { header: "Missions", accessor: (r) => r.spacecraft.map((sc) => sc.mission.missionName).join("; ") },
              ]}
            />
            <Button size="sm" className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add Astronaut
            </Button>
          </>
        }
      />

      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Search astronauts..."
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
                <TableHead>Nationality</TableHead>
                <TableHead>Rank</TableHead>
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
                    No astronauts found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((astronaut) => (
                  <TableRow key={astronaut.astronautId}>
                    <TableCell className="font-medium">{astronaut.name}</TableCell>
                    <TableCell>{astronaut.nationality}</TableCell>
                    <TableCell>{astronaut.rank}</TableCell>
                    <TableCell>
                      {astronaut.spacecraft.length > 0 ? (
                        astronaut.spacecraft.map((sc) => sc.name).join(", ")
                      ) : (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(astronaut)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(astronaut)}
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
            <DialogTitle>{editing ? "Edit Astronaut" : "Add Astronaut"}</DialogTitle>
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
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                value={form.nationality}
                onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rank">Rank</Label>
              <Input
                id="rank"
                value={form.rank}
                onChange={(e) => setForm({ ...form, rank: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Spacecraft</Label>
              <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-border p-2">
                {spacecraft.length === 0 && (
                  <p className="text-sm text-muted-foreground">No spacecraft available.</p>
                )}
                {spacecraft.map((sc) => (
                  <label key={sc.spacecraftId} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.spacecraftIds.includes(sc.spacecraftId)}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          spacecraftIds: e.target.checked
                            ? [...form.spacecraftIds, sc.spacecraftId]
                            : form.spacecraftIds.filter((id) => id !== sc.spacecraftId),
                        })
                      }
                    />
                    {sc.name}
                  </label>
                ))}
              </div>
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
        title="Delete astronaut?"
        description={`This will permanently delete "${deleteTarget?.name}".`}
        onConfirm={handleDelete}
        isDeleting={deleting}
      />
    </div>
  );
}
