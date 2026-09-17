-- The Careers form collects the applicant's education and experience, takes a
-- CV, and hands back a reference number.
ALTER TABLE `JobApplication`
  ADD COLUMN `reference` VARCHAR(191) NULL,
  ADD COLUMN `subject` VARCHAR(191) NULL,
  ADD COLUMN `qualification` VARCHAR(191) NULL,
  ADD COLUMN `experience` VARCHAR(191) NULL,
  ADD COLUMN `currentSchool` VARCHAR(191) NULL,
  ADD COLUMN `address` TEXT NULL,
  ADD COLUMN `resumePath` VARCHAR(191) NULL,
  ADD COLUMN `resumeName` VARCHAR(191) NULL,
  ADD UNIQUE INDEX `JobApplication_reference_key` (`reference`);

-- Statuses follow the school's review flow.
UPDATE `JobApplication` SET `status` = 'UNDER_REVIEW' WHERE `status` = 'REVIEWING';
UPDATE `JobApplication` SET `status` = 'REJECTED' WHERE `status` = 'CLOSED';
