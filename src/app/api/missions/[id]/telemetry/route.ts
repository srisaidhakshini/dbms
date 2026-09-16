import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, parseId } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const missionId = parseId((await params).id);
    const { searchParams } = new URL(req.url);
    const stationId = searchParams.get("stationId");

    const telemetry = await prisma.telemetry.findMany({
      where: {
        missionId,
        ...(stationId ? { stationId: Number(stationId) } : {}),
      },
      include: { station: true, mission: true },
      orderBy: { timestamp: "asc" },
    });

    return NextResponse.json(telemetry);
  } catch (error) {
    return handleApiError(error);
  }
}
