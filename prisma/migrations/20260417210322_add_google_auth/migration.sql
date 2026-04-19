-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EMPLEADO', 'CURSANTE');

-- CreateEnum
CREATE TYPE "CartillaStatus" AS ENUM ('PENDIENTE', 'COMPLETADO', 'CANCELADO', 'PAGADO');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('TRANSFERENCIA', 'EFECTIVO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "picture" TEXT,
    "googleId" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CURSANTE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cartilla" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "autor" TEXT NOT NULL,
    "materia" TEXT NOT NULL,
    "carrera" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 0,
    "imagen" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cartilla_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "etiquetas" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "etiquetas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" TEXT NOT NULL,
    "numeroOrden" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "estado" "CartillaStatus" NOT NULL DEFAULT 'PENDIENTE',
    "metodo_pago" "PaymentMethod" NOT NULL,
    "cantidad_total" INTEGER NOT NULL,
    "precio_total" DOUBLE PRECISION NOT NULL,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartillaEnPedido" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "cartillaId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CartillaEnPedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "metodo" "PaymentMethod" NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "comprobante_url" TEXT,
    "id_comprobante" TEXT,
    "fecha_transferencia" TIMESTAMP(3),
    "entregado_por" TEXT,
    "fecha_recepcion" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dashboard" (
    "id" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_pedidos" INTEGER NOT NULL DEFAULT 0,
    "total_ganancias" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pedidos_pendientes" INTEGER NOT NULL DEFAULT 0,
    "pedidos_completados" INTEGER NOT NULL DEFAULT 0,
    "pedidos_cancelados" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dashboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CartillaToEtiqueta" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "etiquetas_nombre_key" ON "etiquetas"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Pedido_numeroOrden_key" ON "Pedido"("numeroOrden");

-- CreateIndex
CREATE INDEX "Pedido_usuarioId_idx" ON "Pedido"("usuarioId");

-- CreateIndex
CREATE INDEX "Pedido_estado_idx" ON "Pedido"("estado");

-- CreateIndex
CREATE INDEX "Pedido_createdAt_idx" ON "Pedido"("createdAt");

-- CreateIndex
CREATE INDEX "CartillaEnPedido_pedidoId_idx" ON "CartillaEnPedido"("pedidoId");

-- CreateIndex
CREATE INDEX "CartillaEnPedido_cartillaId_idx" ON "CartillaEnPedido"("cartillaId");

-- CreateIndex
CREATE UNIQUE INDEX "CartillaEnPedido_pedidoId_cartillaId_key" ON "CartillaEnPedido"("pedidoId", "cartillaId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_pedidoId_key" ON "Payment"("pedidoId");

-- CreateIndex
CREATE INDEX "Payment_usuarioId_idx" ON "Payment"("usuarioId");

-- CreateIndex
CREATE INDEX "Payment_estado_idx" ON "Payment"("estado");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "_CartillaToEtiqueta_AB_unique" ON "_CartillaToEtiqueta"("A", "B");

-- CreateIndex
CREATE INDEX "_CartillaToEtiqueta_B_index" ON "_CartillaToEtiqueta"("B");

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartillaEnPedido" ADD CONSTRAINT "CartillaEnPedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartillaEnPedido" ADD CONSTRAINT "CartillaEnPedido_cartillaId_fkey" FOREIGN KEY ("cartillaId") REFERENCES "Cartilla"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CartillaToEtiqueta" ADD CONSTRAINT "_CartillaToEtiqueta_A_fkey" FOREIGN KEY ("A") REFERENCES "Cartilla"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CartillaToEtiqueta" ADD CONSTRAINT "_CartillaToEtiqueta_B_fkey" FOREIGN KEY ("B") REFERENCES "etiquetas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
