-- AlterTable
ALTER TABLE `secretaries` ADD COLUMN `is_state_level` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `municipality` VARCHAR(191) NULL;
