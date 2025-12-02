# 🔧 IMPLEMENTATION GUIDE - Exact Code Templates

## 🎯 What We're Building

**Current State**: 65% complete, everything stubbed  
**Goal**: 100% complete, everything real  
**Timeline**: 4-7 days of focused work

---

## 📌 TASK 1: Solana SAS Attestations (TODAY)

### Current Code (STUB)
**File**: `src/services/implementations/solana.service.ts`

```typescript
export async function createAttestation(schema: AttestationSchema, data: any) {
  // ❌ FAKE - just returns success
  return { 
    success: true, 
    attestationId: 'fake-id-' + Date.now() 
  };
}
```

### What It Should Be (REAL)

```typescript
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { AttestationSchema, AttestationResult } from '@/types/blockchain.types';

const SOLANA_RPC = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const SAS_PROGRAM_ID = new PublicKey(process.env.SAS_PROGRAM_ID!);
const GOVERNMENT_ISSUER = Keypair.fromSecretKey(
  Buffer.from(process.env.GOVERNMENT_ISSUER_SECRET_KEY!, 'base64')
);

export async function createAttestation(
  schema: AttestationSchema, 
  data: any
): Promise<AttestationResult> {
  try {
    const connection = new Connection(SOLANA_RPC);
    
    // 1. Get SAS schema account
    const schemaAccount = await connection.getAccountInfo(
      new PublicKey(schema.schemaId)
    );
    if (!schemaAccount) {
      throw new Error('Schema not found');
    }
    
    // 2. Build attestation data
    const attestationData = {
      schema: schema.schemaId,
      issuer: GOVERNMENT_ISSUER.publicKey.toString(),
      holder: data.holderAddress,
      data: data.attestationData,
      timestamp: Math.floor(Date.now() / 1000),
    };
    
    // 3. Create attestation account
    const attestationAccount = Keypair.generate();
    
    // 4. Build transaction (simplified - real impl needs SAS program calls)
    // TODO: Build actual transaction to create attestation in SAS program
    
    // 5. Sign and send
    const transaction = buildAttestationTransaction(
      attestationAccount,
      attestationData,
      schemaAccount
    );
    transaction.feePayer = GOVERNMENT_ISSUER.publicKey;
    
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.sign(GOVERNMENT_ISSUER);
    
    // 6. Send transaction
    const signature = await connection.sendRawTransaction(
      transaction.serialize()
    );
    
    // 7. Wait for confirmation
    const confirmation = await connection.confirmTransaction(signature);
    
    if (confirmation.value.err) {
      throw new Error('Transaction failed: ' + JSON.stringify(confirmation.value.err));
    }
    
    // 8. Return result
    return {
      success: true,
      attestationId: attestationAccount.publicKey.toString(),
      transactionSignature: signature,
      issuerAddress: GOVERNMENT_ISSUER.publicKey.toString(),
      holderAddress: data.holderAddress,
    };
    
  } catch (error) {
    console.error('Error creating attestation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function verifyAttestation(attestationId: string): Promise<boolean> {
  try {
    const connection = new Connection(SOLANA_RPC);
    
    // 1. Get attestation account
    const attestationAccount = await connection.getAccountInfo(
      new PublicKey(attestationId)
    );
    
    if (!attestationAccount) {
      console.log('Attestation not found');
      return false;
    }
    
    // 2. Parse attestation data (depends on SAS program format)
    const attestationData = parseAttestationAccount(attestationAccount.data);
    
    // 3. Verify issuer signature (real SAS would handle this)
    // TODO: Validate signature against issuer public key
    
    // 4. Check attestation is active
    if (!attestationData.isActive) {
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('Error verifying attestation:', error);
    return false;
  }
}

// Helper function
function parseAttestationAccount(accountData: Buffer) {
  // TODO: Parse according to your SAS attestation schema
  // For now, assume it's JSON encoded
  try {
    const str = accountData.toString('utf8').trim();
    return JSON.parse(str);
  } catch {
    return { isActive: false };
  }
}

function buildAttestationTransaction(
  attestationAccount: Keypair,
  data: any,
  schemaAccount: any
) {
  // TODO: Build actual SAS program instruction
  // This is simplified - real SAS has specific instruction format
  
  // For now, return a basic transaction
  // Real implementation calls SAS program with proper discriminator + data
  throw new Error('buildAttestationTransaction not implemented - needs SAS program integration');
}
```

### Environment Variables Needed
```env
SOLANA_RPC_URL=https://api.devnet.solana.com
SAS_PROGRAM_ID=11111111111111111111111111111111  # Your SAS program ID
GOVERNMENT_ISSUER_SECRET_KEY=base64_encoded_secret_key
```

---

## 📌 TASK 2: Metaplex NFT Minting (TODAY)

### Current Code (STUB)
```typescript
export async function mintNFT(metadata: NFTMetadata, ownerAddress: string) {
  // ❌ FAKE - just returns success
  return { 
    success: true, 
    mintAddress: 'fake-mint-' + Date.now() 
  };
}
```

### What It Should Be (REAL)

