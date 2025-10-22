# National Digital Document Vault (NDDV)

**Secure blockchain-verified document storage and verification system built on Solana**

A digital vault where citizens can store, verify, and share official documents using blockchain technology. Uses Solana Attestation Service (SAS) for identity documents and NFTs for ownership documents, providing cryptographic proof of authenticity and ownership.

## 🚀 Key Features

- **Blockchain Verification**: Documents are cryptographically secured and verified on the Solana blockchain
- **Dual Authentication System**:
  - SAS (Solana Attestation Service) for identity documents (birth certificates, passports, IDs)
  - NFTs for ownership documents (property deeds, vehicle registrations)
- **End-to-End Encryption**: Sensitive document data is encrypted and only accessible by authorized parties
- **Secure Sharing**: Granular permissions with expiration controls for document access
- **Wallet Integration**: Seamless integration with Solana wallets (Solflare, Phantom, Backpack)
- **Audit Trail**: Comprehensive logging of all document activities

## 🛠 Technology Stack

- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS v4
- **Authentication**: Privy (embedded wallets and social login)
- **Blockchain**: Solana (SAS + NFTs with Metaplex)
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: Arweave for permanent document storage
- **Architecture**: Repository & Service Pattern
- **Styling**: Tailwind CSS v4 with Turbo build optimization

## 🏗 Architecture Overview

The project follows a clean architecture pattern:

```text
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Components    │ ←→ │    Services      │ ←→ │  Repositories   │
│   (UI Layer)    │    │ (Business Logic) │    │ (Data Access)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                ↓
                       ┌──────────────────┐
                       │   Blockchain     │
                       │ (Solana/SAS/NFT) │
                       └──────────────────┘
```

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+
- **Solana Wallet** (Solflare, Phantom, or Backpack browser extension)
- **Git** for version control

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd nddv
npm install
```

### 2. Environment Setup

```bash
cp env.template .env.local
```

Edit `.env.local` with your configuration:

- **Privy App ID**: Get from [Privy Dashboard](https://dashboard.privy.io/)
- **Database URL**: Your PostgreSQL connection string
- **Solana RPC**: Use devnet for development
- **JWT Secret**: Generate a secure 32+ character string

### 3. Database Setup

```bash
# Create database
createdb nddv_db

# Run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```text
src/
├── components/           # React components
│   ├── auth/            # Authentication components
│   ├── documents/       # Document management UI
│   ├── dashboard/       # User dashboard
│   └── ui/              # Reusable UI components
├── lib/                 # Configuration and utilities
│   ├── prisma/          # Database client and config
│   ├── privy/           # Authentication setup
│   └── solana/          # Blockchain integration
├── repositories/        # Database interaction layer
│   ├── interfaces/      # Repository contracts
│   └── implementations/ # Concrete implementations
├── services/           # Business logic layer
│   ├── interfaces/      # Service contracts
│   └── implementations/ # Business logic implementations
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── repositories/       # Data access patterns
```

## 🔗 Environment Variables

See `env.template` for all required environment variables. Key configurations:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_PRIVY_APP_ID` | Privy application ID | `clxxx...` |
| `PRIVY_APP_SECRET` | Privy app secret (keep secure) | `xxx...` |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | Solana RPC endpoint | `https://api.devnet.solana.com` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/nddv_db` |
| `JWT_SECRET` | JWT signing secret (32+ chars) | `your-super-secure-secret-key-here` |

## 🔨 Development Commands

```bash
# Development with Turbo
npm run dev

# Production build
npm run build

# Start production server
npm start

# Database operations
npx prisma migrate dev     # Run migrations
npx prisma generate        # Generate client
npx prisma studio         # Database GUI
npx prisma db seed        # Seed database

# Code quality
npm run lint              # Run ESLint
npm run type-check        # TypeScript check
```

## ⛓ Blockchain Integration

### Document Types & Blockchain Strategy

**Identity Documents** (SAS Attestations):

- Birth Certificates
- National IDs
- Passports
- Driver's Licenses
- Professional Licenses
- Academic Certificates

**Ownership Documents** (NFTs):

- Land Titles
- Property Deeds
- Vehicle Registrations
- Intellectual Property

### Verification Process

1. **Document Upload**: User uploads document with metadata
2. **Encryption**: Sensitive data is encrypted client-side
3. **Blockchain Issuance**:
   - Identity docs → SAS attestation
   - Ownership docs → Metaplex NFT
4. **Storage**: Encrypted data stored on Arweave
5. **Verification**: Public verification via blockchain proofs

## 🔒 Security Features

- **Zero-Knowledge Architecture**: Sensitive data never leaves user control unencrypted
- **Multi-Signature Support**: High-value documents can require multiple signatures
- **Time-Based Permissions**: Shared access can have expiration dates
- **Audit Logging**: All document activities are logged immutably
- **IP-Based Restrictions**: Optional geographic access controls

## 🔧 Troubleshooting

### Wallet Connection Issues

**Solflare not detected:**

1. Ensure extension is installed and enabled
2. Refresh the page (Ctrl+R / Cmd+R)
3. Check browser console for `[PrivyProvider]` logs
4. Try hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

**Other wallet issues:**

- Disable conflicting wallet extensions temporarily
- Clear browser cache and cookies
- Try incognito/private browsing mode

For detailed troubleshooting, see [SETUP.md](./SETUP.md).

## 📖 Documentation

- **[Setup Guide](./SETUP.md)**: Detailed setup and troubleshooting
- **[Implementation Plan](./implementation_plan.md)**: Complete technical architecture
- **[Claude Instructions](./CLAUDE.md)**: Development guidelines for AI assistance

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow the established Repository & Service pattern
- Maintain TypeScript strict mode compliance
- Write tests for new features
- Follow the existing code style and conventions
- Update documentation for significant changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: Report bugs and request features via GitHub Issues
- **Documentation**: Check existing docs in the repository
- **Community**: Join our discussions for help and collaboration

## 🎯 Project Status

**Current Phase**: Foundation Setup & Core Infrastructure
**Next Milestone**: Blockchain Integration & Document Operations

For the complete development roadmap, see [implementation_plan.md](./implementation_plan.md).

---

Built with ❤️ for secure digital governance
