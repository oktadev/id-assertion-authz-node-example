/*
  Warnings:

  - A unique constraint covering the columns `[auth_server_key]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Organization_auth_server_key_key` ON `Organization`(`auth_server_key`);
