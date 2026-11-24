-- Keep the editable sentence, but replace its stale fixed count with the token
-- resolved from published Faculty records by the public home service.
UPDATE `Faculty`
SET
  `message` = REPLACE(`message`, 'team of 22 teachers', 'team of {teacherCount} teachers'),
  `updatedAt` = NOW(3)
WHERE `isPrincipal` = true
  AND `message` LIKE '%team of 22 teachers%';
