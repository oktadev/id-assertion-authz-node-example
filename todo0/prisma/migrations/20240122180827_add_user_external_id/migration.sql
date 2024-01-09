/*
  Warnings:

  - A unique constraint covering the columns `[orgId,externalId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `externalId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_orgId_externalId_key` ON `User`(`orgId`, `externalId`);
