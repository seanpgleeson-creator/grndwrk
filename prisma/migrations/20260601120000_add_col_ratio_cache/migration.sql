-- CreateTable
CREATE TABLE "ColRatioCache" (
    "id" TEXT NOT NULL,
    "from_city" TEXT NOT NULL,
    "to_city" TEXT NOT NULL,
    "ratio" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL,
    "region_from" TEXT,
    "region_to" TEXT,
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ColRatioCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ColRatioCache_from_city_to_city_key" ON "ColRatioCache"("from_city", "to_city");
