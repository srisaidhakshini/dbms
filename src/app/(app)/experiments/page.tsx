"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ExportCsvButton } from "@/components/export-csv-button";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { useApiList } from "@/hooks/use-api-list";
import type { ExperimentWithRelations, MissionWithRelations } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

type FormState = { experimentName: string; objective: string; missionId: string };
const emptyForm: FormState = { experimentName: "", objective: "", missionId: "" };

export default function ExperimentsPage() {
  const { data: experiments, loading, refetch } = useApiList<ExperimentWithRelations>(
    "/api/experiments"
  );
  const { data: missions } = useApiList<MissionWithRelations>("/api/missions");

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ExperimentWithRelations | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ExperimentWithRelations | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return experiments;
    return experiments.filter(
      (e) =>
        e.experimentName.toLowerCase().includes(q) ||
        e.objective.toLowerCase().includes(q) ||
        e.mission.missionName.toLowerCase().includes(q)
    );
  }, [experiments, search]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(experiment: ExperimentWithRelations) {
    setEditing(experiment);
    setForm({
      experimentName: experiment.experimentName,
      objective: experiment.objective,
      missionId: String(experiment.missionId),
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editing ? `/api/experiments/${editing.experimentId}` : "/api/experiments";
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
      toast.success(editing ? "Experiment updated" : "Experiment created");
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
      const res = await fetch(`/api/experiments/${deleteTarget.experimentId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Delete failed");
      }
      toast.success("Experiment deleted");
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
        title="Experiments"
        description="Scientific experiments conducted during missions."
        actions={
          <>
            <ExportCsvButton
              rows={filtered}
              filename="experiments.csv"
              columns={[
                { header: "Experiment ID", accessor: (r) => r.experimentId },
                { header: "Experiment Name", accessor: (r) => r.experimentName },
                { header: "Objective", accessor: (r) => r.objective },
                { header: "Mission", accessor: (r) => r.mission.missionName },
              ]}
            />
            <Button size="sm" className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add Experiment
            </Button>
          </>
        }
      />

      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Search experiments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Experiment Name</TableHead>
                <TableHead>Objective</TableHead>
                <TableHead>Mission</TableHead>
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
                    No experiments found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((experiment) => (
                  <TableRow key={experiment.experimentId}>
                    <TableCell className="font-medium">
                      {experiment.experimentName}
                    </TableCell>
                    <TableCell className="max-w-md truncate">
                      {experiment.objective}
                    </TableCell>
                    <TableCell>{experiment.mission.missionName}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(experiment)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(experiment)}
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
            <DialogTitle>{editing ? "Edit Experiment" : "Add Experiment"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="experimentName">Experiment Name</Label>
              <Input
                id="experimentName"
                value={form.experimentName}
                onChange={(e) => setForm({ ...form, experimentName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="objective">Objective</Label>
              <Textarea
                id="objective"
                value={form.objective}
                onChange={(e) => setForm({ ...form, objective: e.target.value })}
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
        title="Delete experiment?"
        description={`This will permanently delete "${deleteTarget?.experimentName}".`}
        onConfirm={handleDelete}
        isDeleting={deleting}
      />
    </div>
  );
}
