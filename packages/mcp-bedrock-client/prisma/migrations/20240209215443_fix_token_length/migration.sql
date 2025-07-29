-- AlterTable
ALTER TABLE `AuthorizationToken` MODIFY `accessToken` LONGTEXT NOT NULL,
    MODIFY `refreshToken` LONGTEXT NULL;
