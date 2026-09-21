"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Rocket, Users, Package, FlaskConical, Activity } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { MissionDetail } from "@/lib/types";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  planned: "outline",
  active: "default",
  completed: "secondary",
  aborted: "destructive",
};

export default function MissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [mission, setMission] = useState<MissionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/missions/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Mission not found");
        const json = await res.json();
        if (!cancelled) setMission(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error || !mission) {
    return (
      <div>
        <p className="text-destructive">{error ?? "Mission not found"}</p>
        <Link href="/missions" className="mt-4 inline-block">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to missions
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/missions"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to missions
      </Link>

      <PageHeader
        title={mission.missionName}
        description={mission.missionType}
        actions={
          <Badge variant={statusVariant[mission.status]} className="capitalize text-sm">
            {mission.status}
          </Badge>
        }
      />

      <dl className="mb-6 grid grid-cols-2 gap-x-6 gap-y-3 border-y border-border py-3 lg:grid-cols-4">
        <div>
          <dt className="text-xs text-muted-foreground">Agency</dt>
          <dd className="font-medium">{mission.agency.agencyName}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Launch Vehicle</dt>
          <dd className="font-medium">{mission.launchVehicle.vehicleName}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Launch Date</dt>
          <dd className="font-medium">
            {new Date(mission.launchDate).toLocaleDateString("en-US", { dateStyle: "medium" })}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Budget</dt>
          <dd className="font-medium">${Number(mission.budget).toLocaleString("en-US")}</dd>
        </div>
      </dl>

      <div className="grid grid-cols-1 gap-x-8 gap-y-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-2 flex items-center gap-2 border-b border-border pb-2 font-heading text-base">
            <Rocket className="h-4 w-4" />
            Spacecraft ({mission.spacecraft.length})
          </h2>
          {mission.spacecraft.length === 0 && (
            <p className="text-sm text-muted-foreground">No spacecraft assigned.</p>
          )}
          <ul className="divide-y divide-border">
            {mission.spacecraft.map((sc) => (
              <li key={sc.spacecraftId} className="py-2">
                <Link
                  href={`/spacecraft/${sc.spacecraftId}`}
                  className="font-medium hover:underline"
                >
                  {sc.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {sc.model} &middot; Crew capacity {sc.crewCapacity}
                </p>
                <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {sc.astronauts.length} astronauts
                  </span>
                  <span className="flex items-center gap-1">
                    <Package className="h-3 w-3" /> {sc.payloads.length} payloads
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-2 flex items-center gap-2 border-b border-border pb-2 font-heading text-base">
            <FlaskConical className="h-4 w-4" />
            Experiments ({mission.experiments.length})
          </h2>
          {mission.experiments.length === 0 && (
            <p className="text-sm text-muted-foreground">No experiments recorded.</p>
          )}
          <ul className="divide-y divide-border">
            {mission.experiments.map((exp) => (
              <li key={exp.experimentId} className="py-2">
                <p className="font-medium">{exp.experimentName}</p>
                <p className="text-xs text-muted-foreground">{exp.objective}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="lg:col-span-2">
          <h2 className="mb-2 flex items-center gap-2 border-b border-border pb-2 font-heading text-base">
            <Activity className="h-4 w-4" />
            Recent Telemetry ({mission.telemetry.length})
          </h2>
          {mission.telemetry.length === 0 ? (
            <p className="text-sm text-muted-foreground">No telemetry recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-4">Timestamp</th>
                    <th className="py-2 pr-4">Station</th>
                    <th className="py-2 pr-4">Altitude (km)</th>
                    <th className="py-2 pr-4">Velocity (km/s)</th>
                  </tr>
                </thead>
                <tbody>
                  {mission.telemetry.slice(0, 10).map((t) => (
                    <tr key={t.telemetryId} className="border-b border-border last:border-0">
                      <td className="py-2 pr-4">{new Date(t.timestamp).toLocaleString()}</td>
                      <td className="py-2 pr-4">{t.station.stationName}</td>
                      <td className="py-2 pr-4">{Number(t.altitude).toFixed(2)}</td>
                      <td className="py-2 pr-4">{Number(t.velocity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Link
            href={`/telemetry?missionId=${mission.missionId}`}
            className="mt-3 inline-block text-sm text-primary hover:underline"
          >
            View full telemetry explorer &rarr;
          </Link>
        </section>
      </div>
    </div>
  );
}
