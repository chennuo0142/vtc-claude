-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "annee" INTEGER,
ADD COLUMN     "nombrePlaces" INTEGER,
ADD COLUMN     "pendingAnnee" INTEGER,
ADD COLUMN     "pendingNombrePlaces" INTEGER;

-- CreateTable
CREATE TABLE "Zone" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Zone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Option" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModePaiement" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModePaiement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProfileZones" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProfileZones_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProfilePendingZones" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProfilePendingZones_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProfileOptions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProfileOptions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProfilePendingOptions" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProfilePendingOptions_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProfileModesPaiement" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProfileModesPaiement_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ProfilePendingModesPaiement" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProfilePendingModesPaiement_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Zone_nom_key" ON "Zone"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Option_nom_key" ON "Option"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "ModePaiement_nom_key" ON "ModePaiement"("nom");

-- CreateIndex
CREATE INDEX "_ProfileZones_B_index" ON "_ProfileZones"("B");

-- CreateIndex
CREATE INDEX "_ProfilePendingZones_B_index" ON "_ProfilePendingZones"("B");

-- CreateIndex
CREATE INDEX "_ProfileOptions_B_index" ON "_ProfileOptions"("B");

-- CreateIndex
CREATE INDEX "_ProfilePendingOptions_B_index" ON "_ProfilePendingOptions"("B");

-- CreateIndex
CREATE INDEX "_ProfileModesPaiement_B_index" ON "_ProfileModesPaiement"("B");

-- CreateIndex
CREATE INDEX "_ProfilePendingModesPaiement_B_index" ON "_ProfilePendingModesPaiement"("B");

-- AddForeignKey
ALTER TABLE "_ProfileZones" ADD CONSTRAINT "_ProfileZones_A_fkey" FOREIGN KEY ("A") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfileZones" ADD CONSTRAINT "_ProfileZones_B_fkey" FOREIGN KEY ("B") REFERENCES "Zone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfilePendingZones" ADD CONSTRAINT "_ProfilePendingZones_A_fkey" FOREIGN KEY ("A") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfilePendingZones" ADD CONSTRAINT "_ProfilePendingZones_B_fkey" FOREIGN KEY ("B") REFERENCES "Zone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfileOptions" ADD CONSTRAINT "_ProfileOptions_A_fkey" FOREIGN KEY ("A") REFERENCES "Option"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfileOptions" ADD CONSTRAINT "_ProfileOptions_B_fkey" FOREIGN KEY ("B") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfilePendingOptions" ADD CONSTRAINT "_ProfilePendingOptions_A_fkey" FOREIGN KEY ("A") REFERENCES "Option"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfilePendingOptions" ADD CONSTRAINT "_ProfilePendingOptions_B_fkey" FOREIGN KEY ("B") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfileModesPaiement" ADD CONSTRAINT "_ProfileModesPaiement_A_fkey" FOREIGN KEY ("A") REFERENCES "ModePaiement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfileModesPaiement" ADD CONSTRAINT "_ProfileModesPaiement_B_fkey" FOREIGN KEY ("B") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfilePendingModesPaiement" ADD CONSTRAINT "_ProfilePendingModesPaiement_A_fkey" FOREIGN KEY ("A") REFERENCES "ModePaiement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProfilePendingModesPaiement" ADD CONSTRAINT "_ProfilePendingModesPaiement_B_fkey" FOREIGN KEY ("B") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

