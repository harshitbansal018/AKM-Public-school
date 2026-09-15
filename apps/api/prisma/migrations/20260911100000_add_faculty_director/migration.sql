-- AlterTable
-- Marks the staff member whose message shows as the MD's, beside the principal's.
-- Defaults to false, so every existing row stays exactly as it was.
ALTER TABLE `Faculty` ADD COLUMN `isDirector` BOOLEAN NOT NULL DEFAULT false;
