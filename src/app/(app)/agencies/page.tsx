"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ExportCsvButton } from "@/components/export-csv-button";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { useApiList } from "@/hooks/use-api-list";
import type { AgencyWithCount } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
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

type FormState = {
  agencyName: string;
  country: string;
  headquarters: string;
};

const emptyForm: FormState = { agencyName: "", country: "", headquarters: "" };

export default function AgenciesPage() {
  const { data: agencies, loading, refetch } = useApiList<AgencyWithCount>(
    "/api/agencies"
  );

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AgencyWithCount | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AgencyWithCount | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return agencies;
    return agencies.filter(
      (a) =>
        a.agencyName.toLowerCase().includes(q) ||
        a.country.toLowerCase().includes(q) ||
        a.headquarters.toLowerCase().includes(q)
    );
  }, [agencies, search]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(agency: AgencyWithCount) {
    setEditing(agency);
    setForm({
      agencyName: agency.agencyName,
      country: agency.country,
      headquarters: agency.headquarters,
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editing ? `/api/agencies/${editing.agencyId}` : "/api/agencies";
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
      toast.success(editing ? "Agency updated" : "Agency created");
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
      const res = await fetch(`/api/agencies/${deleteTarget.agencyId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Delete failed");
      }
      toast.success("Agency deleted");
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
        title="Space Agencies"
        description="Organizations that manage deep space missions."
        actions={
          <>
            <ExportCsvButton
              rows={filtered}
              filename="agencies.csv"
              columns={[
                { header: "Agency ID", accessor: (r) => r.agencyId },
                { header: "Agency Name", accessor: (r) => r.agencyName },
                { header: "Country", accessor: (r) => r.country },
                { header: "Headquarters", accessor: (r) => r.headquarters },
                { header: "Missions", accessor: (r) => r._count.missions },
              ]}
            />
            <Button size="sm" className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add Agency
            </Button>
          </>
        }
      />

      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Search agencies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agency Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Headquarters</TableHead>
                <TableHead>Missions</TableHead>
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
                    No agencies found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((agency) => (
                  <TableRow key={agency.agencyId}>
                    <TableCell className="font-medium">{agency.agencyName}</TableCell>
                    <TableCell>{agency.country}</TableCell>
                    <TableCell>{agency.headquarters}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{agency._count.missions}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(agency)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(agency)}
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
            <DialogTitle>{editing ? "Edit Agency" : "Add Agency"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agencyName">Agency Name</Label>
              <Input
                id="agencyName"
                value={form.agencyName}
                onChange={(e) => setForm({ ...form, agencyName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="headquarters">Headquarters</Label>
              <Input
                id="headquarters"
                value={form.headquarters}
                onChange={(e) => setForm({ ...form, headquarters: e.target.value })}
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
        title="Delete agency?"
        description={`This will permanently delete "${deleteTarget?.agencyName}". Missions tied to this agency cannot be deleted this way.`}
        onConfirm={handleDelete}
        isDeleting={deleting}
      />
    </div>
  );
}
