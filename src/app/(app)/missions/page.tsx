"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ExportCsvButton } from "@/components/export-csv-button";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { useApiList } from "@/hooks/use-api-list";
import type {
  AgencyWithCount,
  LaunchVehicleWithCount,
  MissionWithRelations,
} from "@/lib/types";
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

const STATUS_OPTIONS = ["planned", "active", "completed", "aborted"] as const;

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  planned: "outline",
  active: "default",
  completed: "secondary",
  aborted: "destructive",
};

type FormState = {
  missionName: string;
  missionType: string;
  launchDate: string;
  status: string;
  budget: string;
  agencyId: string;
  launchVehicleId: string;
};

const emptyForm: FormState = {
  missionName: "",
  missionType: "",
  launchDate: "",
  status: "planned",
  budget: "",
  agencyId: "",
  launchVehicleId: "",
};

export default function MissionsPage() {
  const { data: agencies } = useApiList<AgencyWithCount>("/api/agencies");
  const { data: vehicles } = useApiList<LaunchVehicleWithCount>("/api/launch-vehicles");

  const [missions, setMissions] = useState<MissionWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [agencyFilter, setAgencyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<MissionWithRelations | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MissionWithRelations | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadMissions() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (agencyFilter !== "all") params.set("agencyId", agencyFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (typeFilter !== "all") params.set("missionType", typeFilter);
      if (search.trim()) params.set("search", search.trim());
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);

      const res = await fetch(`/api/missions?${params.toString()}`, {
        cache: "no-store",
      });
      const json = await res.json();
      setMissions(json);
    } catch {
      toast.error("Failed to load missions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(loadMissions, 250);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, agencyFilter, statusFilter, typeFilter, dateFrom, dateTo]);

  const missionTypes = useMemo(
    () => Array.from(new Set(missions.map((m) => m.missionType))),
    [missions]
  );

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(mission: MissionWithRelations) {
    setEditing(mission);
    setForm({
      missionName: mission.missionName,
      missionType: mission.missionType,
      launchDate: new Date(mission.launchDate).toISOString().slice(0, 10),
      status: mission.status,
      budget: String(mission.budget),
      agencyId: String(mission.agencyId),
      launchVehicleId: String(mission.launchVehicleId),
    });
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editing ? `/api/missions/${editing.missionId}` : "/api/missions";
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
      toast.success(editing ? "Mission updated" : "Mission created");
      setDialogOpen(false);
      loadMissions();
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
      const res = await fetch(`/api/missions/${deleteTarget.missionId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Delete failed");
      }
      toast.success("Mission deleted");
      setDeleteTarget(null);
      loadMissions();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Missions"
        description="All deep space missions across agencies."
        actions={
          <>
            <ExportCsvButton
              rows={missions}
              filename="missions.csv"
              columns={[
                { header: "Mission ID", accessor: (r) => r.missionId },
                { header: "Mission Name", accessor: (r) => r.missionName },
                { header: "Type", accessor: (r) => r.missionType },
                {
                  header: "Launch Date",
                  accessor: (r) => new Date(r.launchDate).toISOString().slice(0, 10),
                },
                { header: "Status", accessor: (r) => r.status },
                { header: "Budget", accessor: (r) => String(r.budget) },
                { header: "Agency", accessor: (r) => r.agency.agencyName },
                { header: "Launch Vehicle", accessor: (r) => r.launchVehicle.vehicleName },
              ]}
            />
            <Button size="sm" className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add Mission
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search missions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={agencyFilter} onValueChange={(v) => setAgencyFilter(v ?? "all")}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All agencies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All agencies</SelectItem>
            {agencies.map((a) => (
              <SelectItem key={a.agencyId} value={String(a.agencyId)}>
                {a.agencyName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {missionTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Label htmlFor="dateFrom" className="text-sm text-muted-foreground">
            From
          </Label>
          <Input
            id="dateFrom"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="dateTo" className="text-sm text-muted-foreground">
            To
          </Label>
          <Input
            id="dateTo"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-40"
          />
        </div>
        {(search ||
          agencyFilter !== "all" ||
          statusFilter !== "all" ||
          typeFilter !== "all" ||
          dateFrom ||
          dateTo) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setAgencyFilter("all");
              setStatusFilter("all");
              setTypeFilter("all");
              setDateFrom("");
              setDateTo("");
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mission</TableHead>
                <TableHead>Agency</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Launch Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Budget</TableHead>
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
              ) : missions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No missions found.
                  </TableCell>
                </TableRow>
              ) : (
                missions.map((mission) => (
                  <TableRow key={mission.missionId}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/missions/${mission.missionId}`}
                        className="flex items-center gap-1 hover:underline"
                      >
                        {mission.missionName}
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {mission.missionType}
                      </div>
                    </TableCell>
                    <TableCell>{mission.agency.agencyName}</TableCell>
                    <TableCell>{mission.launchVehicle.vehicleName}</TableCell>
                    <TableCell>
                      {new Date(mission.launchDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[mission.status]} className="capitalize">
                        {mission.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      ${Number(mission.budget).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(mission)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(mission)}
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Mission" : "Add Mission"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="missionName">Mission Name</Label>
                <Input
                  id="missionName"
                  value={form.missionName}
                  onChange={(e) => setForm({ ...form, missionName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="missionType">Mission Type</Label>
                <Input
                  id="missionType"
                  value={form.missionType}
                  onChange={(e) => setForm({ ...form, missionType: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="launchDate">Launch Date</Label>
                <Input
                  id="launchDate"
                  type="date"
                  value={form.launchDate}
                  onChange={(e) => setForm({ ...form, launchDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v ?? "planned" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget (USD)</Label>
                <Input
                  id="budget"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.budget}
                  onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Agency</Label>
                <Select
                  value={form.agencyId}
                  onValueChange={(v) => setForm({ ...form, agencyId: v ?? "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select agency" />
                  </SelectTrigger>
                  <SelectContent>
                    {agencies.map((a) => (
                      <SelectItem key={a.agencyId} value={String(a.agencyId)}>
                        {a.agencyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Launch Vehicle</Label>
                <Select
                  value={form.launchVehicleId}
                  onValueChange={(v) => setForm({ ...form, launchVehicleId: v ?? "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.vehicleId} value={String(v.vehicleId)}>
                        {v.vehicleName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
        title="Delete mission?"
        description={`This will permanently delete "${deleteTarget?.missionName}" and all of its spacecraft, experiments, and telemetry.`}
        onConfirm={handleDelete}
        isDeleting={deleting}
      />
    </div>
  );
}
