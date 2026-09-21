import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, parseId } from "@/lib/api-helpers";
import { flattenSpacecraft, spacecraftMembers } from "@/lib/flatten";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const missionId = parseId((await params).id);
    const spacecraft = await prisma.spacecraft.findMany({
      where: { missionId },
      include: spacecraftMembers,
    });
    return NextResponse.json(spacecraft.map(flattenSpacecraft));
  } catch (error) {
    return handleApiError(error);
  }
}