```typescript
import { Metaplex, walletAdapterIdentity } from '@metaplex-foundation/js';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { readFileSync } from 'fs';

const SOLANA_RPC = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';

export async function mintNFT(
  metadata: NFTMetadata,
  ownerAddress: string
): Promise<NFTResult> {
  try {
    // 1. Setup connection and Metaplex
    const connection = new Connection(SOLANA_RPC);
    const governmentWallet = Keypair.fromSecretKey(
      Buffer.from(process.env.GOVERNMENT_ISSUER_SECRET_KEY!, 'base64')
    );
    
    const metaplex = Metaplex.make(connection)
      .use(walletAdapterIdentity({ 
        publicKey: governmentWallet.publicKey,
        signMessage: async (message: Uint8Array) => {
          return { signature: governmentWallet.sign(message).signature };
        },
        signTransaction: async (transaction) => {
          transaction.sign([governmentWallet]);
          return transaction;
        },
        signAllTransactions: async (transactions) => {
          return transactions.map(tx => {
            tx.sign([governmentWallet]);
            return tx;
          });
        },
      }));
    
    // 2. Upload metadata to Arweave (or Metaplex bundlr)
    const { uri } = await metaplex.nfts().uploadMetadata({
      name: metadata.name,
      description: metadata.description,
      symbol: 'GOVDOC',
      image: metadata.imageUrl || '',
      attributes: metadata.attributes || [],
      properties: {
        files: [
          {
            uri: metadata.documentHash,
            type: metadata.mimeType || 'application/pdf',
          }
        ],
        category: 'document',
      },
    });
    
    console.log('Metadata uploaded to:', uri);
    
    // 3. Mint NFT
    const { nft } = await metaplex.nfts().create({
      useNewMint: true,
      uri: uri,
      name: metadata.name,
      sellerFeeBasisPoints: 500, // 5%
      symbol: 'GOVDOC',
      creators: [
        {
          address: governmentWallet.publicKey,
          verified: true,
          share: 100,
        }
      ],
      owner: new PublicKey(ownerAddress),
      tokenStandard: 'ProgrammableNonFungible', // Modern compressed NFT standard
    });
    
    console.log('NFT Minted:', {
      mint: nft.mint.address.toString(),
      owner: nft.owner.toString(),
      uri: nft.uri,
    });
    
    // 4. Return result
    return {
      success: true,
      mintAddress: nft.mint.address.toString(),
      ownerAddress: nft.owner.toString(),
      metadataUri: uri,
      transactionSignature: '', // Would need to capture from builder result
      tokenStandard: 'ProgrammableNonFungible',
    };
    
  } catch (error) {
    console.error('Error minting NFT:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function transferNFT(
  mintAddress: string,
  fromAddress: string,
  toAddress: string
): Promise<TransactionResult> {
  try {
    const connection = new Connection(SOLANA_RPC);
    const governmentWallet = Keypair.fromSecretKey(
      Buffer.from(process.env.GOVERNMENT_ISSUER_SECRET_KEY!, 'base64')
    );
    
    const metaplex = Metaplex.make(connection)
      .use(walletAdapterIdentity({
        // ... (same as above)
      }));
    
    // Transfer would use token program
    // Simplified - real implementation needs proper token transfer
    
    return {
      success: false,
      error: 'Transfer not yet implemented',
    };
    
  } catch (error) {
    console.error('Error transferring NFT:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
```

---

## 📌 TASK 3: Arweave File Storage (TOMORROW)

### New Files to Create

**File**: `src/services/implementations/arweave.service.ts`

