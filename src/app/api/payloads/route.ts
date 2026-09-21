import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { payloadSchema } from "@/lib/validators";
import { handleApiError } from "@/lib/api-helpers";
import { flattenLinks, withSpacecraft } from "@/lib/flatten";

export async function GET() {
  const payloads = await prisma.payload.findMany({
    orderBy: { payloadName: "asc" },
    include: withSpacecraft,
  });
  return NextResponse.json(payloads.map(flattenLinks));
}

export async function POST(req: NextRequest) {
  try {
    const { spacecraftIds, ...data } = payloadSchema.parse(await req.json());
    const payload = await prisma.payload.create({
      data: {
        ...data,
        spacecraft: { create: spacecraftIds.map((spacecraftId) => ({ spacecraftId })) },
      },
      include: withSpacecraft,
    });
    return NextResponse.json(flattenLinks(payload), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
