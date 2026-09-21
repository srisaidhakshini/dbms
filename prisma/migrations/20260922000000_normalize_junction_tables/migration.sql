-- Mission: rename launch_vehicle_id -> vehicle_id (data preserved)
ALTER TABLE "missions" DROP CONSTRAINT "missions_launch_vehicle_id_fkey";
DROP INDEX "missions_launch_vehicle_id_idx";
ALTER TABLE "missions" RENAME COLUMN "launch_vehicle_id" TO "vehicle_id";
CREATE INDEX "missions_vehicle_id_idx" ON "missions"("vehicle_id");
ALTER TABLE "missions" ADD CONSTRAINT "missions_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "launch_vehicles"("vehicle_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Junction tables resolving the Spacecraft <-> Astronaut / Payload many-to-many relations
CREATE TABLE "spacecraft_astronauts" (
    "spacecraft_id" INTEGER NOT NULL,
    "astronaut_id" INTEGER NOT NULL,
    CONSTRAINT "spacecraft_astronauts_pkey" PRIMARY KEY ("spacecraft_id","astronaut_id")
);

CREATE TABLE "spacecraft_payloads" (
    "spacecraft_id" INTEGER NOT NULL,
    "payload_id" INTEGER NOT NULL,
    CONSTRAINT "spacecraft_payloads_pkey" PRIMARY KEY ("spacecraft_id","payload_id")
);

-- Carry over existing single-spacecraft assignments
INSERT INTO "spacecraft_astronauts" ("spacecraft_id", "astronaut_id")
SELECT "spacecraft_id", "astronaut_id" FROM "astronauts" WHERE "spacecraft_id" IS NOT NULL;

INSERT INTO "spacecraft_payloads" ("spacecraft_id", "payload_id")
SELECT "spacecraft_id", "payload_id" FROM "payloads" WHERE "spacecraft_id" IS NOT NULL;

-- Drop the old direct foreign keys
ALTER TABLE "astronauts" DROP CONSTRAINT "astronauts_spacecraft_id_fkey";
DROP INDEX "astronauts_spacecraft_id_idx";
ALTER TABLE "astronauts" DROP COLUMN "spacecraft_id";

ALTER TABLE "payloads" DROP CONSTRAINT "payloads_spacecraft_id_fkey";
DROP INDEX "payloads_spacecraft_id_idx";
ALTER TABLE "payloads" DROP COLUMN "spacecraft_id";

CREATE INDEX "spacecraft_astronauts_astronaut_id_idx" ON "spacecraft_astronauts"("astronaut_id");
CREATE INDEX "spacecraft_payloads_payload_id_idx" ON "spacecraft_payloads"("payload_id");

ALTER TABLE "spacecraft_astronauts" ADD CONSTRAINT "spacecraft_astronauts_spacecraft_id_fkey" FOREIGN KEY ("spacecraft_id") REFERENCES "spacecraft"("spacecraft_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "spacecraft_astronauts" ADD CONSTRAINT "spacecraft_astronauts_astronaut_id_fkey" FOREIGN KEY ("astronaut_id") REFERENCES "astronauts"("astronaut_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "spacecraft_payloads" ADD CONSTRAINT "spacecraft_payloads_spacecraft_id_fkey" FOREIGN KEY ("spacecraft_id") REFERENCES "spacecraft"("spacecraft_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "spacecraft_payloads" ADD CONSTRAINT "spacecraft_payloads_payload_id_fkey" FOREIGN KEY ("payload_id") REFERENCES "payloads"("payload_id") ON DELETE CASCADE ON UPDATE CASCADE;
