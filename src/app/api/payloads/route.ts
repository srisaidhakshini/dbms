import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { payloadSchema } from "@/lib/validators";
import { handleApiError } from "@/lib/api-helpers";

export async function GET() {
  const payloads = await prisma.payload.findMany({
    orderBy: { payloadName: "asc" },
    include: { spacecraft: { include: { mission: true } } },
  });
  return NextResponse.json(payloads);
}

export async function POST(req: NextRequest) {
  try {
    const body = payloadSchema.parse(await req.json());
    const payload = await prisma.payload.create({ data: body });
    return NextResponse.json(payload, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
