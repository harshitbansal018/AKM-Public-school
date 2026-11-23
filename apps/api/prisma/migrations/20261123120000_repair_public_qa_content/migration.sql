-- Replace placeholder contact details with the school's current HPBOSE listing.
UPDATE `Setting`
SET `value` = CASE `key`
  WHEN 'phonePrimary' THEN '+91 94182 87125'
  WHEN 'phoneSecondary' THEN '+91 94590 24526'
  WHEN 'whatsapp' THEN ''
  WHEN 'email' THEN 'akmschool111@gmail.com'
  WHEN 'addressShort' THEN 'Chuli, VPO Dadahu, District Sirmaur, Himachal Pradesh 173022'
  WHEN 'addressFull' THEN 'AKM Public Sr. Sec. School, Chuli, VPO Dadahu, District Sirmaur, Himachal Pradesh 173022'
  WHEN 'stat_classes' THEN '15'
  ELSE `value`
END
WHERE `key` IN (
  'phonePrimary',
  'phoneSecondary',
  'whatsapp',
  'email',
  'addressShort',
  'addressFull',
  'stat_classes'
);

-- Do not advertise a file that has not been uploaded.
UPDATE `Notice`
SET
  `excerpt` = 'The date sheet for Classes 1–9 and 11 is available from the school office.',
  `body` = 'The annual examination date sheet for Classes 1–9 and Class 11 has been released. Please contact the school office for the current copy. Parents are requested to note the dates and ensure students reach school at least 20 minutes before each paper. Admit cards will be issued by class teachers one week before the examinations begin.'
WHERE `slug` = 'annual-examination-date-sheet-released'
  AND `downloadId` IS NULL;

UPDATE `Announcement`
SET `text` = '📝 Annual Examination date sheet released — contact the school office'
WHERE `text` LIKE '%Annual Examination date sheet released%';

-- Repair the punctuation patterns reported in editable staging content.
UPDATE `Setting`
SET `value` = REPLACE(
  REPLACE(
    REPLACE(`value`, ' ,', ','),
    'textbooks it is',
    'textbooks — it is'
  ),
  'experience five minutes',
  'experience — five minutes'
)
WHERE `value` LIKE '% ,%'
   OR `value` LIKE '%textbooks it is%'
   OR `value` LIKE '%experience five minutes%';

UPDATE `Policy`
SET `content` = REPLACE(
  `content`,
  'When you submit an admission enquiry or a job application through this website, we collect the name and phone number you provide, and optionally the student name, class, message or CV.',
  'Admission enquiries collect the student name, parent or guardian name, phone number, class applied for, address and message. Job applications collect the applicant name, phone number, email address, city or address, position and subject applied for, qualifications, experience, current or previous employer, notes and CV. Some fields are optional.'
)
WHERE `title` = 'Website Privacy Policy';
