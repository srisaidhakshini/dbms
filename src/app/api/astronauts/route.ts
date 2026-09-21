import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { astronautSchema } from "@/lib/validators";
import { handleApiError } from "@/lib/api-helpers";
import { flattenLinks, withSpacecraft } from "@/lib/flatten";

export async function GET() {
  const astronauts = await prisma.astronaut.findMany({
    orderBy: { name: "asc" },
    include: withSpacecraft,
  });
  return NextResponse.json(astronauts.map(flattenLinks));
}

export async function POST(req: NextRequest) {
  try {
    const { spacecraftIds, ...data } = astronautSchema.parse(await req.json());
    const astronaut = await prisma.astronaut.create({
      data: {
        ...data,
        spacecraft: { create: spacecraftIds.map((spacecraftId) => ({ spacecraftId })) },
      },
      include: withSpacecraft,
    });
    return NextResponse.json(flattenLinks(astronaut), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
