-- DropForeignKey
ALTER TABLE `responsibles` DROP FOREIGN KEY `responsibles_secretary_id_fkey`;

-- AlterTable
ALTER TABLE `responsibles` ADD COLUMN `school_id` INTEGER NULL,
    MODIFY `secretary_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `schools` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `is_private` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `address_id` INTEGER NOT NULL,
    `secretary_id` INTEGER NULL,

    UNIQUE INDEX `schools_address_id_key`(`address_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `schools` ADD CONSTRAINT `schools_address_id_fkey` FOREIGN KEY (`address_id`) REFERENCES `addresses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `schools` ADD CONSTRAINT `schools_secretary_id_fkey` FOREIGN KEY (`secretary_id`) REFERENCES `secretaries`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `responsibles` ADD CONSTRAINT `responsibles_school_id_fkey` FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `responsibles` ADD CONSTRAINT `responsibles_secretary_id_fkey` FOREIGN KEY (`secretary_id`) REFERENCES `secretaries`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
