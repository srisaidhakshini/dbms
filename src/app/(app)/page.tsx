"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Rocket, Building2, Users, Activity } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardData } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  planned: "var(--chart-3)",
  active: "var(--chart-1)",
  completed: "var(--chart-2)",
  aborted: "var(--chart-5)",
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/dashboard", { cache: "no-store" });
        const json = await res.json();
        if (!cancelled) setData(json);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    {
      label: "Total Missions",
      value: data?.totalMissions,
      icon: Rocket,
    },
    {
      label: "Active Missions",
      value: data?.activeMissions,
      icon: Activity,
    },
    {
      label: "Space Agencies",
      value: data?.totalAgencies,
      icon: Building2,
    },
    {
      label: "Astronauts in Space",
      value: data?.astronautsInSpace,
      icon: Users,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of active deep space missions and telemetry."
      />

      <dl className="mb-6 grid grid-cols-2 gap-x-6 gap-y-3 border-y border-border py-3 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <div>
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd>
                {loading ? (
                  <Skeleton className="mt-1 h-8 w-12" />
                ) : (
                  <span className="text-2xl font-semibold">{value ?? 0}</span>
                )}
              </dd>
            </div>
            <Icon className="h-6 w-6 text-primary" />
          </div>
        ))}
      </dl>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mission Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : !data || data.statusBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No mission data yet.</p>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.statusBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      dataKey="status"
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                      className="capitalize"
                    />
                    <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--popover)",
                        borderColor: "var(--border)",
                        color: "var(--popover-foreground)",
                      }}
                      labelStyle={{ color: "var(--popover-foreground)" }}
                      itemStyle={{ color: "var(--popover-foreground)" }}
                      cursor={{ fill: "var(--muted)", opacity: 0.3 }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {data.statusBreakdown.map((entry) => (
                        <Cell
                          key={entry.status}
                          fill={STATUS_COLORS[entry.status] ?? "var(--chart-4)"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Telemetry Feed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </>
            ) : !data || data.recentTelemetry.length === 0 ? (
              <p className="text-sm text-muted-foreground">No telemetry recorded yet.</p>
            ) : (
              data.recentTelemetry.slice(0, 6).map((t) => (
                <div
                  key={t.telemetryId}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{t.mission.missionName}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.station.stationName} &middot;{" "}
                      {new Date(t.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>{Number(t.altitude).toFixed(1)} km</p>
                    <p>{Number(t.velocity).toFixed(2)} km/s</p>
                  </div>
                </div>
              ))
            )}
            <Link
              href="/telemetry"
              className="inline-block pt-1 text-sm text-primary hover:underline"
            >
              Open telemetry explorer &rarr;
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
