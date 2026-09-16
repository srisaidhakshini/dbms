import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError(error.issues.map((i) => i.message).join(", "), 400);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return jsonError("Record not found", 404);
    }
    if (error.code === "P2003") {
      return jsonError(
        "This operation violates a foreign key relationship (related record missing or still referenced).",
        409
      );
    }
    if (error.code === "P2002") {
      return jsonError("A record with this value already exists.", 409);
    }
  }

  console.error(error);
  return jsonError("Internal server error", 500);
}

export function parseId(id: string) {
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error("Invalid id");
  }
  return parsed;
}
