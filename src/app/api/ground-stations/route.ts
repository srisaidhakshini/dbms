import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { groundStationSchema } from "@/lib/validators";
import { handleApiError } from "@/lib/api-helpers";

export async function GET() {
  const stations = await prisma.groundStation.findMany({
    orderBy: { stationName: "asc" },
    include: { _count: { select: { telemetry: true } } },
  });
  return NextResponse.json(stations);
}

export async function POST(req: NextRequest) {
  try {
    const body = groundStationSchema.parse(await req.json());
    const station = await prisma.groundStation.create({ data: body });
    return NextResponse.json(station, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
