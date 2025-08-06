-- CreateTable
CREATE TABLE `license_batches` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quantity` INTEGER NOT NULL,
    `status` ENUM('PENDING_PAYMENT', 'PAID', 'SENT', 'RECEIVED', 'PARTITIONED', 'CANCELLED') NOT NULL DEFAULT 'PENDING_PAYMENT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `paidAt` DATETIME(3) NULL,
    `sentAt` DATETIME(3) NULL,
    `receivedAt` DATETIME(3) NULL,
    `book_id` INTEGER NOT NULL,
    `customer_type` ENUM('SECRETARY', 'SCHOOL') NULL,
    `secretary_id` INTEGER NULL,
    `school_id` INTEGER NULL,
    `parent_batch_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `license_keys` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `status` ENUM('AVAILABLE', 'ACTIVATED', 'EXPIRED', 'REVOKED') NOT NULL DEFAULT 'AVAILABLE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `activatedAt` DATETIME(3) NULL,
    `batch_id` INTEGER NOT NULL,
    `activated_by_school_id` INTEGER NULL,
    `activated_by_secretary_id` INTEGER NULL,

    UNIQUE INDEX `license_keys_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `license_batches` ADD CONSTRAINT `license_batches_book_id_fkey` FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `license_batches` ADD CONSTRAINT `license_batches_secretary_id_fkey` FOREIGN KEY (`secretary_id`) REFERENCES `secretaries`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `license_batches` ADD CONSTRAINT `license_batches_school_id_fkey` FOREIGN KEY (`school_id`) REFERENCES `schools`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `license_batches` ADD CONSTRAINT `license_batches_parent_batch_id_fkey` FOREIGN KEY (`parent_batch_id`) REFERENCES `license_batches`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `license_keys` ADD CONSTRAINT `license_keys_batch_id_fkey` FOREIGN KEY (`batch_id`) REFERENCES `license_batches`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `license_keys` ADD CONSTRAINT `license_keys_activated_by_school_id_fkey` FOREIGN KEY (`activated_by_school_id`) REFERENCES `schools`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `license_keys` ADD CONSTRAINT `license_keys_activated_by_secretary_id_fkey` FOREIGN KEY (`activated_by_secretary_id`) REFERENCES `secretaries`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
