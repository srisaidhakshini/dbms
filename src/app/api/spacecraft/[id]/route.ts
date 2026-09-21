import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { spacecraftSchema } from "@/lib/validators";
import { handleApiError, parseId } from "@/lib/api-helpers";
import { flattenSpacecraft, spacecraftMembers } from "@/lib/flatten";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const spacecraftId = parseId((await params).id);
    const spacecraft = await prisma.spacecraft.findUniqueOrThrow({
      where: { spacecraftId },
      include: { mission: true, ...spacecraftMembers },
    });
    return NextResponse.json(flattenSpacecraft(spacecraft));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const spacecraftId = parseId((await params).id);
    const body = spacecraftSchema.parse(await req.json());
    const spacecraft = await prisma.spacecraft.update({
      where: { spacecraftId },
      data: body,
    });
    return NextResponse.json(spacecraft);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const spacecraftId = parseId((await params).id);
    await prisma.spacecraft.delete({ where: { spacecraftId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
