-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'Other';

-- CreateIndex
CREATE INDEX "Recipe_published_category_idx" ON "Recipe"("published", "category");
