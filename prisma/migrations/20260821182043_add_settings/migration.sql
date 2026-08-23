-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "businessName" TEXT NOT NULL DEFAULT 'ROAR Studio',
    "tagline" TEXT NOT NULL DEFAULT 'Architecture',
    "logoUrl" TEXT,
    "quote" TEXT NOT NULL DEFAULT 'Design is not just what it looks like, it''s how it works.',
    "quoteAuthor" TEXT NOT NULL DEFAULT 'Steve Jobs',
    "updatedAt" DATETIME NOT NULL
);
