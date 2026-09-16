import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, parseId } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const missionId = parseId((await params).id);
    const experiments = await prisma.experiment.findMany({
      where: { missionId },
    });
    return NextResponse.json(experiments);
  } catch (error) {
    return handleApiError(error);
  }
}
