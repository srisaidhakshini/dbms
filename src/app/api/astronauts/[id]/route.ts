import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { astronautSchema } from "@/lib/validators";
import { handleApiError, parseId } from "@/lib/api-helpers";
import { flattenLinks, withSpacecraft } from "@/lib/flatten";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const astronautId = parseId((await params).id);
    const astronaut = await prisma.astronaut.findUniqueOrThrow({
      where: { astronautId },
      include: withSpacecraft,
    });
    return NextResponse.json(flattenLinks(astronaut));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const astronautId = parseId((await params).id);
    const { spacecraftIds, ...data } = astronautSchema.parse(await req.json());
    const astronaut = await prisma.astronaut.update({
      where: { astronautId },
      data: {
        ...data,
        spacecraft: {
          deleteMany: {},
          create: spacecraftIds.map((spacecraftId) => ({ spacecraftId })),
        },
      },
      include: withSpacecraft,
    });
    return NextResponse.json(flattenLinks(astronaut));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const astronautId = parseId((await params).id);
    await prisma.astronaut.delete({ where: { astronautId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
