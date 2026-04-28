/*
  Warnings:

  - You are about to drop the column `assigneeId` on the `Card` table. All the data in the column will be lost.
  - Added the required column `creatorId` to the `Card` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_assigneeId_fkey";

-- AlterTable
ALTER TABLE "Card" DROP COLUMN "assigneeId",
ADD COLUMN     "creatorId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "CardAssignee" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CardAssignee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CardAssignee_cardId_userId_key" ON "CardAssignee"("cardId", "userId");

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardAssignee" ADD CONSTRAINT "CardAssignee_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardAssignee" ADD CONSTRAINT "CardAssignee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
