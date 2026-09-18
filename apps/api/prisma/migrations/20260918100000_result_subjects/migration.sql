-- Subject-wise marks: one result row per student, examination and subject.
ALTER TABLE `Result`
  ADD COLUMN `subject` VARCHAR(191) NULL,
  ADD COLUMN `marks` DECIMAL(7, 2) NULL,
  ADD COLUMN `maxMarks` DECIMAL(7, 2) NULL;
CREATE INDEX `Result_studentId_exam_idx` ON `Result`(`studentId`, `exam`);
