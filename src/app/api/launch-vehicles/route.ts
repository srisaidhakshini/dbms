import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { launchVehicleSchema } from "@/lib/validators";
import { handleApiError } from "@/lib/api-helpers";

export async function GET() {
  const vehicles = await prisma.launchVehicle.findMany({
    orderBy: { vehicleName: "asc" },
    include: { _count: { select: { missions: true } } },
  });
  return NextResponse.json(vehicles);
}

export async function POST(req: NextRequest) {
  try {
    const body = launchVehicleSchema.parse(await req.json());
    const vehicle = await prisma.launchVehicle.create({ data: body });
    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
