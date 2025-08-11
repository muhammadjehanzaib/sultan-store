-- CreateTable
CREATE TABLE "ContactQuery" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactQuery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactQuery_status_createdAt_idx" ON "ContactQuery"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ContactQuery_email_idx" ON "ContactQuery"("email");
