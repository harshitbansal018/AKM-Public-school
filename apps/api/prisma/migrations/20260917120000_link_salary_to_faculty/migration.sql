-- Salary rows point at the teacher's record instead of matching on a typed name.
ALTER TABLE `FacultySalary` ADD COLUMN `facultyId` INTEGER NULL;
CREATE INDEX `FacultySalary_facultyId_idx` ON `FacultySalary`(`facultyId`);
ALTER TABLE `FacultySalary` ADD CONSTRAINT `FacultySalary_facultyId_fkey`
  FOREIGN KEY (`facultyId`) REFERENCES `Faculty`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
