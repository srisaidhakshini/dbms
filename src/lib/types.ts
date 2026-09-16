import type { Prisma } from "@prisma/client";

export type AgencyWithCount = Prisma.SpaceAgencyGetPayload<{
  include: { _count: { select: { missions: true } } };
}>;

export type LaunchVehicleWithCount = Prisma.LaunchVehicleGetPayload<{
  include: { _count: { select: { missions: true } } };
}>;

export type MissionWithRelations = Prisma.MissionGetPayload<{
  include: {
    agency: true;
    launchVehicle: true;
    _count: { select: { spacecraft: true; experiments: true; telemetry: true } };
  };
}>;

export type MissionDetail = Prisma.MissionGetPayload<{
  include: {
    agency: true;
    launchVehicle: true;
    spacecraft: { include: { astronauts: true; payloads: true } };
    experiments: true;
    telemetry: { include: { station: true } };
  };
}>;

export type SpacecraftWithRelations = Prisma.SpacecraftGetPayload<{
  include: {
    mission: true;
    _count: { select: { astronauts: true; payloads: true } };
  };
}>;

export type SpacecraftDetail = Prisma.SpacecraftGetPayload<{
  include: { mission: true; astronauts: true; payloads: true };
}>;

export type AstronautWithRelations = Prisma.AstronautGetPayload<{
  include: { spacecraft: { include: { mission: true } } };
}>;

export type PayloadWithRelations = Prisma.PayloadGetPayload<{
  include: { spacecraft: { include: { mission: true } } };
}>;

export type GroundStationWithCount = Prisma.GroundStationGetPayload<{
  include: { _count: { select: { telemetry: true } } };
}>;

export type TelemetryWithRelations = Prisma.TelemetryGetPayload<{
  include: { mission: true; station: true };
}>;

export type ExperimentWithRelations = Prisma.ExperimentGetPayload<{
  include: { mission: true };
}>;

export type DashboardData = {
  totalMissions: number;
  activeMissions: number;
  totalAgencies: number;
  astronautsInSpace: number;
  statusBreakdown: { status: string; count: number }[];
  recentTelemetry: TelemetryWithRelations[];
};
