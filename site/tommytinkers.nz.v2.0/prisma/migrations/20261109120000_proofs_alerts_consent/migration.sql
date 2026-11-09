-- CreateEnum
CREATE TYPE "ProofStatus" AS ENUM ('WAITING', 'APPROVED', 'CHANGES_REQUESTED', 'SUPERSEDED');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "needsProof" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "lookupTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN     "lookupTokenHash" TEXT,
ADD COLUMN     "marketingOptIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "termsVersion" TEXT;

-- AlterTable
ALTER TABLE "OrderLine" ADD COLUMN     "artworkRightsAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Proof" (
    "id" TEXT NOT NULL,
    "orderLineId" TEXT,
    "quoteId" TEXT,
    "version" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "status" "ProofStatus" NOT NULL DEFAULT 'WAITING',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "customerNote" TEXT,
    "remindedAt" TIMESTAMP(3),

    CONSTRAINT "Proof_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockAlert" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketingContact" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "consentAt" TIMESTAMP(3) NOT NULL,
    "consentSource" TEXT NOT NULL,
    "unsubscribeToken" TEXT NOT NULL,
    "unsubscribedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketingContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataExport" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'BUILDING',
    "storageKey" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readyAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "DataExport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Proof_tokenHash_key" ON "Proof"("tokenHash");

-- CreateIndex
CREATE INDEX "Proof_status_sentAt_idx" ON "Proof"("status", "sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "Proof_orderLineId_version_key" ON "Proof"("orderLineId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "Proof_quoteId_version_key" ON "Proof"("quoteId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "StockAlert_productId_email_key" ON "StockAlert"("productId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "MarketingContact_email_key" ON "MarketingContact"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MarketingContact_unsubscribeToken_key" ON "MarketingContact"("unsubscribeToken");

-- CreateIndex
CREATE INDEX "DataExport_userId_idx" ON "DataExport"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_lookupTokenHash_key" ON "Order"("lookupTokenHash");

-- AddForeignKey
ALTER TABLE "Proof" ADD CONSTRAINT "Proof_orderLineId_fkey" FOREIGN KEY ("orderLineId") REFERENCES "OrderLine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proof" ADD CONSTRAINT "Proof_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAlert" ADD CONSTRAINT "StockAlert_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

