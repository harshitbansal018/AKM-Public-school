-- Message-card headings and faculty qualifications are different content.
-- Preserve the current public headings in dedicated CMS settings.
INSERT IGNORE INTO `Setting` (`key`, `value`, `group`, `label`, `updatedAt`) VALUES
('principal_message_heading', 'Nurturing Every Child''s Potential', 'page_home', 'Principal message heading', NOW(3)),
('director_message_heading', 'Nurturing Young Minds, Building Bright Futures', 'page_home', 'Director message heading', NOW(3));

-- These values were message headings stored in the qualification column.
-- Clear only the known headings; real qualifications remain untouched.
UPDATE `Faculty`
SET `qualification` = NULL, `updatedAt` = NOW(3)
WHERE (`isPrincipal` = true AND `qualification` = 'Nurturing Every Child''s Potential')
   OR (`isDirector` = true AND `qualification` = 'Nurturing Young Minds, Building Bright Futures');
