-- Homework can carry one downloadable file (worksheet, notes) for parents and students.
ALTER TABLE `Homework`
  ADD COLUMN `attachmentPath` VARCHAR(191) NULL,
  ADD COLUMN `attachmentName` VARCHAR(191) NULL,
  ADD COLUMN `attachmentSize` INTEGER NULL;
