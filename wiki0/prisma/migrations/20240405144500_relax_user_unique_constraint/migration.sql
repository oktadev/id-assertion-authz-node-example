/*
  Warnings:

  - A unique constraint covering the columns `[email,orgId,externalId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `User_email_key` ON `User`;

-- CreateIndex
CREATE UNIQUE INDEX `User_email_orgId_externalId_key` ON `User`(`email`, `orgId`, `externalId`);
