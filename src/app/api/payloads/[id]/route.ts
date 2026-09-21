import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { payloadSchema } from "@/lib/validators";
import { handleApiError, parseId } from "@/lib/api-helpers";
import { flattenLinks, withSpacecraft } from "@/lib/flatten";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const payloadId = parseId((await params).id);
    const payload = await prisma.payload.findUniqueOrThrow({
      where: { payloadId },
      include: withSpacecraft,
    });
    return NextResponse.json(flattenLinks(payload));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const payloadId = parseId((await params).id);
    const { spacecraftIds, ...data } = payloadSchema.parse(await req.json());
    const payload = await prisma.payload.update({
      where: { payloadId },
      data: {
        ...data,
        spacecraft: {
          deleteMany: {},
          create: spacecraftIds.map((spacecraftId) => ({ spacecraftId })),
        },
      },
      include: withSpacecraft,
    });
    return NextResponse.json(flattenLinks(payload));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const payloadId = parseId((await params).id);
    await prisma.payload.delete({ where: { payloadId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
