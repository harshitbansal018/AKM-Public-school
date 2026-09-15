CREATE TABLE `Student` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `classGroup` VARCHAR(191) NOT NULL,
  `rollNumber` VARCHAR(191) NULL,
  `guardianName` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NULL,
  `address` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `Student_classGroup_name_idx`(`classGroup`, `name`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Homework` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(191) NOT NULL,
  `classGroup` VARCHAR(191) NOT NULL,
  `subject` VARCHAR(191) NOT NULL,
  `dueDate` DATETIME(3) NULL,
  `description` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `Homework_classGroup_dueDate_idx`(`classGroup`, `dueDate`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Result` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `studentName` VARCHAR(191) NOT NULL,
  `classGroup` VARCHAR(191) NOT NULL,
  `exam` VARCHAR(191) NOT NULL,
  `score` VARCHAR(191) NOT NULL,
  `resultDate` DATETIME(3) NULL,
  `remarks` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `Result_classGroup_exam_idx`(`classGroup`, `exam`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `FeeRecord` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `studentName` VARCHAR(191) NOT NULL,
  `classGroup` VARCHAR(191) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `dueDate` DATETIME(3) NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'DUE',
  `notes` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `FeeRecord_classGroup_status_idx`(`classGroup`, `status`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `FacultySalary` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `facultyName` VARCHAR(191) NOT NULL,
  `month` VARCHAR(191) NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `paymentDate` DATETIME(3) NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'DUE',
  `notes` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `FacultySalary_facultyName_month_idx`(`facultyName`, `month`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `JobApplication` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `position` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NULL,
  `phone` VARCHAR(191) NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'NEW',
  `notes` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `JobApplication_status_createdAt_idx`(`status`, `createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Policy` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(191) NOT NULL,
  `effectiveDate` DATETIME(3) NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'DRAFT',
  `content` LONGTEXT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `Policy_status_idx`(`status`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
