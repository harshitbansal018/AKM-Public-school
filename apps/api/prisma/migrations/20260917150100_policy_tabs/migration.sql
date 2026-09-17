-- A policy's category is the name of the tab it sits under on the Policies
-- page; the office defines the tabs, so it is free text rather than a code.
ALTER TABLE `Policy` ALTER COLUMN `category` SET DEFAULT 'General';
UPDATE `Policy` SET `category` = CASE `category`
  WHEN 'STUDENT'    THEN 'Student Policies'
  WHEN 'TEACHER'    THEN 'Teacher / Faculty Policies'
  WHEN 'RULES'      THEN 'School Rules & Regulations'
  WHEN 'ATTENDANCE' THEN 'Attendance / Leave Rules'
  WHEN 'ACADEMIC'   THEN 'Academic / Examination Rules'
  ELSE `category` END;
