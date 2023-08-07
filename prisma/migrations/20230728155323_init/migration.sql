-- CreateEnum
CREATE TYPE "DealStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "numQuotes" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Installer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isPartner" BOOLEAN NOT NULL,
    "address" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Installer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deal" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "installerId" INTEGER NOT NULL,
    "status" "DealStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "installerId" INTEGER NOT NULL,
    "dealId" INTEGER NOT NULL,
    "totalQuote" DOUBLE PRECISION NOT NULL,
    "quoteLabour" DOUBLE PRECISION NOT NULL,
    "quoteScaffolding" DOUBLE PRECISION NOT NULL,
    "quoteMaterials" DOUBLE PRECISION NOT NULL,
    "quoteCertification" DOUBLE PRECISION NOT NULL,
    "dateOfCompletion" TIMESTAMP(3) NOT NULL,
    "currTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("installerId","dealId")
);

-- CreateTable
CREATE TABLE "UnsubscribedEmails" (
    "email" TEXT NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "UnsubscribedEmails_pkey" PRIMARY KEY ("email")
);

-- CreateIndex
CREATE UNIQUE INDEX "Job_id_key" ON "Job"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Installer_id_key" ON "Installer"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Deal_id_key" ON "Deal"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Deal_jobId_installerId_key" ON "Deal"("jobId", "installerId");

-- CreateIndex
CREATE UNIQUE INDEX "Quote_installerId_dealId_key" ON "Quote"("installerId", "dealId");

-- CreateIndex
CREATE UNIQUE INDEX "UnsubscribedEmails_email_key" ON "UnsubscribedEmails"("email");

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_installerId_fkey" FOREIGN KEY ("installerId") REFERENCES "Installer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
