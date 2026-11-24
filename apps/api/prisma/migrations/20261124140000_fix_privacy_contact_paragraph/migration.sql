-- The section title remains a heading; its explanatory sentence is body text.
-- Handle the heading levels the rich-text editor can produce without changing
-- any other policy content.
UPDATE `Policy`
SET
  `content` = REPLACE(
    REPLACE(
      REPLACE(
        `content`,
        '<h2>To ask about, or request deletion of, information you have submitted, write to the school office at the email address or phone number on the Contact page.</h2>',
        '<p>To ask about, or request deletion of, information you have submitted, write to the school office at the email address or phone number on the Contact page.</p>'
      ),
      '<h3>To ask about, or request deletion of, information you have submitted, write to the school office at the email address or phone number on the Contact page.</h3>',
      '<p>To ask about, or request deletion of, information you have submitted, write to the school office at the email address or phone number on the Contact page.</p>'
    ),
    '<h4>To ask about, or request deletion of, information you have submitted, write to the school office at the email address or phone number on the Contact page.</h4>',
    '<p>To ask about, or request deletion of, information you have submitted, write to the school office at the email address or phone number on the Contact page.</p>'
  ),
  `updatedAt` = NOW(3)
WHERE `title` = 'Website Privacy Policy'
  AND `content` LIKE '%To ask about, or request deletion of, information you have submitted%'
  AND (
    `content` LIKE '%<h2>To ask about, or request deletion%'
    OR `content` LIKE '%<h3>To ask about, or request deletion%'
    OR `content` LIKE '%<h4>To ask about, or request deletion%'
  );
