-- Homework is private to the authenticated parent portal, so these public-page
-- copy settings are no longer needed.
DELETE FROM `Setting`
WHERE `key` IN (
  'page_homework_title',
  'page_homework_subtitle',
  'homework_empty_title',
  'homework_empty_description'
);
