# Scripts Directory

This directory contains utility scripts for testing and verification.

## Available Scripts

### `verify-pipeline.ts`

Verifies the document creation pipeline end-to-end.

**Usage**:
```bash
# Install tsx if not already installed
npm install -D tsx

# Run the script
npm run verify:pipeline
# OR
npx tsx scripts/verify-pipeline.ts
```

**What It Tests**:
- Document creation flow
- Forensic analysis integration
- Arweave upload
- Solana attestation/NFT minting

**Note**: Uses mock services, so it doesn't require real API keys or blockchain connections.

## Adding New Scripts

1. Create a new `.ts` file in this directory
2. Use `@/` path aliases for imports (configured in tsconfig.json)
3. Add an npm script to `package.json`:
   ```json
   {
     "scripts": {
       "script-name": "tsx scripts/script-name.ts"
     }
   }
   ```

