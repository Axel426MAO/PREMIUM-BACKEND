/*
  Warnings:

  - You are about to alter the column `status` on the `license_batches` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(0))`.
  - You are about to alter the column `status` on the `license_keys` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(2))`.

*/
-- AlterTable
ALTER TABLE `license_batches` MODIFY `status` ENUM('CRIADO', 'ENVIADO', 'RECEBIDO', 'PENDENTE', 'ATIVO', 'EXPIRADO') NOT NULL DEFAULT 'CRIADO';

-- AlterTable
ALTER TABLE `license_keys` MODIFY `status` ENUM('CRIADO', 'ENVIADO', 'RECEBIDO', 'PENDENTE', 'ATIVO', 'EXPIRADO') NOT NULL DEFAULT 'CRIADO';
