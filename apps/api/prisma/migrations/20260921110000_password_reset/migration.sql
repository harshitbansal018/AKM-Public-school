-- One-time password-reset tokens for admin, teacher and parent accounts.
CREATE TABLE `PasswordReset` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `kind` VARCHAR(191) NOT NULL,
  `accountId` INTEGER NOT NULL,
  `tokenHash` VARCHAR(191) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `usedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `PasswordReset_tokenHash_key`(`tokenHash`),
  INDEX `PasswordReset_kind_accountId_idx`(`kind`, `accountId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
