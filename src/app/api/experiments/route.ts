import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { experimentSchema } from "@/lib/validators";
import { handleApiError } from "@/lib/api-helpers";

export async function GET() {
  const experiments = await prisma.experiment.findMany({
    orderBy: { experimentName: "asc" },
    include: { mission: true },
  });
  return NextResponse.json(experiments);
}

export async function POST(req: NextRequest) {
  try {
    const body = experimentSchema.parse(await req.json());
    const experiment = await prisma.experiment.create({ data: body });
    return NextResponse.json(experiment, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
