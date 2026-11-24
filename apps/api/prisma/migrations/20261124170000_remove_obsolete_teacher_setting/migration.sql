-- Teacher totals now come from published Faculty records, so this editable
-- setting is obsolete and otherwise appears as an unnecessary "Other" item.
DELETE FROM `Setting`
WHERE `key` = 'stat_teachers';
