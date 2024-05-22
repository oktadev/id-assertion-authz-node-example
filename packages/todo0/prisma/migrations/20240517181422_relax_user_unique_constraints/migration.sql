/*
  Warnings:

  - A unique constraint covering the columns `[orgId,email,externalId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `User_email_key` ON `User`;

-- CreateIndex
CREATE UNIQUE INDEX `User_orgId_email_externalId_key` ON `User`(`orgId`, `email`, `externalId`);
