"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Rocket, Users, Package, FlaskConical, Activity } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Agency</p>
            <p className="font-medium">{mission.agency.agencyName}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Launch Vehicle</p>
            <p className="font-medium">{mission.launchVehicle.vehicleName}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Launch Date</p>
            <p className="font-medium">
              {new Date(mission.launchDate).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Budget</p>
            <p className="font-medium">${Number(mission.budget).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Rocket className="h-4 w-4" />
              Spacecraft ({mission.spacecraft.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mission.spacecraft.length === 0 && (
              <p className="text-sm text-muted-foreground">No spacecraft assigned.</p>
            )}
            {mission.spacecraft.map((sc) => (
              <div key={sc.spacecraftId} className="rounded-md border border-border p-3">
                <Link
                  href={`/spacecraft/${sc.spacecraftId}`}
                  className="font-medium hover:underline"
                >
                  {sc.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {sc.model} &middot; Crew capacity {sc.crewCapacity}
                </p>
                <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" /> {sc.astronauts.length} astronauts
                  </span>
                  <span className="flex items-center gap-1">
                    <Package className="h-3 w-3" /> {sc.payloads.length} payloads
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FlaskConical className="h-4 w-4" />
              Experiments ({mission.experiments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mission.experiments.length === 0 && (
              <p className="text-sm text-muted-foreground">No experiments recorded.</p>
            )}
            {mission.experiments.map((exp) => (
              <div key={exp.experimentId} className="rounded-md border border-border p-3">
                <p className="font-medium">{exp.experimentName}</p>
                <p className="text-xs text-muted-foreground">{exp.objective}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" />
              Recent Telemetry ({mission.telemetry.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                        <td className="py-2 pr-4">
                          {new Date(t.timestamp).toLocaleString()}
                        </td>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