```typescript
import Arweave from 'arweave';
import { JWKInterface } from 'arweave/node/lib/wallet';
import { readFileSync } from 'fs';
import crypto from 'crypto';

const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
});

// Load government wallet
const GOVERNMENT_WALLET: JWKInterface = JSON.parse(
  readFileSync(process.env.ARWEAVE_WALLET_PATH!, 'utf-8')
);

export interface ArweaveUploadResult {
  success: boolean;
  fileHash?: string;
  transactionId?: string;
  permanenceUrl?: string;
  error?: string;
}

export async function uploadFile(
  fileBuffer: Buffer,
  metadata: {
    filename: string;
    mimeType: string;
    documentId: string;
    userId: string;
  }
): Promise<ArweaveUploadResult> {
  try {
    // 1. Encrypt file (optional - if sensitive)
    const encryptedBuffer = encryptFileBuffer(fileBuffer);
    
    // 2. Calculate hash
    const fileHash = crypto
      .createHash('sha256')
      .update(encryptedBuffer)
      .digest('hex');
    
    // 3. Create Arweave transaction
    const transaction = await arweave.createTransaction(
      {
        data: encryptedBuffer,
      },
      GOVERNMENT_WALLET
    );
    
    // 4. Add tags for indexing
    transaction.addTag('Content-Type', metadata.mimeType);
    transaction.addTag('Filename', metadata.filename);
    transaction.addTag('Document-ID', metadata.documentId);
    transaction.addTag('User-ID', metadata.userId);
    transaction.addTag('Timestamp', new Date().toISOString());
    transaction.addTag('App', 'NDDV');
    
    // 5. Sign transaction
    await arweave.transactions.sign(transaction, GOVERNMENT_WALLET);
    
    // 6. Submit to Arweave
    const response = await arweave.transactions.post(transaction);
    
    if (response.status !== 200) {
      throw new Error(`Arweave upload failed: ${response.statusText}`);
    }
    
    console.log('File uploaded to Arweave:', {
      txId: transaction.id,
      fileHash,
      size: encryptedBuffer.length,
    });
    
    // 7. Return result
    return {
      success: true,
      fileHash,
      transactionId: transaction.id,
      permanenceUrl: `https://arweave.net/${transaction.id}`,
    };
    
  } catch (error) {
    console.error('Error uploading to Arweave:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function retrieveFile(
  transactionId: string
): Promise<Buffer | null> {
  try {
    // Download file from Arweave
    const response = await fetch(`https://arweave.net/${transactionId}`);
    
    if (!response.ok) {
      console.error('File not found on Arweave');
      return null;
    }
    
    const buffer = await response.arrayBuffer();
    
    // Decrypt if needed
    const decryptedBuffer = decryptFileBuffer(Buffer.from(buffer));
    
    return decryptedBuffer;
    
  } catch (error) {
    console.error('Error retrieving from Arweave:', error);
    return null;
  }
}

// Encryption helpers
function encryptFileBuffer(buffer: Buffer): Buffer {
  const key = Buffer.from(process.env.FILE_ENCRYPTION_KEY!, 'base64');
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(buffer);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  // Return IV + encrypted data
  return Buffer.concat([iv, encrypted]);
}

function decryptFileBuffer(buffer: Buffer): Buffer {
  const key = Buffer.from(process.env.FILE_ENCRYPTION_KEY!, 'base64');
  
  // Extract IV and encrypted data
  const iv = buffer.slice(0, 16);
  const encrypted = buffer.slice(16);
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted;
}
```

---

## 📌 TASK 4: Wire Document Upload (TODAY)

### Update `src/services/implementations/document.service.ts`

**Current**: Uploads to database only  
**New**: Uploads to Arweave + Blockchain

```typescript
// Around line where documents are created

import { arweaveService } from './arweave.service';
import { solanaService } from './solana.service';

export async function createDocumentWithBlockchain(
  userId: string,
  fileBuffer: Buffer,
  documentData: CreateDocumentInput
) {
  try {
    // 1. Run forensic analysis (ALREADY WORKS)
    const forensicResult = await aiForensicService.analyzeDocument(
      fileBuffer,
      documentData.type
    );
    
    // 2. Calculate score
    const score = forensicResult.overallScore;
    
    // 3. Upload to Arweave (NEW)
    const arweaveResult = await arweaveService.uploadFile(fileBuffer, {
      filename: documentData.title,
      mimeType: documentData.mimeType,
      documentId: documentId,
      userId: userId,
    });
    
    if (!arweaveResult.success) {
      throw new Error('Failed to upload to Arweave');
    }
    
    // 4. Create database record
    const document = await prisma.document.create({
      data: {
        userId,
        type: documentData.type,
        title: documentData.title,
        fileHash: arweaveResult.fileHash!,
        arweaveTransactionId: arweaveResult.transactionId,
        mimeType: documentData.mimeType,
        forensicReport: forensicResult,
        forensicScore: score,
        status: score >= 85 ? 'APPROVED' : score >= 70 ? 'REVIEW' : 'REJECTED',
      },
    });
    
    // 5. If approved (85+), issue to blockchain
    if (score >= 85) {
      const blockchain = await solanaService.createAttestation(
        {
          schemaId: getSchemaForDocumentType(documentData.type),
        },
        {
          holderAddress: user.walletAddress,
          attestationData: {
            documentId: document.id,
            type: documentData.type,
            fileHash: arweaveResult.fileHash,
            issuedAt: new Date().toISOString(),
          },
        }
      );
      
      if (blockchain.success) {
        await prisma.document.update({
          where: { id: document.id },
          data: {
            attestationId: blockchain.attestationId,
            blockchainStatus: 'ISSUED',
          },
        });
      }
    }
    
    return document;
    
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
}
```

---

## ✅ NEXT STEPS

1. **Today**: Implement Solana SAS + Metaplex (Tasks 1-2)
2. **Tomorrow**: Implement Arweave + wire document upload (Tasks 3-4)
3. **Day 3**: Test full end-to-end flow
4. **Day 4+**: Verification, notifications, admin panel

---

## 🧪 HOW TO TEST

```bash
# 1. Start dev server
npm run dev

# 2. In browser: http://localhost:3000
# 3. Login as citizen: +256 701 234567 / PIN: 123456

# 4. Upload document

# 5. Check logs for:
#    - "Attestation created on Solana"
#    - "File uploaded to Arweave"
#    - "Document stored in database"

# 6. As verifier: lookup document
#    - Should show real blockchain data

# 7. Check Solana devnet explorer for actual transactions
```

---

**Ready to implement? Start with Task 1 (Solana SAS). Have questions? Ask! 🚀**

