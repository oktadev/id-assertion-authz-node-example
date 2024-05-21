/*
  Warnings:

  - Added the required column `orgId` to the `Todo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Organization` ADD COLUMN `authorization_endpoint` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `client_id` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `client_secret` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `issuer` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `token_endpoint` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `userinfo_endpoint` VARCHAR(191) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `Todo` ADD COLUMN `orgId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `orgId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Todo` ADD CONSTRAINT `Todo_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
