-- AlterTable
-- Nullable, so the enquiries already in the table stay valid.
ALTER TABLE `Enquiry` ADD COLUMN `address` TEXT NULL;
