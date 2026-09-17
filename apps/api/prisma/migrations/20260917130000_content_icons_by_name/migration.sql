-- Content icons are stored as icon names (drawn as SVG by the website) instead
-- of emoji characters. Existing rows are mapped; anything unknown gets the default.
-- Compared as BINARY: in utf8mb4_unicode_ci every emoji sorts equal to every other.
ALTER TABLE `AcademicStage` CHANGE COLUMN `emoji` `icon` VARCHAR(191) NOT NULL DEFAULT 'book';
ALTER TABLE `Stream` CHANGE COLUMN `emoji` `icon` VARCHAR(191) NOT NULL DEFAULT 'book';
ALTER TABLE `Facility` ALTER COLUMN `icon` SET DEFAULT 'school';
ALTER TABLE `Achievement` ALTER COLUMN `medal` SET DEFAULT 'medal-gold';

UPDATE `Facility` SET `icon` = CASE BINARY `icon`
  WHEN BINARY '💻' THEN 'laptop' WHEN BINARY '🧪' THEN 'flask' WHEN BINARY '🔬' THEN 'microscope'
  WHEN BINARY '🏸' THEN 'sports' WHEN BINARY '⚽' THEN 'sports' WHEN BINARY '🏫' THEN 'school'
  WHEN BINARY '📚' THEN 'library' WHEN BINARY '🚌' THEN 'bus' WHEN BINARY '🎵' THEN 'music'
  WHEN BINARY '🎨' THEN 'art' WHEN BINARY '🩺' THEN 'medical' ELSE 'school' END
WHERE `icon` NOT REGEXP '^[a-z-]+$';

UPDATE `AcademicStage` SET `icon` = CASE BINARY `icon`
  WHEN BINARY '🧸' THEN 'blocks' WHEN BINARY '📖' THEN 'book' WHEN BINARY '🔬' THEN 'microscope'
  WHEN BINARY '📝' THEN 'pencil' WHEN BINARY '🎓' THEN 'graduation' WHEN BINARY '📘' THEN 'book' ELSE 'book' END
WHERE `icon` NOT REGEXP '^[a-z-]+$';

UPDATE `Stream` SET `icon` = CASE BINARY `icon`
  WHEN BINARY '🩺' THEN 'medical' WHEN BINARY '⚙️' THEN 'gear' WHEN BINARY '⚙' THEN 'gear'
  WHEN BINARY '🎨' THEN 'art' WHEN BINARY '💼' THEN 'briefcase' WHEN BINARY '💻' THEN 'laptop' WHEN BINARY '📚' THEN 'book' ELSE 'book' END
WHERE `icon` NOT REGEXP '^[a-z-]+$';

UPDATE `Achievement` SET `medal` = CASE BINARY `medal`
  WHEN BINARY '🥇' THEN 'medal-gold' WHEN BINARY '🥈' THEN 'medal-silver' WHEN BINARY '🥉' THEN 'medal-bronze'
  WHEN BINARY '🏆' THEN 'trophy' ELSE 'medal-gold' END
WHERE `medal` NOT REGEXP '^[a-z-]+$';
