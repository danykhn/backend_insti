-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "mercadoPagoOrderId" TEXT,
ADD COLUMN     "mercadoPagoPaymentId" TEXT,
ADD COLUMN     "mercadoPagoStatus" TEXT;

-- CreateTable
CREATE TABLE "DatosBancarios" (
    "id" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "cbu" TEXT NOT NULL,
    "numeroCuenta" TEXT NOT NULL,
    "titular" TEXT NOT NULL,
    "nombreBanco" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DatosBancarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DatosBancarios_cbu_key" ON "DatosBancarios"("cbu");
