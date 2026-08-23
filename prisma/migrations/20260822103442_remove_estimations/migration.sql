/*
  Warnings:

  - You are about to drop the `Estimation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EstimationItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EstimationItem";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Estimation";
PRAGMA foreign_keys=on;
