import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { telemetrySchema } from "@/lib/validators";
import { handleApiError } from "@/lib/api-helpers";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const missionId = searchParams.get("missionId");
  const stationId = searchParams.get("stationId");
  const limit = searchParams.get("limit");

  const where: Prisma.TelemetryWhereInput = {};
  if (missionId) where.missionId = Number(missionId);
  if (stationId) where.stationId = Number(stationId);

  const telemetry = await prisma.telemetry.findMany({
    where,
    orderBy: { timestamp: "desc" },
    include: { mission: true, station: true },
    take: limit ? Number(limit) : undefined,
  });

  return NextResponse.json(telemetry);
}

export async function POST(req: NextRequest) {
  try {
    const body = telemetrySchema.parse(await req.json());
    const telemetry = await prisma.telemetry.create({ data: body });
    return NextResponse.json(telemetry, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
