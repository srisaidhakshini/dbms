import type { Prisma } from "@prisma/client";

/** Include clause that loads a spacecraft's astronauts and payloads through the junction tables. */
export const spacecraftMembers = {
  astronauts: { include: { astronaut: true } },
  payloads: { include: { payload: true } },
} satisfies Prisma.SpacecraftInclude;

type WithMembers = Prisma.SpacecraftGetPayload<{ include: typeof spacecraftMembers }>;

/** Unwraps junction rows so clients see plain `astronauts[]` / `payloads[]` arrays. */
export function flattenSpacecraft<T extends WithMembers>(sc: T) {
  return {
    ...sc,
    astronauts: sc.astronauts.map((j) => j.astronaut),
    payloads: sc.payloads.map((j) => j.payload),
  };
}

/** Include clause that loads the spacecraft (with mission) an astronaut/payload is linked to. */
export const withSpacecraft = {
  spacecraft: { include: { spacecraft: { include: { mission: true } } } },
} as const;

/** Unwraps junction rows into `spacecraft: Spacecraft & { mission }[]`. */
export function flattenLinks<T extends { spacecraft: { spacecraft: unknown }[] }>(row: T) {
  return {
    ...row,
    spacecraft: row.spacecraft.map((j) => j.spacecraft) as T["spacecraft"][number]["spacecraft"][],
  };
}
