-- AlterTable
ALTER TABLE "User" ADD COLUMN     "numeroReference" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_numeroReference_key" ON "User"("numeroReference");
