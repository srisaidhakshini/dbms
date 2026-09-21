import type { Astronaut, Mission, Payload, Prisma, Spacecraft } from "@prisma/client";

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
    experiments: true;
    telemetry: { include: { station: true } };
  };
}> & { spacecraft: SpacecraftMembers[] };

export type SpacecraftWithRelations = Prisma.SpacecraftGetPayload<{
  include: {
    mission: true;
    _count: { select: { astronauts: true; payloads: true } };
  };
}>;

// Astronauts/payloads reach a spacecraft through junction tables; the API flattens them.
export type SpacecraftMembers = Spacecraft & {
  astronauts: Astronaut[];
  payloads: Payload[];
};

export type SpacecraftDetail = SpacecraftMembers & { mission: Mission };

export type SpacecraftWithMission = Spacecraft & { mission: Mission };

export type AstronautWithRelations = Astronaut & { spacecraft: SpacecraftWithMission[] };

export type PayloadWithRelations = Payload & { spacecraft: SpacecraftWithMission[] };

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
