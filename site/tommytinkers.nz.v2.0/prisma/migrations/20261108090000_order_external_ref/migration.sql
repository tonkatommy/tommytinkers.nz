-- The Shopify store is closed, so imported orders can't link back to it.
-- Keep the order name Shopify gave them instead (e.g. "TT-1001-NZ").
-- A rename, not a drop and add, so any local data in the column survives.
ALTER TABLE "Order" RENAME COLUMN "externalUrl" TO "externalRef";
