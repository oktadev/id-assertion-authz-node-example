/*
  Warnings:

  - Added the required column `orgId` to the `AuthorizationToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `AuthorizationToken` ADD COLUMN `orgId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `AuthorizationToken` ADD CONSTRAINT `AuthorizationToken_orgId_fkey` FOREIGN KEY (`orgId`) REFERENCES `Organization`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
