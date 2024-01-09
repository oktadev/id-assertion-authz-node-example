/*
  Warnings:

  - A unique constraint covering the columns `[orgId,userId,resource]` on the table `AuthorizationToken` will be added. If there are existing duplicate values, this will fail.

*/

-- CreateIndex
CREATE UNIQUE INDEX `AuthorizationToken_orgId_userId_resource_key` ON `AuthorizationToken`(`orgId`, `userId`, `resource`);
