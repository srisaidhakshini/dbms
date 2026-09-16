import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { agencySchema } from "@/lib/validators";
import { handleApiError } from "@/lib/api-helpers";

export async function GET() {
  const agencies = await prisma.spaceAgency.findMany({
    orderBy: { agencyName: "asc" },
    include: { _count: { select: { missions: true } } },
  });
  return NextResponse.json(agencies);
}

export async function POST(req: NextRequest) {
  try {
    const body = agencySchema.parse(await req.json());
    const agency = await prisma.spaceAgency.create({ data: body });
    return NextResponse.json(agency, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
