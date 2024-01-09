/*
  Warnings:

  - You are about to drop the column `authorization_endpoint` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `client_id` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `client_secret` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `issuer` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `token_endpoint` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `userinfo_endpoint` on the `Organization` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Organization` DROP COLUMN `authorization_endpoint`,
    DROP COLUMN `client_id`,
    DROP COLUMN `client_secret`,
    DROP COLUMN `issuer`,
    DROP COLUMN `token_endpoint`,
    DROP COLUMN `userinfo_endpoint`,
    ADD COLUMN `auth_server_key` VARCHAR(191) NOT NULL DEFAULT '';
