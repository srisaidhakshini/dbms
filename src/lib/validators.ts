import { z } from "zod";

export const missionStatusEnum = z.enum([
  "planned",
  "active",
  "completed",
  "aborted",
]);

export const agencySchema = z.object({
  agencyName: z.string().min(1, "Agency name is required"),
  country: z.string().min(1, "Country is required"),
  headquarters: z.string().min(1, "Headquarters is required"),
});

export const launchVehicleSchema = z.object({
  vehicleName: z.string().min(1, "Vehicle name is required"),
  manufacturer: z.string().min(1, "Manufacturer is required"),
});

export const missionSchema = z.object({
  missionName: z.string().min(1, "Mission name is required"),
  missionType: z.string().min(1, "Mission type is required"),
  launchDate: z.coerce.date(),
  status: missionStatusEnum,
  budget: z.coerce.number().nonnegative(),
  agencyId: z.coerce.number().int().positive(),
  vehicleId: z.coerce.number().int().positive(),
});

export const spacecraftSchema = z.object({
  name: z.string().min(1, "Name is required"),
  model: z.string().min(1, "Model is required"),
  crewCapacity: z.coerce.number().int().nonnegative(),
  missionId: z.coerce.number().int().positive(),
});

const spacecraftIdsSchema = z
  .array(z.coerce.number().int().positive())
  .default([])
  .transform((ids) => [...new Set(ids)]);

export const astronautSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nationality: z.string().min(1, "Nationality is required"),
  rank: z.string().min(1, "Rank is required"),
  spacecraftIds: spacecraftIdsSchema,
});

export const payloadSchema = z.object({
  payloadName: z.string().min(1, "Payload name is required"),
  payloadType: z.string().min(1, "Payload type is required"),
  weight: z.coerce.number().nonnegative(),
  spacecraftIds: spacecraftIdsSchema,
});

export const groundStationSchema = z.object({
  stationName: z.string().min(1, "Station name is required"),
  location: z.string().min(1, "Location is required"),
});

export const telemetrySchema = z.object({
  timestamp: z.coerce.date(),
  altitude: z.coerce.number(),
  velocity: z.coerce.number(),
  missionId: z.coerce.number().int().positive(),
  stationId: z.coerce.number().int().positive(),
});

export const experimentSchema = z.object({
  experimentName: z.string().min(1, "Experiment name is required"),
  objective: z.string().min(1, "Objective is required"),
  missionId: z.coerce.number().int().positive(),
});
