import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
const solanaService = new SolanaService()
const attestationRepo = new AttestationRepository(prisma)

/**
 * POST /api/blockchain/attestations
 * Create a new SAS attestation on Solana
 */
export async function POST(request: NextRequest) {
  if (request.nextUrl.pathname.includes('/attestations')) {
    return handleCreateAttestation(request)
  }
  if (request.nextUrl.pathname.includes('/nfts')) {
    return handleCreateNFT(request)
  }
  if (request.nextUrl.pathname.includes('/transfer')) {
    return handleTransferNFT(request)
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

/**
 * GET /api/blockchain/attestations
 * List user's attestations
 */
export async function GET(request: NextRequest) {
  if (request.nextUrl.pathname.includes('/attestations')) {
    return handleGetAttestations(request)
  }
  if (request.nextUrl.pathname.includes('/nfts')) {
    return handleGetNFTs(request)
  }
  if (request.nextUrl.pathname.includes('/verify')) {
    return handleVerifyNFT(request)
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

/**
 * Handle SAS attestation creation
 */
async function handleCreateAttestation(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { documentId, issuerAddress, documentType } = body

    if (!documentId || !issuerAddress || !documentType) {
      return NextResponse.json(
        { error: 'documentId, issuerAddress, and documentType required' },
        { status: 400 }
      )
    }

    // Validate issuer address format (base58 Solana address)
    const solanaAddressRegex = /^[1-9A-HJ-NP-Z]{32,44}$/
    if (!solanaAddressRegex.test(issuerAddress)) {
      return NextResponse.json(
        { error: 'Invalid Solana issuer address format' },
        { status: 400 }
      )
    }

    // Get user's wallet
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || !user.walletAddress) {
      return NextResponse.json(
        { error: 'User wallet not found' },
        { status: 400 }
      )
    }

    // Create SAS attestation
    const attestation = await solanaService.createAttestation({
      holderAddress: user.walletAddress,
      issuerAddress,
      documentType,
      documentHash: `doc_${documentId}`,
      metadata: {
        documentId,
        createdAt: new Date().toISOString(),
      },
    })

    // Store in database
    const savedAttestation = await attestationRepo.create({
      sasId: attestation.sasId,
      holderAddress: user.walletAddress,
      issuerAddress,
      documentType,
      signature: attestation.signature,
      transactionHash: attestation.transactionHash,
      chainId: 101, // Solana mainnet
      metadata: { documentId },
    })

    return NextResponse.json(
      {
        attestation: {
          id: savedAttestation.id,
          sasId: savedAttestation.sasId,
          transactionHash: savedAttestation.transactionHash,
          status: 'confirmed',
        },
      },
      { status: 201 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Error creating attestation:', error)

    return NextResponse.json(
      { error: 'Failed to create attestation', message },
      { status: 500 }
    )
  }
}

/**
 * Handle NFT minting
 */
async function handleCreateNFT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { documentId, name, symbol, uri, isSoulbound } = body

    if (!documentId || !name || !symbol || !uri) {
      return NextResponse.json(
        { error: 'documentId, name, symbol, and uri required' },
        { status: 400 }
      )
    }

    // Get user's wallet
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || !user.walletAddress) {
      return NextResponse.json(
        { error: 'User wallet not found' },
        { status: 400 }
      )
    }

    // Mint NFT on Solana
    const nft = await solanaService.mintNFT({
      ownerAddress: user.walletAddress,
      name,
      symbol,
      uri,
      isSoulbound: isSoulbound ?? false,
    })

    // Store in database
    const savedNFT = await prisma.nFTRecord.create({
      data: {
        mintAddress: nft.mintAddress,
        ownerAddress: user.walletAddress,
        name,
        symbol,
        uri,
        isSoulbound: isSoulbound ?? false,
        transactionHash: nft.transactionHash,
        metadata: { documentId },
      },
    })

    return NextResponse.json(
      {
        nft: {
          id: savedNFT.id,
          mintAddress: savedNFT.mintAddress,
          name: savedNFT.name,
          symbol: savedNFT.symbol,
          transactionHash: savedNFT.transactionHash,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Error creating NFT:', error)

    return NextResponse.json(
      { error: 'Failed to mint NFT', message },
      { status: 500 }
    )
  }
}

/**
 * Handle NFT transfer (if not soulbound)
 */
async function handleTransferNFT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { nftId, recipientAddress } = body

    if (!nftId || !recipientAddress) {
      return NextResponse.json(
        { error: 'nftId and recipientAddress required' },
        { status: 400 }
      )
    }

    // Validate recipient address
    const solanaAddressRegex = /^[1-9A-HJ-NP-Z]{32,44}$/
    if (!solanaAddressRegex.test(recipientAddress)) {
      return NextResponse.json(
        { error: 'Invalid recipient Solana address' },
        { status: 400 }
      )
    }

    // Get NFT
    const nft = await prisma.nFTRecord.findUnique({
      where: { id: nftId },
    })

    if (!nft) {
      return NextResponse.json({ error: 'NFT not found' }, { status: 404 })
    }

    // Verify ownership
    if (nft.ownerAddress !== (await prisma.user.findUnique({
      where: { id: userId },
      select: { walletAddress: true },
    }))?.walletAddress) {
      return NextResponse.json({ error: 'Not NFT owner' }, { status: 403 })
    }

    if (nft.isSoulbound) {
      return NextResponse.json(
        { error: 'Cannot transfer soulbound NFT' },
        { status: 400 }
      )
    }

    // Transfer NFT
    const transfer = await solanaService.transferNFT({
      mintAddress: nft.mintAddress,
      fromAddress: nft.ownerAddress,
      toAddress: recipientAddress,
    })

    // Update in database
    const updated = await prisma.nFTRecord.update({
      where: { id: nftId },
      data: {
        ownerAddress: recipientAddress,
        transferHistory: {
          push: {
            from: nft.ownerAddress,
            to: recipientAddress,
            timestamp: new Date().toISOString(),
            transactionHash: transfer.transactionHash,
          },
        },
      },
    })

    return NextResponse.json(
      {
        transfer: {
          nftId: updated.id,
          transactionHash: transfer.transactionHash,
          newOwner: recipientAddress,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Error transferring NFT:', error)

    return NextResponse.json(
      { error: 'Failed to transfer NFT', message },
      { status: 500 }
    )
  }
}

/**
 * Get user's attestations
 */
async function handleGetAttestations(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || !user.walletAddress) {
      return NextResponse.json(
        { error: 'User wallet not found' },
        { status: 400 }
      )
    }

    const attestations = await attestationRepo.findByHolderAddress(user.walletAddress)

    return NextResponse.json({ attestations })
  } catch (error) {
    console.error('Error getting attestations:', error)
    return NextResponse.json(
      { error: 'Failed to get attestations' },
      { status: 500 }
    )
  }
}

/**
 * Get user's NFTs
 */
async function handleGetNFTs(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || !user.walletAddress) {
      return NextResponse.json(
        { error: 'User wallet not found' },
        { status: 400 }
      )
    }

    const nfts = await prisma.nFTRecord.findMany({
      where: { ownerAddress: user.walletAddress },
    })

    return NextResponse.json({ nfts })
  } catch (error) {
    console.error('Error getting NFTs:', error)
    return NextResponse.json(
      { error: 'Failed to get NFTs' },
      { status: 500 }
    )
  }
}

/**
 * Verify NFT ownership on chain
 */
async function handleVerifyNFT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const mintAddress = searchParams.get('mint')

    if (!mintAddress) {
      return NextResponse.json({ error: 'Mint address required' }, { status: 400 })
    }

    // Verify ownership on blockchain
    const isOwned = await solanaService.verifyNFTOwnership({
      mintAddress,
      ownerAddress: (await prisma.user.findUnique({
        where: { id: userId },
        select: { walletAddress: true },
      }))?.walletAddress || '',
    })

    return NextResponse.json({ isOwned })
  } catch (error) {
    console.error('Error verifying NFT:', error)
    return NextResponse.json(
      { error: 'Failed to verify NFT' },
      { status: 500 }
    )
  }
}
