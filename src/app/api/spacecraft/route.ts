import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { spacecraftSchema } from "@/lib/validators";
import { handleApiError } from "@/lib/api-helpers";

export async function GET() {
  const spacecraft = await prisma.spacecraft.findMany({
    orderBy: { name: "asc" },
    include: {
      mission: true,
      _count: { select: { astronauts: true, payloads: true } },
    },
  });
  return NextResponse.json(spacecraft);
}

export async function POST(req: NextRequest) {
  try {
    const body = spacecraftSchema.parse(await req.json());
    const spacecraft = await prisma.spacecraft.create({ data: body });
    return NextResponse.json(spacecraft, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
