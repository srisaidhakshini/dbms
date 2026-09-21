import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();

type Sample = { t: string; altitude: number; velocity: number };
// Real geocentric trajectories from NASA JPL Horizons (https://ssd.jpl.nasa.gov/horizons/).
// altitude = distance from Earth's centre minus 6,371 km; velocity = speed relative to Earth (km/s).
const trajectories = JSON.parse(
  readFileSync(join(__dirname, "telemetry-data.json"), "utf-8")
) as Record<string, Sample[]>;

async function main() {
  await prisma.telemetry.deleteMany();
  await prisma.experiment.deleteMany();
  await prisma.spacecraftPayload.deleteMany();
  await prisma.spacecraftAstronaut.deleteMany();
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
  await prisma.adminUser.create({ data: { username: adminUsername, passwordHash } });

  const agency = (agencyName: string, country: string, headquarters: string) =>
    prisma.spaceAgency.create({ data: { agencyName, country, headquarters } });
  const nasa = await agency("National Aeronautics and Space Administration", "United States", "Washington, D.C.");
  const esa = await agency("European Space Agency", "France", "Paris");
  const isro = await agency("Indian Space Research Organisation", "India", "Bengaluru");
  await agency("Roscosmos State Corporation for Space Activities", "Russia", "Moscow");
  await agency("Japan Aerospace Exploration Agency", "Japan", "Tokyo");
  await agency("China National Space Administration", "China", "Beijing");
  await agency("Canadian Space Agency", "Canada", "Saint-Hubert, Quebec");

  const vehicle = (vehicleName: string, manufacturer: string) =>
    prisma.launchVehicle.create({ data: { vehicleName, manufacturer } });
  const sls = await vehicle("Space Launch System Block 1", "Boeing");
  const falconHeavy = await vehicle("Falcon Heavy", "SpaceX");
  const falcon9 = await vehicle("Falcon 9", "SpaceX");
  const atlasV = await vehicle("Atlas V", "United Launch Alliance");
  const ariane5 = await vehicle("Ariane 5", "ArianeGroup");
  await vehicle("Ariane 6", "ArianeGroup");
  const lvm3 = await vehicle("LVM3", "Indian Space Research Organisation");
  const pslv = await vehicle("PSLV-XL", "Indian Space Research Organisation");

  const station = (stationName: string, location: string) =>
    prisma.groundStation.create({ data: { stationName, location } });
  const goldstone = await station("Goldstone Deep Space Communications Complex", "Barstow, California, USA");
  const madrid = await station("Madrid Deep Space Communications Complex", "Robledo de Chavela, Spain");
  const canberra = await station("Canberra Deep Space Communications Complex", "Tidbinbilla, Australia");
  const mila = await station("Merritt Island Launch Annex (MILA)", "Merritt Island, Florida, USA");
  const kourou = await station("ESTRACK Kourou", "Kourou, French Guiana");
  const newNorcia = await station("ESTRACK New Norcia", "New Norcia, Western Australia");
  const cebreros = await station("ESTRACK Cebreros", "Cebreros, Spain");
  const malargue = await station("ESTRACK Malargue", "Malargue, Argentina");
  const istrac = await station("ISRO Telemetry, Tracking and Command Network (ISTRAC)", "Bengaluru, India");

  // Budgets are approximate lifecycle / programme figures in USD.
  const mission = (
    missionName: string,
    missionType: string,
    launchDate: string,
    status: "planned" | "active" | "completed" | "aborted",
    budget: number,
    agencyId: number,
    vehicleId: number
  ) =>
    prisma.mission.create({
      data: { missionName, missionType, launchDate: new Date(launchDate), status, budget, agencyId, vehicleId },
    });

  const artemis1 = await mission("Artemis I", "Uncrewed Lunar Test Flight", "2022-11-16", "completed", 4_100_000_000, nasa.agencyId, sls.vehicleId);
  const artemis2 = await mission("Artemis II", "Crewed Lunar Flyby", "2026-04-01", "completed", 4_100_000_000, nasa.agencyId, sls.vehicleId);
  const clipper = await mission("Europa Clipper", "Robotic Orbiter", "2024-10-14", "active", 5_200_000_000, nasa.agencyId, falconHeavy.vehicleId);
  const mars2020 = await mission("Mars 2020 Perseverance", "Robotic Rover", "2020-07-30", "active", 2_700_000_000, nasa.agencyId, atlasV.vehicleId);
  const jwst = await mission("James Webb Space Telescope", "Space Observatory", "2021-12-25", "active", 10_000_000_000, nasa.agencyId, ariane5.vehicleId);
  const juice = await mission("JUICE", "Robotic Orbiter", "2023-04-14", "active", 1_700_000_000, esa.agencyId, ariane5.vehicleId);
  const chandrayaan3 = await mission("Chandrayaan-3", "Robotic Lunar Lander", "2023-07-14", "completed", 75_000_000, isro.agencyId, lvm3.vehicleId);
  const mom = await mission("Mars Orbiter Mission (Mangalyaan)", "Robotic Orbiter", "2013-11-05", "completed", 73_000_000, isro.agencyId, pslv.vehicleId);
  const cft = await mission("Boeing Crew Flight Test", "Crewed ISS Flight", "2024-06-05", "completed", 4_200_000_000, nasa.agencyId, atlasV.vehicleId);
  const crew9 = await mission("SpaceX Crew-9", "Crewed ISS Rotation", "2024-09-28", "completed", 220_000_000, nasa.agencyId, falcon9.vehicleId);

  const craft = (name: string, model: string, crewCapacity: number, missionId: number) =>
    prisma.spacecraft.create({ data: { name, model, crewCapacity, missionId } });
  const orion1 = await craft("Orion (Artemis I)", "Orion MPCV", 4, artemis1.missionId);
  const orion2 = await craft("Orion (Artemis II)", "Orion MPCV", 4, artemis2.missionId);
  await craft("Europa Clipper", "Europa Clipper Orbiter", 0, clipper.missionId);
  const perseverance = await craft("Perseverance", "Mars 2020 Rover", 0, mars2020.missionId);
  await craft("James Webb Space Telescope", "JWST Observatory", 0, jwst.missionId);
  await craft("JUICE", "Jupiter Icy Moons Explorer", 0, juice.missionId);
  const vikram = await craft("Vikram", "Chandrayaan-3 Lander Module", 0, chandrayaan3.missionId);
  const mangalyaan = await craft("Mangalyaan", "Mars Orbiter Mission Spacecraft", 0, mom.missionId);
  const calypso = await craft("Calypso", "Boeing CST-100 Starliner", 4, cft.missionId);
  const freedom = await craft("Freedom", "SpaceX Crew Dragon", 4, crew9.missionId);

  type Craft = { spacecraftId: number };
  const astronaut = (name: string, nationality: string, rank: string, ...crafts: Craft[]) =>
    prisma.astronaut.create({
      data: {
        name,
        nationality,
        rank,
        spacecraft: { create: crafts.map(({ spacecraftId }) => ({ spacecraftId })) },
      },
    });
  await astronaut("Reid Wiseman", "United States", "Commander", orion2);
  await astronaut("Victor Glover", "United States", "Pilot", orion2);
  await astronaut("Christina Koch", "United States", "Mission Specialist", orion2);
  await astronaut("Jeremy Hansen", "Canada", "Mission Specialist", orion2);
  // Wilmore and Williams launched on Starliner Calypso and returned on Crew Dragon Freedom (Crew-9).
  await astronaut('Barry "Butch" Wilmore', "United States", "Commander", calypso, freedom);
  await astronaut("Sunita Williams", "United States", "Pilot", calypso, freedom);
  await astronaut("Nick Hague", "United States", "Commander", freedom);
  await astronaut("Aleksandr Gorbunov", "Russia", "Mission Specialist", freedom);

  const payload = (payloadName: string, payloadType: string, weight: number, ...crafts: Craft[]) =>
    prisma.payload.create({
      data: {
        payloadName,
        payloadType,
        weight,
        spacecraft: { create: crafts.map(({ spacecraftId }) => ({ spacecraftId })) },
      },
    });
  await payload("MOXIE (Mars Oxygen In-Situ Resource Utilization Experiment)", "Technology Demonstration", 17.1, perseverance);
  await payload("Ingenuity Mars Helicopter", "Technology Demonstration", 1.8, perseverance);
  await payload("Pragyan Rover", "Rover", 26, vikram);
  await payload("Mars Orbiter Mission Science Payload (5 instruments)", "Scientific Instrument Suite", 15, mangalyaan);
  await payload("BioSentinel", "CubeSat", 14, orion1);
  await payload("NEA Scout", "CubeSat", 14, orion1);

  const experiment = (experimentName: string, objective: string, missionId: number) =>
    prisma.experiment.create({ data: { experimentName, objective, missionId } });
  await experiment("Matroshka AstroRad Radiation Experiment (MARE)", "Measure radiation exposure on two instrumented manikins and test the AstroRad protective vest during a lunar trajectory.", artemis1.missionId);
  await experiment("BioSentinel", "Study the effect of deep-space radiation on yeast DNA damage and repair.", artemis1.missionId);
  await experiment("REASON (Radar for Europa Assessment and Sounding)", "Sound Europa's ice shell to characterise its thickness and any subsurface water.", clipper.missionId);
  await experiment("MISE (Mapping Imaging Spectrometer for Europa)", "Map the composition of Europa's surface ices, salts and organics.", clipper.missionId);
  await experiment("MOXIE", "Demonstrate production of oxygen from the carbon dioxide in the Martian atmosphere.", mars2020.missionId);
  await experiment("SHERLOC", "Detect organic molecules and minerals on Martian rocks using fine-scale spectroscopy.", mars2020.missionId);
  await experiment("Exoplanet Transit Spectroscopy (WASP-39 b)", "Characterise the atmosphere of the hot gas giant WASP-39 b during transit.", jwst.missionId);
  await experiment("J-MAG Magnetometer", "Map Ganymede's magnetic field and its interaction with Jupiter's magnetosphere.", juice.missionId);
  await experiment("RIME (Radar for Icy Moons Exploration)", "Probe the subsurface structure of Ganymede's icy crust.", juice.missionId);
  await experiment("ChaSTE (Chandra's Surface Thermophysical Experiment)", "Measure the temperature profile of the lunar regolith near the south pole.", chandrayaan3.missionId);
  await experiment("APXS (Alpha Particle X-ray Spectrometer)", "Determine the elemental composition of lunar soil and rocks at the landing site.", chandrayaan3.missionId);
  await experiment("Methane Sensor for Mars (MSM)", "Search for methane in the Martian atmosphere.", mom.missionId);

  // Telemetry: sampled real trajectories. The first sample of each mission is attributed to the
  // launch-site network; the rest rotate across the mission's deep-space network complexes.
  type Station = { stationId: number };
  const networks: Record<string, { missionId: number; launch: Station; deep: Station[] }> = {
    art1: { missionId: artemis1.missionId, launch: mila, deep: [goldstone, madrid, canberra] },
    art2: { missionId: artemis2.missionId, launch: mila, deep: [goldstone, madrid, canberra] },
    clipper: { missionId: clipper.missionId, launch: mila, deep: [goldstone, madrid, canberra] },
    mars2020: { missionId: mars2020.missionId, launch: mila, deep: [goldstone, madrid, canberra] },
    jwst: { missionId: jwst.missionId, launch: kourou, deep: [goldstone, madrid, canberra] },
    juice: { missionId: juice.missionId, launch: kourou, deep: [newNorcia, cebreros, malargue] },
    mom: { missionId: mom.missionId, launch: istrac, deep: [istrac] },
  };

  const telemetryRows = Object.entries(networks).flatMap(([key, net]) =>
    (trajectories[key] ?? []).map((sample, i) => ({
      timestamp: new Date(sample.t),
      altitude: sample.altitude,
      velocity: sample.velocity,
      missionId: net.missionId,
      stationId: (i === 0 ? net.launch : net.deep[(i - 1) % net.deep.length]).stationId,
    }))
  );
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
