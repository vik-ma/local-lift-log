-- Your SQL goes here
ALTER TABLE `multisets` DROP COLUMN `multiset_type`;
ALTER TABLE `multisets` ADD COLUMN `multiset_type` TEXT NOT NULL DEFAULT "Superset";