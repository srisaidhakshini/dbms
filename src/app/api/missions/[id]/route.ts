import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { missionSchema } from "@/lib/validators";
import { handleApiError, parseId } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const missionId = parseId((await params).id);
    const mission = await prisma.mission.findUniqueOrThrow({
      where: { missionId },
      include: {
        agency: true,
        launchVehicle: true,
        spacecraft: { include: { astronauts: true, payloads: true } },
        experiments: true,
        telemetry: { include: { station: true }, orderBy: { timestamp: "desc" } },
      },
    });
    return NextResponse.json(mission);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const missionId = parseId((await params).id);
    const body = missionSchema.parse(await req.json());
    const mission = await prisma.mission.update({
      where: { missionId },
      data: body,
    });
    return NextResponse.json(mission);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const missionId = parseId((await params).id);
    await prisma.mission.delete({ where: { missionId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
