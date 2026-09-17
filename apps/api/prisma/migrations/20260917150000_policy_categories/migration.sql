-- Policies are filed under the categories in the client's brief.
ALTER TABLE `Policy` ADD COLUMN `category` VARCHAR(191) NOT NULL DEFAULT 'RULES';
CREATE INDEX `Policy_category_status_idx` ON `Policy`(`category`, `status`);
