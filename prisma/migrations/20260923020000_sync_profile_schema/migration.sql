-- DropForeignKey
ALTER TABLE "Vehicule" DROP CONSTRAINT "Vehicule_userId_fkey";

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "adresse",
ADD COLUMN     "codePostal" TEXT NOT NULL,
ADD COLUMN     "emailContact" TEXT,
ADD COLUMN     "galerie" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "hasPendingChanges" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "langues" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "pendingBio" TEXT,
ADD COLUMN     "pendingCodePostal" TEXT,
ADD COLUMN     "pendingEmailContact" TEXT,
ADD COLUMN     "pendingGalerie" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "pendingLangues" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "pendingPhotoUrl" TEXT,
ADD COLUMN     "pendingTelephone" TEXT,
ADD COLUMN     "pendingVehiculeId" TEXT,
ADD COLUMN     "pendingVille" TEXT,
ADD COLUMN     "vehiculeId" TEXT,
ADD COLUMN     "ville" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Vehicule" DROP COLUMN "userId";

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "profileId" TEXT NOT NULL,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "cardsPerPage" INTEGER NOT NULL DEFAULT 12,

    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_vehiculeId_fkey" FOREIGN KEY ("vehiculeId") REFERENCES "Vehicule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_pendingVehiculeId_fkey" FOREIGN KEY ("pendingVehiculeId") REFERENCES "Vehicule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactMessage" ADD CONSTRAINT "ContactMessage_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
