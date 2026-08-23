-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "teamMemberId" TEXT NOT NULL,
    CONSTRAINT "Session_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "TeamMember" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "dashboard" BOOLEAN NOT NULL DEFAULT true,
    "clients" BOOLEAN NOT NULL DEFAULT true,
    "projects" BOOLEAN NOT NULL DEFAULT true,
    "vendors" BOOLEAN NOT NULL DEFAULT true,
    "vendorQuota" BOOLEAN NOT NULL DEFAULT true,
    "quotations" BOOLEAN NOT NULL DEFAULT true,
    "agreements" BOOLEAN NOT NULL DEFAULT true,
    "finance" BOOLEAN NOT NULL DEFAULT false,
    "revenue" BOOLEAN NOT NULL DEFAULT false,
    "manageTeam" BOOLEAN NOT NULL DEFAULT false,
    "manageSettings" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TeamMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'DESIGNER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "email" TEXT,
    "phone" TEXT,
    "avatarColor" TEXT,
    "accessRole" TEXT NOT NULL DEFAULT 'EMPLOYEE',
    "passwordHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_TeamMember" ("avatarColor", "createdAt", "email", "id", "name", "phone", "role", "status", "updatedAt") SELECT "avatarColor", "createdAt", "email", "id", "name", "phone", "role", "status", "updatedAt" FROM "TeamMember";
DROP TABLE "TeamMember";
ALTER TABLE "new_TeamMember" RENAME TO "TeamMember";
CREATE UNIQUE INDEX "TeamMember_email_key" ON "TeamMember"("email");
CREATE INDEX "TeamMember_role_idx" ON "TeamMember"("role");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_teamMemberId_idx" ON "Session"("teamMemberId");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_role_key" ON "RolePermission"("role");
