import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.telemetry.deleteMany();
  await prisma.experiment.deleteMany();
  await prisma.payload.deleteMany();
  await prisma.astronaut.deleteMany();
  await prisma.spacecraft.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.launchVehicle.deleteMany();
  await prisma.spaceAgency.deleteMany();
  await prisma.groundStation.deleteMany();
  await prisma.adminUser.deleteMany();

  const adminUsername = process.env.ADMIN_USERNAME ?? "admin";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.adminUser.create({
    data: { username: adminUsername, passwordHash },
  });

  const [nasa, esa, isro, _spacex, roscosmos] = await Promise.all([
    prisma.spaceAgency.create({
      data: {
        agencyName: "National Aeronautics and Space Administration",
        country: "United States",
        headquarters: "Washington, D.C.",
      },
    }),
    prisma.spaceAgency.create({
      data: {
        agencyName: "European Space Agency",
        country: "France",
        headquarters: "Paris",
      },
    }),
    prisma.spaceAgency.create({
      data: {
        agencyName: "Indian Space Research Organisation",
        country: "India",
        headquarters: "Bengaluru",
      },
    }),
    prisma.spaceAgency.create({
      data: {
        agencyName: "SpaceX",
        country: "United States",
        headquarters: "Hawthorne, California",
      },
    }),
    prisma.spaceAgency.create({
      data: {
        agencyName: "Roscosmos",
        country: "Russia",
        headquarters: "Moscow",
      },
    }),
  ]);

  const [falconHeavy, ariane6, gslvMkIII, starship, sls] = await Promise.all([
    prisma.launchVehicle.create({
      data: { vehicleName: "Falcon Heavy", manufacturer: "SpaceX" },
    }),
    prisma.launchVehicle.create({
      data: { vehicleName: "Ariane 6", manufacturer: "ArianeGroup" },
    }),
    prisma.launchVehicle.create({
      data: { vehicleName: "GSLV Mk III", manufacturer: "ISRO" },
    }),
    prisma.launchVehicle.create({
      data: { vehicleName: "Starship", manufacturer: "SpaceX" },
    }),
    prisma.launchVehicle.create({
      data: { vehicleName: "Space Launch System (SLS)", manufacturer: "NASA / Boeing" },
    }),
  ]);

  const [dsn1, dsn2, esoc, istrac, _baikonur] = await Promise.all([
    prisma.groundStation.create({
      data: { stationName: "Goldstone Deep Space Complex", location: "California, USA" },
    }),
    prisma.groundStation.create({
      data: { stationName: "Canberra Deep Space Complex", location: "Canberra, Australia" },
    }),
    prisma.groundStation.create({
      data: { stationName: "European Space Operations Centre", location: "Darmstadt, Germany" },
    }),
    prisma.groundStation.create({
      data: { stationName: "ISTRAC Ground Station", location: "Bengaluru, India" },
    }),
    prisma.groundStation.create({
      data: { stationName: "Baikonur Mission Control", location: "Baikonur, Kazakhstan" },
    }),
  ]);

  const artemisII = await prisma.mission.create({
    data: {
      missionName: "Artemis II",
      missionType: "Crewed Lunar Flyby",
      launchDate: new Date("2026-04-15"),
      status: "planned",
      budget: 4100000000,
      agencyId: nasa.agencyId,
      launchVehicleId: sls.vehicleId,
    },
  });

  const europaClipper = await prisma.mission.create({
    data: {
      missionName: "Europa Clipper",
      missionType: "Robotic Orbiter",
      launchDate: new Date("2024-10-14"),
      status: "active",
      budget: 5200000000,
      agencyId: nasa.agencyId,
      launchVehicleId: falconHeavy.vehicleId,
    },
  });

  const gaganyaan = await prisma.mission.create({
    data: {
      missionName: "Gaganyaan",
      missionType: "Crewed Orbital Mission",
      launchDate: new Date("2026-08-01"),
      status: "planned",
      budget: 1200000000,
      agencyId: isro.agencyId,
      launchVehicleId: gslvMkIII.vehicleId,
    },
  });

  const jwstServicing = await prisma.mission.create({
    data: {
      missionName: "JUICE",
      missionType: "Robotic Orbiter",
      launchDate: new Date("2023-04-14"),
      status: "active",
      budget: 1700000000,
      agencyId: esa.agencyId,
      launchVehicleId: ariane6.vehicleId,
    },
  });

  const marsSample = await prisma.mission.create({
    data: {
      missionName: "Mars Sample Return",
      missionType: "Robotic Sample Return",
      launchDate: new Date("2028-07-20"),
      status: "planned",
      budget: 7000000000,
      agencyId: nasa.agencyId,
      launchVehicleId: starship.vehicleId,
    },
  });

  const _luna25 = await prisma.mission.create({
    data: {
      missionName: "Luna 26",
      missionType: "Robotic Lunar Orbiter",
      launchDate: new Date("2027-02-10"),
      status: "planned",
      budget: 480000000,
      agencyId: roscosmos.agencyId,
      launchVehicleId: sls.vehicleId,
    },
  });

  const insight = await prisma.mission.create({
    data: {
      missionName: "InSight",
      missionType: "Robotic Lander",
      launchDate: new Date("2018-05-05"),
      status: "completed",
      budget: 830000000,
      agencyId: nasa.agencyId,
      launchVehicleId: falconHeavy.vehicleId,
    },
  });

  const _soyuzMS = await prisma.mission.create({
    data: {
      missionName: "Soyuz MS-24",
      missionType: "Crewed ISS Resupply",
      launchDate: new Date("2023-09-15"),
      status: "aborted",
      budget: 90000000,
      agencyId: roscosmos.agencyId,
      launchVehicleId: sls.vehicleId,
    },
  });

  const orionCraft = await prisma.spacecraft.create({
    data: {
      name: "Orion",
      model: "Orion MPCV Block 1",
      crewCapacity: 4,
      missionId: artemisII.missionId,
    },
  });

  const clipperCraft = await prisma.spacecraft.create({
    data: {
      name: "Europa Clipper Orbiter",
      model: "Clipper Bus",
      crewCapacity: 0,
      missionId: europaClipper.missionId,
    },
  });

  const gaganyaanCraft = await prisma.spacecraft.create({
    data: {
      name: "Gaganyaan Crew Module",
      model: "GCM-1",
      crewCapacity: 3,
      missionId: gaganyaan.missionId,
    },
  });

  const juiceCraft = await prisma.spacecraft.create({
    data: {
      name: "JUICE Orbiter",
      model: "JUICE Bus",
      crewCapacity: 0,
      missionId: jwstServicing.missionId,
    },
  });

  const perseveranceCraft = await prisma.spacecraft.create({
    data: {
      name: "Mars Ascent Vehicle",
      model: "MAV-1",
      crewCapacity: 0,
      missionId: marsSample.missionId,
    },
  });

  await Promise.all([
    prisma.astronaut.create({
      data: {
        name: "Reid Wiseman",
        nationality: "United States",
        rank: "Commander",
        spacecraftId: orionCraft.spacecraftId,
      },
    }),
    prisma.astronaut.create({
      data: {
        name: "Victor Glover",
        nationality: "United States",
        rank: "Pilot",
        spacecraftId: orionCraft.spacecraftId,
      },
    }),
    prisma.astronaut.create({
      data: {
        name: "Christina Koch",
        nationality: "United States",
        rank: "Mission Specialist",
        spacecraftId: orionCraft.spacecraftId,
      },
    }),
    prisma.astronaut.create({
      data: {
        name: "Jeremy Hansen",
        nationality: "Canada",
        rank: "Mission Specialist",
        spacecraftId: orionCraft.spacecraftId,
      },
    }),
    prisma.astronaut.create({
      data: {
        name: "Prashanth Balakrishnan Nair",
        nationality: "India",
        rank: "Group Captain",
        spacecraftId: gaganyaanCraft.spacecraftId,
      },
    }),
    prisma.astronaut.create({
      data: {
        name: "Angad Pratap",
        nationality: "India",
        rank: "Wing Commander",
        spacecraftId: gaganyaanCraft.spacecraftId,
      },
    }),
    prisma.astronaut.create({
      data: {
        name: "Ajit Krishnan",
        nationality: "India",
        rank: "Wing Commander",
        spacecraftId: gaganyaanCraft.spacecraftId,
      },
    }),
    prisma.astronaut.create({
      data: {
        name: "Shubhanshu Shukla",
        nationality: "India",
        rank: "Group Captain",
        spacecraftId: null,
      },
    }),
  ]);

  await Promise.all([
    prisma.payload.create({
      data: {
        payloadName: "Radiation Monitor",
        payloadType: "Scientific Instrument",
        weight: 45.2,
        spacecraftId: orionCraft.spacecraftId,
      },
    }),
    prisma.payload.create({
      data: {
        payloadName: "Europa Imaging System",
        payloadType: "Camera Suite",
        weight: 132.5,
        spacecraftId: clipperCraft.spacecraftId,
      },
    }),
    prisma.payload.create({
      data: {
        payloadName: "Mapping Imaging Spectrometer",
        payloadType: "Spectrometer",
        weight: 87.3,
        spacecraftId: clipperCraft.spacecraftId,
      },
    }),
    prisma.payload.create({
      data: {
        payloadName: "Vikram Lander Interface Module",
        payloadType: "Communications",
        weight: 60.0,
        spacecraftId: gaganyaanCraft.spacecraftId,
      },
    }),
    prisma.payload.create({
      data: {
        payloadName: "Submillimetre Wave Instrument",
        payloadType: "Spectrometer",
        weight: 21.7,
        spacecraftId: juiceCraft.spacecraftId,
      },
    }),
    prisma.payload.create({
      data: {
        payloadName: "Sample Collection Canister",
        payloadType: "Sample Return Container",
        weight: 15.4,
        spacecraftId: perseveranceCraft.spacecraftId,
      },
    }),
    prisma.payload.create({
      data: {
        payloadName: "Spare Docking Adapter",
        payloadType: "Hardware",
        weight: 33.9,
        spacecraftId: null,
      },
    }),
  ]);

  await Promise.all([
    prisma.experiment.create({
      data: {
        experimentName: "Lunar Radiation Shielding Study",
        objective: "Measure cumulative radiation exposure during trans-lunar flight.",
        missionId: artemisII.missionId,
      },
    }),
    prisma.experiment.create({
      data: {
        experimentName: "Europa Subsurface Ocean Survey",
        objective: "Characterize the ice shell and subsurface ocean of Europa via radar sounding.",
        missionId: europaClipper.missionId,
      },
    }),
    prisma.experiment.create({
      data: {
        experimentName: "Microgravity Crew Health Study",
        objective: "Assess cardiovascular adaptation of the crew during orbital flight.",
        missionId: gaganyaan.missionId,
      },
    }),
    prisma.experiment.create({
      data: {
        experimentName: "Ganymede Magnetosphere Mapping",
        objective: "Map the interaction between Ganymede's magnetic field and Jupiter's magnetosphere.",
        missionId: jwstServicing.missionId,
      },
    }),
    prisma.experiment.create({
      data: {
        experimentName: "Martian Regolith Sample Analysis",
        objective: "Analyze collected regolith samples for biosignatures prior to Earth return.",
        missionId: marsSample.missionId,
      },
    }),
    prisma.experiment.create({
      data: {
        experimentName: "Seismic Activity Monitoring",
        objective: "Record marsquake data to model the interior structure of Mars.",
        missionId: insight.missionId,
      },
    }),
  ]);

  const telemetryRows: {
    timestamp: Date;
    altitude: number;
    velocity: number;
    missionId: number;
    stationId: number;
  }[] = [];

  const missionStationPairs = [
    { mission: artemisII, station: dsn1 },
    { mission: artemisII, station: dsn2 },
    { mission: europaClipper, station: dsn1 },
    { mission: europaClipper, station: esoc },
    { mission: gaganyaan, station: istrac },
    { mission: jwstServicing, station: esoc },
    { mission: marsSample, station: dsn2 },
  ];

  const now = new Date();

  for (const { mission, station } of missionStationPairs) {
    let altitude = 500 + Math.random() * 2000;
    let velocity = 7.5 + Math.random() * 3;

    for (let i = 0; i < 12; i++) {
      altitude += (Math.random() - 0.3) * 40;
      velocity += (Math.random() - 0.5) * 0.3;

      telemetryRows.push({
        timestamp: new Date(now.getTime() - (12 - i) * 15 * 60 * 1000),
        altitude: Math.max(altitude, 100),
        velocity: Math.max(velocity, 1),
        missionId: mission.missionId,
        stationId: station.stationId,
      });
    }
  }

  await prisma.telemetry.createMany({ data: telemetryRows });

  console.log("Seed complete.");
  console.log(`Admin login -> username: "${adminUsername}", password: "${adminPassword}"`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
