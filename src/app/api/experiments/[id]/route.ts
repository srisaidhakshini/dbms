import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { experimentSchema } from "@/lib/validators";
import { handleApiError, parseId } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const experimentId = parseId((await params).id);
    const experiment = await prisma.experiment.findUniqueOrThrow({
      where: { experimentId },
      include: { mission: true },
    });
    return NextResponse.json(experiment);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const experimentId = parseId((await params).id);
    const body = experimentSchema.parse(await req.json());
    const experiment = await prisma.experiment.update({
      where: { experimentId },
      data: body,
    });
    return NextResponse.json(experiment);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const experimentId = parseId((await params).id);
    await prisma.experiment.delete({ where: { experimentId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
