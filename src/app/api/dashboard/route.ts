import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [
    totalMissions,
    activeMissions,
    totalAgencies,
    astronautsInSpace,
    statusBreakdown,
    recentTelemetry,
  ] = await Promise.all([
    prisma.mission.count(),
    prisma.mission.count({ where: { status: "active" } }),
    prisma.spaceAgency.count(),
    prisma.astronaut.count({
      where: { spacecraft: { some: { spacecraft: { mission: { status: "active" } } } } },
    }),
    prisma.mission.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.telemetry.findMany({
      take: 10,
      orderBy: { timestamp: "desc" },
      include: { mission: true, station: true },
    }),
  ]);

  return NextResponse.json({
    totalMissions,
    activeMissions,
    totalAgencies,
    astronautsInSpace,
    statusBreakdown: statusBreakdown.map((s) => ({
      status: s.status,
      count: s._count.status,
    })),
    recentTelemetry,
  });
}
