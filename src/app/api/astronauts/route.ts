import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { astronautSchema } from "@/lib/validators";
import { handleApiError } from "@/lib/api-helpers";

export async function GET() {
  const astronauts = await prisma.astronaut.findMany({
    orderBy: { name: "asc" },
    include: { spacecraft: { include: { mission: true } } },
  });
  return NextResponse.json(astronauts);
}

export async function POST(req: NextRequest) {
  try {
    const body = astronautSchema.parse(await req.json());
    const astronaut = await prisma.astronaut.create({ data: body });
    return NextResponse.json(astronaut, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
