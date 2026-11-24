-- Keep the published privacy notice in step with every field collected by the
-- admission-enquiry and careers forms. Replace only the "What we collect"
-- section so any content edited in the other sections is preserved.
UPDATE `Policy`
SET
  `content` = CONCAT(
    LEFT(
      `content`,
      LOCATE('<h2>What we collect</h2>', `content`)
        + CHAR_LENGTH('<h2>What we collect</h2>') - 1
    ),
    '<p>Admission enquiries collect the student name, parent or guardian name, phone number, class applied for, address and message. Job applications collect the applicant name, phone number, email address, city, position and subject applied for, qualifications, experience, current or previous employer, notes and CV. Some fields are optional. We do not ask for payment details anywhere on this site.</p>',
    SUBSTRING(`content`, LOCATE('<h2>Why we collect it</h2>', `content`))
  ),
  `effectiveDate` = '2026-11-24 00:00:00.000',
  `updatedAt` = NOW(3)
WHERE `title` = 'Website Privacy Policy'
  AND LOCATE('<h2>What we collect</h2>', `content`) > 0
  AND LOCATE('<h2>Why we collect it</h2>', `content`) > LOCATE('<h2>What we collect</h2>', `content`);
