import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { groundStationSchema } from "@/lib/validators";
import { handleApiError, parseId } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const stationId = parseId((await params).id);
    const station = await prisma.groundStation.findUniqueOrThrow({
      where: { stationId },
      include: { telemetry: true },
    });
    return NextResponse.json(station);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const stationId = parseId((await params).id);
    const body = groundStationSchema.parse(await req.json());
    const station = await prisma.groundStation.update({
      where: { stationId },
      data: body,
    });
    return NextResponse.json(station);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const stationId = parseId((await params).id);
    await prisma.groundStation.delete({ where: { stationId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
