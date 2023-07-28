/*
  Warnings:

  - The primary key for the `LinkVotes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `LinkVotes` table. All the data in the column will be lost.
  - Added the required column `linkId` to the `LinkVotes` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LinkVotes" (
    "linkId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("linkId", "userId"),
    CONSTRAINT "LinkVotes_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LinkVotes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LinkVotes" ("timestamp", "userId") SELECT "timestamp", "userId" FROM "LinkVotes";
DROP TABLE "LinkVotes";
ALTER TABLE "new_LinkVotes" RENAME TO "LinkVotes";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
