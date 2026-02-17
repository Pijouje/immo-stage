/*
  Warnings:

  - A unique constraint covering the columns `[auteurId,offreId]` on the table `Avis` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `avis` DROP FOREIGN KEY `Avis_auteurId_fkey`;

-- CreateTable
CREATE TABLE `ReviewPermission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NOT NULL,
    `offreId` INTEGER NOT NULL,
    `grantedBy` INTEGER NOT NULL,

    UNIQUE INDEX `ReviewPermission_userId_offreId_key`(`userId`, `offreId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Avis_auteurId_offreId_key` ON `Avis`(`auteurId`, `offreId`);

-- AddForeignKey
ALTER TABLE `ReviewPermission` ADD CONSTRAINT `ReviewPermission_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReviewPermission` ADD CONSTRAINT `ReviewPermission_offreId_fkey` FOREIGN KEY (`offreId`) REFERENCES `Offre`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReviewPermission` ADD CONSTRAINT `ReviewPermission_grantedBy_fkey` FOREIGN KEY (`grantedBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Avis` ADD CONSTRAINT `Avis_auteurId_fkey` FOREIGN KEY (`auteurId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
