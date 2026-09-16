import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { launchVehicleSchema } from "@/lib/validators";
import { handleApiError, parseId } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const vehicleId = parseId((await params).id);
    const vehicle = await prisma.launchVehicle.findUniqueOrThrow({
      where: { vehicleId },
      include: { missions: true },
    });
    return NextResponse.json(vehicle);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const vehicleId = parseId((await params).id);
    const body = launchVehicleSchema.parse(await req.json());
    const vehicle = await prisma.launchVehicle.update({
      where: { vehicleId },
      data: body,
    });
    return NextResponse.json(vehicle);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const vehicleId = parseId((await params).id);
    await prisma.launchVehicle.delete({ where: { vehicleId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
