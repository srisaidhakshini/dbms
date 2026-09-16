import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { agencySchema } from "@/lib/validators";
import { handleApiError, parseId } from "@/lib/api-helpers";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const agencyId = parseId((await params).id);
    const agency = await prisma.spaceAgency.findUniqueOrThrow({
      where: { agencyId },
      include: { missions: true },
    });
    return NextResponse.json(agency);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const agencyId = parseId((await params).id);
    const body = agencySchema.parse(await req.json());
    const agency = await prisma.spaceAgency.update({
      where: { agencyId },
      data: body,
    });
    return NextResponse.json(agency);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const agencyId = parseId((await params).id);
    await prisma.spaceAgency.delete({ where: { agencyId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
