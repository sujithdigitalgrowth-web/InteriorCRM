-- CreateTable
CREATE TABLE "VendorOrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL DEFAULT 'MISCELLANEOUS',
    "itemName" TEXT NOT NULL,
    "rate" REAL NOT NULL,
    "quantity" REAL NOT NULL DEFAULT 1,
    "discountPct" REAL NOT NULL DEFAULT 0,
    "gstPct" REAL NOT NULL DEFAULT 18,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "vendorId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "VendorOrderItem_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VendorOrderItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "VendorOrderItem_vendorId_idx" ON "VendorOrderItem"("vendorId");

-- CreateIndex
CREATE INDEX "VendorOrderItem_projectId_idx" ON "VendorOrderItem"("projectId");

-- CreateIndex
CREATE INDEX "VendorOrderItem_category_idx" ON "VendorOrderItem"("category");
