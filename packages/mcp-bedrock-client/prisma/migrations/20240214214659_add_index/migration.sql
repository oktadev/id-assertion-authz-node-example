-- CreateIndex
CREATE INDEX `RequestLog_orgId_userId_requestedAt_idx` ON `RequestLog`(`orgId`, `userId`, `requestedAt` DESC);
