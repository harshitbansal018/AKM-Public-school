-- Teacher-portal sign-in lives on the Faculty row itself.
ALTER TABLE `Faculty`
  ADD COLUMN `accountEmail` VARCHAR(191) NULL,
  ADD COLUMN `passwordHash` VARCHAR(191) NULL,
  ADD COLUMN `teacherAccess` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `assignedClasses` LONGTEXT NULL,
  ADD UNIQUE INDEX `Faculty_accountEmail_key` (`accountEmail`);
