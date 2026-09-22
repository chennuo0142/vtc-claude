-- CreateEnum
CREATE TYPE "VehiculeCategorie" AS ENUM ('BERLINE', 'VAN', 'SUV');

-- CreateTable
CREATE TABLE "Vehicule" (
    "id" TEXT NOT NULL,
    "categorie" "VehiculeCategorie" NOT NULL,
    "nombrePlaces" INTEGER NOT NULL,
    "photoUrl" TEXT,
    "marque" TEXT NOT NULL,
    "modele" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Vehicule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Vehicule" ADD CONSTRAINT "Vehicule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
