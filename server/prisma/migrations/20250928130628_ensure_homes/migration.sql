-- CreateTable
CREATE TABLE "HomeListing" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sponsorId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "maxGuests" INTEGER NOT NULL,
    "nightlyCents" INTEGER,
    "availableFrom" DATETIME,
    "availableTo" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HomeListing_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HomeApplication" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "listingId" INTEGER NOT NULL,
    "seekerId" INTEGER NOT NULL,
    "occupants" INTEGER NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HomeApplication_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "HomeListing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HomeApplication_seekerId_fkey" FOREIGN KEY ("seekerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
