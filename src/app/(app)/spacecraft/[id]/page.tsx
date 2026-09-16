"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Package } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { SpacecraftDetail } from "@/lib/types";

export default function SpacecraftDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [spacecraft, setSpacecraft] = useState<SpacecraftDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/spacecraft/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Spacecraft not found");
        const json = await res.json();
        if (!cancelled) setSpacecraft(json);
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
      </div>
    );
  }

  if (error || !spacecraft) {
    return (
      <div>
        <p className="text-destructive">{error ?? "Spacecraft not found"}</p>
        <Link href="/spacecraft" className="mt-4 inline-block">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to spacecraft
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/spacecraft"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to spacecraft
      </Link>

      <PageHeader
        title={spacecraft.name}
        description={`${spacecraft.model} · Part of `}
        actions={
          <Link
            href={`/missions/${spacecraft.missionId}`}
            className="text-sm text-primary hover:underline"
          >
            {spacecraft.mission.missionName}
          </Link>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Model</p>
            <p className="font-medium">{spacecraft.model}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Crew Capacity</p>
            <p className="font-medium">{spacecraft.crewCapacity}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Mission</p>
            <p className="font-medium">{spacecraft.mission.missionName}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Astronauts ({spacecraft.astronauts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {spacecraft.astronauts.length === 0 && (
              <p className="text-sm text-muted-foreground">No astronauts assigned.</p>
            )}
            {spacecraft.astronauts.map((a) => (
              <div key={a.astronautId} className="rounded-md border border-border p-3">
                <p className="font-medium">{a.name}</p>
                <p className="text-xs text-muted-foreground">
                  {a.rank} &middot; {a.nationality}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4" />
              Payloads ({spacecraft.payloads.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {spacecraft.payloads.length === 0 && (
              <p className="text-sm text-muted-foreground">No payloads assigned.</p>
            )}
            {spacecraft.payloads.map((p) => (
              <div key={p.payloadId} className="rounded-md border border-border p-3">
                <p className="font-medium">{p.payloadName}</p>
                <p className="text-xs text-muted-foreground">
                  {p.payloadType} &middot; {Number(p.weight).toFixed(1)} kg
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
