import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { missionSchema, missionStatusEnum } from "@/lib/validators";
import { handleApiError } from "@/lib/api-helpers";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agencyId = searchParams.get("agencyId");
  const status = searchParams.get("status");
  const missionType = searchParams.get("missionType");
  const search = searchParams.get("search");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Prisma.MissionWhereInput = {};

  if (agencyId) where.agencyId = Number(agencyId);
  if (missionType) where.missionType = missionType;
  if (search) where.missionName = { contains: search, mode: "insensitive" };

  const statusParsed = missionStatusEnum.safeParse(status);
  if (statusParsed.success) where.status = statusParsed.data;

  if (from || to) {
    where.launchDate = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  const missions = await prisma.mission.findMany({
    where,
    orderBy: { launchDate: "desc" },
    include: {
      agency: true,
      launchVehicle: true,
      _count: {
        select: { spacecraft: true, experiments: true, telemetry: true },
      },
    },
  });

  return NextResponse.json(missions);
}

export async function POST(req: NextRequest) {
  try {
    const body = missionSchema.parse(await req.json());
    const mission = await prisma.mission.create({ data: body });
    return NextResponse.json(mission, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
