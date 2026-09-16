"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/page-header";
import { ExportCsvButton } from "@/components/export-csv-button";
import { useApiList } from "@/hooks/use-api-list";
import type {
  GroundStationWithCount,
  MissionWithRelations,
  TelemetryWithRelations,
} from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";

const POLL_INTERVAL_MS = 10000;
const ALL = "all";

function TelemetryExplorer() {
  const searchParams = useSearchParams();
  const initialMissionId = searchParams.get("missionId") ?? ALL;

  const { data: missions } = useApiList<MissionWithRelations>("/api/missions");
  const { data: stations } = useApiList<GroundStationWithCount>("/api/ground-stations");

  const [missionFilter, setMissionFilter] = useState(initialMissionId);
  const [stationFilter, setStationFilter] = useState(ALL);
  const [telemetry, setTelemetry] = useState<TelemetryWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (missionFilter !== ALL) params.set("missionId", missionFilter);
    if (stationFilter !== ALL) params.set("stationId", stationFilter);

    try {
      const res = await fetch(`/api/telemetry?${params.toString()}`, {
        cache: "no-store",
      });
      const json = await res.json();
      setTelemetry(json);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, [missionFilter, stationFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load's setState calls run after an await, not synchronously during this effect
    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  const chartData = [...telemetry]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((t) => ({
      timestamp: new Date(t.timestamp).toLocaleTimeString(),
      altitude: Number(t.altitude),
      velocity: Number(t.velocity),
    }));

  return (
    <div>
      <PageHeader
        title="Telemetry Explorer"
        description="Live altitude and velocity readings across missions and ground stations."
        actions={
          <ExportCsvButton
            rows={telemetry}
            filename="telemetry.csv"
            columns={[
              { header: "Telemetry ID", accessor: (r) => r.telemetryId },
              {
                header: "Timestamp",
                accessor: (r) => new Date(r.timestamp).toISOString(),
              },
              { header: "Altitude (km)", accessor: (r) => String(r.altitude) },
              { header: "Velocity (km/s)", accessor: (r) => String(r.velocity) },
              { header: "Mission", accessor: (r) => r.mission.missionName },
              { header: "Ground Station", accessor: (r) => r.station.stationName },
            ]}
          />
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select value={missionFilter} onValueChange={(v) => setMissionFilter(v ?? ALL)}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="All missions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All missions</SelectItem>
            {missions.map((m) => (
              <SelectItem key={m.missionId} value={String(m.missionId)}>
                {m.missionName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={stationFilter} onValueChange={(v) => setStationFilter(v ?? ALL)}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="All ground stations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All ground stations</SelectItem>
            {stations.map((s) => (
              <SelectItem key={s.stationId} value={String(s.stationId)}>
                {s.stationName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="outline" className="text-xs font-normal">
          Auto-refreshing every {POLL_INTERVAL_MS / 1000}s
          {lastUpdated && ` · Last updated ${lastUpdated.toLocaleTimeString()}`}
        </Badge>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Altitude &amp; Velocity Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No telemetry data for the selected filters.
            </p>
          ) : (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="timestamp"
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                  />
                  <YAxis
                    yAxisId="altitude"
                    stroke="var(--chart-1)"
                    fontSize={12}
                    label={{ value: "Altitude (km)", angle: -90, position: "insideLeft" }}
                  />
                  <YAxis
                    yAxisId="velocity"
                    orientation="right"
                    stroke="var(--chart-2)"
                    fontSize={12}
                    label={{ value: "Velocity (km/s)", angle: 90, position: "insideRight" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      borderColor: "var(--border)",
                      color: "var(--popover-foreground)",
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="altitude"
                    type="monotone"
                    dataKey="altitude"
                    stroke="var(--chart-1)"
                    dot={false}
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="velocity"
                    type="monotone"
                    dataKey="velocity"
                    stroke="var(--chart-2)"
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Mission</TableHead>
                <TableHead>Ground Station</TableHead>
                <TableHead>Altitude (km)</TableHead>
                <TableHead>Velocity (km/s)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : telemetry.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No telemetry found.
                  </TableCell>
                </TableRow>
              ) : (
                telemetry.map((t) => (
                  <TableRow key={t.telemetryId}>
                    <TableCell>{new Date(t.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{t.mission.missionName}</TableCell>
                    <TableCell>{t.station.stationName}</TableCell>
                    <TableCell>{Number(t.altitude).toFixed(2)}</TableCell>
                    <TableCell>{Number(t.velocity).toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TelemetryPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Loading...</p>}>
      <TelemetryExplorer />
    </Suspense>
  );
}
