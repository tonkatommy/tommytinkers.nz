-- CreateEnum
CREATE TYPE "Fulfilment" AS ENUM ('POST', 'RACE_DAY', 'HELENSVILLE');

-- CreateEnum
CREATE TYPE "PaymentTerms" AS ENUM ('FULL_ON_ACCEPT', 'SETUP_THEN_DELIVERY', 'ON_DELIVERY');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'REPLACED', 'DELIVERED');

-- CreateEnum
CREATE TYPE "QuoteLineKind" AS ENUM ('SETUP', 'ITEM');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('SCHEDULED', 'OPEN', 'PAID', 'VOID');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'BANK_TRANSFER');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'COLLECTED';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "collectedAt" TIMESTAMP(3),
ADD COLUMN     "fulfilment" "Fulfilment" NOT NULL DEFAULT 'POST',
ADD COLUMN     "raceDayId" TEXT;

-- CreateTable
CREATE TABLE "RaceDay" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "cutoffDays" INTEGER NOT NULL DEFAULT 3,
    "pickupNote" TEXT,
    "showAtCheckout" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RaceDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Club" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT NOT NULL,
    "defaultTerms" "PaymentTerms" NOT NULL DEFAULT 'FULL_ON_ACCEPT',
    "defaultDueDays" INTEGER NOT NULL DEFAULT 14,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "number" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "terms" "PaymentTerms" NOT NULL,
    "dueDays" INTEGER NOT NULL DEFAULT 14,
    "validUntil" DATE NOT NULL,
    "fulfilment" "Fulfilment" NOT NULL DEFAULT 'POST',
    "raceDayId" TEXT,
    "noteToClub" TEXT,
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "sentAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "acceptedByName" TEXT,
    "declinedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "replacedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteLine" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "kind" "QuoteLineKind" NOT NULL DEFAULT 'ITEM',
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPriceCents" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "QuoteLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "number" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'SCHEDULED',
    "issuedAt" TIMESTAMP(3),
    "dueAt" DATE,
    "paidAt" TIMESTAMP(3),
    "stripeCheckoutSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoicePayment" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "stripePaymentIntentId" TEXT,
    "recordedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoicePayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RaceDay_date_idx" ON "RaceDay"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_number_key" ON "Quote"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_token_key" ON "Quote"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_replacedById_key" ON "Quote"("replacedById");

-- CreateIndex
CREATE INDEX "Quote_status_createdAt_idx" ON "Quote"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Quote_clubId_idx" ON "Quote"("clubId");

-- CreateIndex
CREATE INDEX "QuoteLine_quoteId_sortOrder_idx" ON "QuoteLine"("quoteId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_number_key" ON "Invoice"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_token_key" ON "Invoice"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_stripeCheckoutSessionId_key" ON "Invoice"("stripeCheckoutSessionId");

-- CreateIndex
CREATE INDEX "Invoice_status_dueAt_idx" ON "Invoice"("status", "dueAt");

-- CreateIndex
CREATE INDEX "Invoice_quoteId_idx" ON "Invoice"("quoteId");

-- CreateIndex
CREATE UNIQUE INDEX "InvoicePayment_stripePaymentIntentId_key" ON "InvoicePayment"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "InvoicePayment_invoiceId_idx" ON "InvoicePayment"("invoiceId");

-- CreateIndex
CREATE INDEX "Order_raceDayId_idx" ON "Order"("raceDayId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_raceDayId_fkey" FOREIGN KEY ("raceDayId") REFERENCES "RaceDay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_raceDayId_fkey" FOREIGN KEY ("raceDayId") REFERENCES "RaceDay"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_replacedById_fkey" FOREIGN KEY ("replacedById") REFERENCES "Quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteLine" ADD CONSTRAINT "QuoteLine_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoicePayment" ADD CONSTRAINT "InvoicePayment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

