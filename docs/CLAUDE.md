# 🤖 NDDV - AI & Expert Guidance (`GEMINI.md`)

This file is the essential guide for any expert developer or advanced AI assistant (like Gemini) when navigating the secure, multi-layered architecture of the **National Digital Document Vault (NDDV)**.

## 🎯 Project Mandate and Core Technologies

The NDDV is a mission-critical application focused on national transformation. Its core purpose is to replace fragile paper documents with secure, cryptographically verified digital assets.

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Blockchain** | **Solana** | High-throughput base layer for low-cost, scalable transactions. |
| **Identity/Status** | **Solana Attestation Service (SAS)** | Immutable, non-transferable proof of facts (e.g., Birth Certificates, Academic Records). |
| **Ownership/Assets** | **NFTs (Metaplex)** | Unique, transferable title records (e.g., Land Deeds, Business Registrations). |
| **AI/Security** | **Gemini Multimodal Model** | **Pre-Blockchain Verification** for forensic tamper detection and compliance analysis on uploaded documents. |
| **Data Storage** | **Arweave** | Permanent, decentralized storage for encrypted document payload. |
| **Authentication** | **Privy** | Embedded wallet and social login for seamless citizen onboarding and secure key management. |

-----

## 🏗️ Project Architecture: Repository & Service Pattern

The project enforces a **Clean Architecture** with strict separation of concerns. **All core business, security, and blockchain orchestration logic must reside within the Service Layer.**

### 1\. Service Layer (`src/services/`)

  * **Role:** The command center. It executes business workflows, handles security checks, and orchestrates calls to the Blockchain, AI, and Repository layers.
  * **Key Services:**
      * **`document.service.ts`**: Manages the complete document lifecycle (Upload $\rightarrow$ AI Check $\rightarrow$ Storage $\rightarrow$ Blockchain).
      * **`solana.service.ts`**: Encapsulates all interactions with the Solana network (SAS, Metaplex NFT minting).
      * **`gemini.ai.service.ts`**: Executes complex multimodal verification and compliance tasks.

### 2\. Repository Layer (`src/repositories/`)

  * **Role:** Handles direct **CRUD** operations with the database (**PostgreSQL/Prisma**). It is a passive layer that fetches and stores data only.
  * **Constraint:** Repositories must **never** contain business logic, validation, or service-to-service calls.

### 3\. Controller Layer (Next.js API Routes - in `app/api/`)

  * **Role:** Handles HTTP requests and returns responses. They are minimal wrappers over the Service Layer.

-----

## 📂 Key Project Structure

This structure highlights the architectural separation and the location of critical files.

```
NATIONAL-DIGITAL-DOCUMENT-VAULT-NDDV-
├── app/                  # Next.js App Router (UI & API Routes)
│   └── api/              # Controllers/API Endpoints
├── prisma/               # Database Schema & Migrations
├── public/               # Static assets
└── src/                  # CORE APPLICATION LOGIC
    ├── components/       # Reusable React components
    ├── lib/              # Configuration & Clients (Prisma, Privy, Solana)
    ├── repositories/     # Database Access Interfaces and Implementations
    ├── services/         # BUSINESS LOGIC (Primary Focus)
    └── types/            # Shared TypeScript Interfaces and Enums
```

-----

## 🧠 AI Integration Guidance (Gemini)

The **`gemini.ai.service.ts`** is critical for the Pre-Blockchain Verification phase.

### Primary Function

The service must expose key functions for **Document Forensics and Tamper Detection**:

  * `verifyMultimodal(documentImage: File, expectedType: DocumentType): Promise<AIScore>`
  * `analyzeCompliance(extractedData: object): Promise<ComplianceReport>`

### Document Lifecycle Priority

Ensure the AI check is executed immediately after file upload and encryption, **BEFORE** the Arweave storage or any Solana transaction:
$$\text{Upload} \rightarrow \text{Encryption} \rightarrow \textbf{AI Verification} \rightarrow \text{Arweave Storage} \rightarrow \text{Blockchain Record}$$

-----

## ⚙️ Development Commands

| Command | Description | Notes |
| :--- | :--- | :--- |
| `npm run dev` | Start development server with Turbo (http://localhost:3000). | Use this for development hot-reloading. |
| `npm run build` | Build production application with Turbo. | |
| `npm start` | Start production server. | Run after a successful build. |
| `npx prisma migrate dev` | Run database migrations after changes to `schema.prisma`. | **Essential for database updates.** |
| `npx prisma studio` | Launch Database GUI. | Essential for inspecting `User`, `Document`, and `AuditLog` records. |
| `npm run lint` | Code quality check. | Must pass before committing or opening a Pull Request. |

-----

## 💻 Technology Stack & Configuration

| Category | Detail |
| :--- | :--- |
| **Framework** | Next.js 15 with App Router |
| **Language** | **TypeScript** with **Strict Mode Enabled** |
| **Styling** | Tailwind CSS v4 with PostCSS configuration |
| **Build Tool** | Turbo (enabled for `dev` and `build` commands) |
| **TypeScript Config** | Path alias `@/*` maps to project root. Target: ES2017. |
| **Styling Approach**| CSS custom properties for fonts, dark mode support (`dark:` prefixes), and responsive design (`sm:` breakpoints). |