-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('BIRTH_CERTIFICATE', 'NATIONAL_ID', 'PASSPORT', 'DRIVERS_LICENSE', 'LAND_TITLE', 'PROPERTY_DEED', 'VEHICLE_REGISTRATION', 'PROFESSIONAL_LICENSE', 'ACADEMIC_CERTIFICATE');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BlockchainType" AS ENUM ('SAS_ATTESTATION', 'NFT_METAPLEX');

-- CreateEnum
CREATE TYPE "PermissionType" AS ENUM ('READ', 'SHARE', 'VERIFY');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "privyId" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "email" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "fileHash" TEXT NOT NULL,
    "encryptedData" TEXT,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "attestationId" TEXT,
    "nftMintAddress" TEXT,
    "blockchainType" "BlockchainType" NOT NULL,
    "forensicReportId" TEXT,
    "forensicScore" INTEGER,
    "forensicStatus" TEXT,
    "issuedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attestations" (
    "id" TEXT NOT NULL,
    "sasId" TEXT NOT NULL,
    "schemaId" TEXT NOT NULL,
    "issuerId" TEXT NOT NULL,
    "holderAddress" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "signature" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attestations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nft_records" (
    "id" TEXT NOT NULL,
    "mintAddress" TEXT NOT NULL,
    "ownerAddress" TEXT NOT NULL,
    "metadataUri" TEXT NOT NULL,
    "collectionId" TEXT,
    "attributes" JSONB NOT NULL,
    "isTransferable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nft_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nft_transactions" (
    "id" TEXT NOT NULL,
    "nftMintAddress" TEXT NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "blockNumber" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nft_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "grantedTo" TEXT NOT NULL,
    "accessType" "PermissionType" NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "documentId" TEXT,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forensic_analyses" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "analysisId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "tamperingDetected" BOOLEAN NOT NULL DEFAULT false,
    "tamperRisk" TEXT NOT NULL DEFAULT 'NONE',
    "tamperIndicators" JSONB NOT NULL DEFAULT '[]',
    "extractedText" TEXT NOT NULL DEFAULT '',
    "ocrConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ocrLanguage" TEXT NOT NULL DEFAULT 'unknown',
    "documentQuality" TEXT NOT NULL DEFAULT 'FAIR',
    "hasSecurityFeatures" BOOLEAN NOT NULL DEFAULT false,
    "securityFeatures" JSONB NOT NULL DEFAULT '[]',
    "hasFaceImage" BOOLEAN NOT NULL DEFAULT false,
    "faceConfidence" DOUBLE PRECISION,
    "integrityScore" INTEGER NOT NULL DEFAULT 0,
    "authenticityScore" INTEGER NOT NULL DEFAULT 0,
    "metadataScore" INTEGER NOT NULL DEFAULT 0,
    "ocrScore" INTEGER NOT NULL DEFAULT 0,
    "biometricScore" INTEGER NOT NULL DEFAULT 0,
    "securityScore" INTEGER NOT NULL DEFAULT 0,
    "overallScore" INTEGER NOT NULL DEFAULT 0,
    "recommendedAction" TEXT NOT NULL DEFAULT 'REVIEW',
    "blockchainRecommendation" TEXT NOT NULL DEFAULT 'MANUAL_REVIEW',
    "findings" JSONB NOT NULL,
    "errors" JSONB NOT NULL DEFAULT '[]',
    "aiModel" TEXT NOT NULL DEFAULT 'gemini-2.0-flash',
    "analysisMethod" TEXT NOT NULL DEFAULT 'FULL_SUITE',

    CONSTRAINT "forensic_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_privyId_key" ON "users"("privyId");

-- CreateIndex
CREATE UNIQUE INDEX "users_walletAddress_key" ON "users"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "documents_forensicReportId_key" ON "documents"("forensicReportId");

-- CreateIndex
CREATE UNIQUE INDEX "attestations_sasId_key" ON "attestations"("sasId");

-- CreateIndex
CREATE UNIQUE INDEX "nft_records_mintAddress_key" ON "nft_records"("mintAddress");

-- CreateIndex
CREATE UNIQUE INDEX "nft_transactions_transactionHash_key" ON "nft_transactions"("transactionHash");

-- CreateIndex
CREATE UNIQUE INDEX "forensic_analyses_documentId_key" ON "forensic_analyses"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "forensic_analyses_analysisId_key" ON "forensic_analyses"("analysisId");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_attestationId_fkey" FOREIGN KEY ("attestationId") REFERENCES "attestations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_nftMintAddress_fkey" FOREIGN KEY ("nftMintAddress") REFERENCES "nft_records"("mintAddress") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_forensicReportId_fkey" FOREIGN KEY ("forensicReportId") REFERENCES "forensic_analyses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nft_transactions" ADD CONSTRAINT "nft_transactions_nftMintAddress_fkey" FOREIGN KEY ("nftMintAddress") REFERENCES "nft_records"("mintAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
