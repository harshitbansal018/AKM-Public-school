-- Parent-portal accounts, linked to students. Results and fees gain a real
-- link to the student (the name/class columns stay as a display copy).
CREATE TABLE `Parent` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NULL,
  `passwordHash` VARCHAR(191) NOT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `lastLoginAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `Parent_email_key`(`email`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Student` ADD COLUMN `parentId` INTEGER NULL;
CREATE INDEX `Student_parentId_idx` ON `Student`(`parentId`);
ALTER TABLE `Student` ADD CONSTRAINT `Student_parentId_fkey`
  FOREIGN KEY (`parentId`) REFERENCES `Parent`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `Result` ADD COLUMN `studentId` INTEGER NULL;
CREATE INDEX `Result_studentId_idx` ON `Result`(`studentId`);
ALTER TABLE `Result` ADD CONSTRAINT `Result_studentId_fkey`
  FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE `FeeRecord`
  ADD COLUMN `studentId` INTEGER NULL,
  ADD COLUMN `paidAmount` DECIMAL(10, 2) NOT NULL DEFAULT 0;
CREATE INDEX `FeeRecord_studentId_idx` ON `FeeRecord`(`studentId`);
ALTER TABLE `FeeRecord` ADD CONSTRAINT `FeeRecord_studentId_fkey`
  FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
