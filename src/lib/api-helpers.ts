import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export class InvalidIdError extends Error {}

const FK_VIOLATION_MESSAGE =
  "This operation violates a foreign key relationship (related record missing or still referenced).";

// Postgres error codes for a foreign key violation: 23503 (foreign_key_violation) and 23001
// (restrict_violation, raised specifically by ON DELETE/UPDATE RESTRICT constraints). Prisma maps
// some but not all of these to its own P2003 code, so both the known-error and the raw-driver
// shapes need to be checked.
const PG_FK_VIOLATION_CODES = ["23503", "23001"];

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError(error.issues.map((i) => i.message).join(", "), 400);
  }

  if (error instanceof InvalidIdError) {
    return jsonError("Invalid id", 400);
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return jsonError("Record not found", 404);
    }
    if (error.code === "P2003") {
      return jsonError(FK_VIOLATION_MESSAGE, 409);
    }
    if (error.code === "P2002") {
      return jsonError("A record with this value already exists.", 409);
    }
  }

  if (
    error instanceof Prisma.PrismaClientUnknownRequestError &&
    PG_FK_VIOLATION_CODES.some((code) => error.message.includes(`"${code}"`))
  ) {
    return jsonError(FK_VIOLATION_MESSAGE, 409);
  }

  console.error(error);
  return jsonError("Internal server error", 500);
}

export function parseId(id: string) {
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new InvalidIdError("Invalid id");
  }
  return parsed;
}
