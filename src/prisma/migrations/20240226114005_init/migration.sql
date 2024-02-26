/*
  Warnings:

  - You are about to drop the column `Poster` on the `Post` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Post` DROP FOREIGN KEY `Post_writerId_fkey`;

-- AlterTable
ALTER TABLE `Post` DROP COLUMN `Poster`,
    ADD COLUMN `image` VARCHAR(191) NULL,
    ADD COLUMN `imageId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_writerId_fkey` FOREIGN KEY (`writerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
