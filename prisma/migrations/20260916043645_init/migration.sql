-- CreateEnum
CREATE TYPE "mission_status" AS ENUM ('planned', 'active', 'completed', 'aborted');

-- CreateTable
CREATE TABLE "space_agencies" (
    "agency_id" SERIAL NOT NULL,
    "agency_name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "headquarters" TEXT NOT NULL,

    CONSTRAINT "space_agencies_pkey" PRIMARY KEY ("agency_id")
);

-- CreateTable
CREATE TABLE "launch_vehicles" (
    "vehicle_id" SERIAL NOT NULL,
    "vehicle_name" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,

    CONSTRAINT "launch_vehicles_pkey" PRIMARY KEY ("vehicle_id")
);

-- CreateTable
CREATE TABLE "missions" (
    "mission_id" SERIAL NOT NULL,
    "mission_name" TEXT NOT NULL,
    "mission_type" TEXT NOT NULL,
    "launch_date" TIMESTAMP(3) NOT NULL,
    "status" "mission_status" NOT NULL DEFAULT 'planned',
    "budget" DECIMAL(14,2) NOT NULL,
    "agency_id" INTEGER NOT NULL,
    "launch_vehicle_id" INTEGER NOT NULL,

    CONSTRAINT "missions_pkey" PRIMARY KEY ("mission_id")
);

-- CreateTable
CREATE TABLE "spacecraft" (
    "spacecraft_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "crew_capacity" INTEGER NOT NULL,
    "mission_id" INTEGER NOT NULL,

    CONSTRAINT "spacecraft_pkey" PRIMARY KEY ("spacecraft_id")
);

-- CreateTable
CREATE TABLE "astronauts" (
    "astronaut_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "rank" TEXT NOT NULL,
    "spacecraft_id" INTEGER,

    CONSTRAINT "astronauts_pkey" PRIMARY KEY ("astronaut_id")
);

-- CreateTable
CREATE TABLE "payloads" (
    "payload_id" SERIAL NOT NULL,
    "payload_name" TEXT NOT NULL,
    "payload_type" TEXT NOT NULL,
    "weight" DECIMAL(10,2) NOT NULL,
    "spacecraft_id" INTEGER,

    CONSTRAINT "payloads_pkey" PRIMARY KEY ("payload_id")
);

-- CreateTable
CREATE TABLE "ground_stations" (
    "station_id" SERIAL NOT NULL,
    "station_name" TEXT NOT NULL,
    "location" TEXT NOT NULL,

    CONSTRAINT "ground_stations_pkey" PRIMARY KEY ("station_id")
);

-- CreateTable
CREATE TABLE "telemetry" (
    "telemetry_id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "altitude" DECIMAL(12,3) NOT NULL,
    "velocity" DECIMAL(12,3) NOT NULL,
    "mission_id" INTEGER NOT NULL,
    "station_id" INTEGER NOT NULL,

    CONSTRAINT "telemetry_pkey" PRIMARY KEY ("telemetry_id")
);

-- CreateTable
CREATE TABLE "experiments" (
    "experiment_id" SERIAL NOT NULL,
    "experiment_name" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "mission_id" INTEGER NOT NULL,

    CONSTRAINT "experiments_pkey" PRIMARY KEY ("experiment_id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "missions_agency_id_idx" ON "missions"("agency_id");

-- CreateIndex
CREATE INDEX "missions_launch_vehicle_id_idx" ON "missions"("launch_vehicle_id");

-- CreateIndex
CREATE INDEX "spacecraft_mission_id_idx" ON "spacecraft"("mission_id");

-- CreateIndex
CREATE INDEX "astronauts_spacecraft_id_idx" ON "astronauts"("spacecraft_id");

-- CreateIndex
CREATE INDEX "payloads_spacecraft_id_idx" ON "payloads"("spacecraft_id");

-- CreateIndex
CREATE INDEX "telemetry_mission_id_idx" ON "telemetry"("mission_id");

-- CreateIndex
CREATE INDEX "telemetry_station_id_idx" ON "telemetry"("station_id");

-- CreateIndex
CREATE INDEX "experiments_mission_id_idx" ON "experiments"("mission_id");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_username_key" ON "admin_users"("username");

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_agency_id_fkey" FOREIGN KEY ("agency_id") REFERENCES "space_agencies"("agency_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "missions" ADD CONSTRAINT "missions_launch_vehicle_id_fkey" FOREIGN KEY ("launch_vehicle_id") REFERENCES "launch_vehicles"("vehicle_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spacecraft" ADD CONSTRAINT "spacecraft_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "missions"("mission_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "astronauts" ADD CONSTRAINT "astronauts_spacecraft_id_fkey" FOREIGN KEY ("spacecraft_id") REFERENCES "spacecraft"("spacecraft_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payloads" ADD CONSTRAINT "payloads_spacecraft_id_fkey" FOREIGN KEY ("spacecraft_id") REFERENCES "spacecraft"("spacecraft_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telemetry" ADD CONSTRAINT "telemetry_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "missions"("mission_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telemetry" ADD CONSTRAINT "telemetry_station_id_fkey" FOREIGN KEY ("station_id") REFERENCES "ground_stations"("station_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiments" ADD CONSTRAINT "experiments_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "missions"("mission_id") ON DELETE CASCADE ON UPDATE CASCADE;
