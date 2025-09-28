-- CreateTable
CREATE TABLE "HotelRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "seekerId" INTEGER NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "guests" INTEGER NOT NULL,
    "rooms" INTEGER,
    "city" TEXT NOT NULL,
    "state" TEXT,
    "cityCode" TEXT,
    "maxNightlyUSD" INTEGER,
    "notes" TEXT,
    "amadeusHotelId" TEXT,
    "amadeusOfferId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HotelRequest_seekerId_fkey" FOREIGN KEY ("seekerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
