import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { telemetrySchema } from "@/lib/validators";
import { handleApiError, parseId } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const telemetryId = parseId((await params).id);
    const telemetry = await prisma.telemetry.findUniqueOrThrow({
      where: { telemetryId },
      include: { mission: true, station: true },
    });
    return NextResponse.json(telemetry);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const telemetryId = parseId((await params).id);
    const body = telemetrySchema.parse(await req.json());
    const telemetry = await prisma.telemetry.update({
      where: { telemetryId },
      data: body,
    });
    return NextResponse.json(telemetry);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const telemetryId = parseId((await params).id);
    await prisma.telemetry.delete({ where: { telemetryId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
