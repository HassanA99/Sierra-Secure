# 🎯 NDDV Project Structure - Best Practices

## Root Level Organization

```
National-Digital-Document-Vault-NDDV-/
├── 📂 src/                    # All application source code
├── 📂 prisma/                 # Database schema & migrations
├── 📂 public/                 # Static assets (images, icons)
├── 📂 docs/                   # Documentation files
├── 📂 tests/                  # Test files (unit, integration, e2e)
├── 📂 scripts/                # Build and automation scripts
├── 📂 .next/                  # Next.js build output (generated)
├── 📂 node_modules/           # Dependencies (generated)
├── 📄 .env.local              # Local environment variables (gitignored)
├── 📄 .env.template           # Environment variable template
├── 📄 package.json            # Project dependencies and scripts
├── 📄 tsconfig.json           # TypeScript configuration
├── 📄 next.config.ts          # Next.js configuration
├── 📄 postcss.config.mjs      # PostCSS configuration
├── 📄 README.md               # Project README
└── 📄 QUICK_START_SETUP.ps1   # Windows setup script
```

## `src/` Directory Structure (Complete)

```
src/
├── 📂 app/                    # Next.js App Router
│   ├── 📂 (auth)/             # Auth routes group [no route segment]
│   │   ├── login/
│   │   ├── register/
│   │   └── onboarding/
│   ├── 📂 (dashboard)/        # Dashboard group [no route segment]
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── 📂 api/                # API routes
│   │   ├── auth/
│   │   ├── blockchain/
│   │   ├── documents/
│   │   ├── permissions/
│   │   ├── forensic/
│   │   └── verify/
│   ├── 📂 documents/          # Documents page route
│   │   └── page.tsx
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home/landing page
│   ├── globals.css            # Global styles
│   └── favicon.ico
│
├── 📂 components/             # React Components (organized by feature)
│   ├── 📂 auth/
│   │   ├── LoginForm.tsx
│   │   ├── PrivyProvider.tsx
│   │   └── LogoutButton.tsx
│   ├── 📂 dashboard/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── DocumentUpload.tsx
│   │   ├── DocumentList.tsx
│   │   ├── ForensicResultsPanel.tsx
│   │   ├── NFTPanel.tsx
│   │   └── PermissionsPanel.tsx
│   ├── 📂 ui/
│   │   └── 📂 modals/
│   │       ├── ShareModal.tsx
│   │       ├── MintModal.tsx
│   │       └── ConfirmDialog.tsx
│   └── 📂 documents/
│       └── forensic/
│
├── 📂 hooks/                  # Custom React Hooks
│   ├── useAuth.ts             # Auth state management hook
│   ├── useFetch.ts            # Authenticated fetch hook
│   └── index.ts               # Export all hooks
│
├── 📂 lib/                    # Shared libraries & utilities
│   ├── 📂 db/
│   │   └── client.ts          # Prisma client instance
│   ├── 📂 auth/
│   │   └── helpers.ts         # Auth utilities (token management)
│   ├── 📂 blockchain/
│   │   └── helpers.ts         # Blockchain utilities (Solana address validation)
│   ├── 📂 validation/
│   │   └── validators.ts      # Form and data validation
│   ├── 📂 privy/
│   │   ├── config.ts          # Privy configuration
│   │   └── hooks.ts           # Privy React hooks
│   └── 📂 solana/ (optional)
│       └── config.ts          # Solana RPC and wallet config
│
├── 📂 services/               # Business Logic Layer
│   ├── 📂 interfaces/         # Service interfaces
│   │   ├── auth.service.interface.ts
│   │   ├── document.service.interface.ts
│   │   ├── solana.service.interface.ts
│   │   └── ...
│   └── 📂 implementations/    # Service implementations
│       ├── auth.service.ts
│       ├── document.service.ts
│       ├── solana.service.ts
│       ├── ai-forensic.service.ts
│       └── ...
│
├── 📂 repositories/           # Data Access Layer
│   ├── 📂 interfaces/         # Repository interfaces
│   │   ├── user.repository.interface.ts
│   │   ├── document.repository.interface.ts
│   │   └── ...
│   └── 📂 implementations/    # Repository implementations
│       ├── user.repository.ts
│       ├── document.repository.ts
│       ├── attestation.repository.ts
│       ├── nft.repository.ts
│       ├── permission.repository.ts
│       └── ...
│
├── 📂 types/                  # TypeScript Type Definitions
│   ├── api.types.ts
│   ├── blockchain.types.ts
│   ├── document.types.ts
│   ├── forensic.types.ts
│   ├── user.types.ts
│   └── index.ts
│
├── 📂 middleware/             # Authentication & Request Middleware
│   ├── auth.ts                # JWT verification middleware
│   └── cors.ts                # CORS configuration
│
└── 📂 utils/                  # Utility Functions
    ├── constants.ts           # Application constants
    ├── encryption.ts          # Encryption utilities
    ├── validation.ts          # Validation helpers
    └── helpers.ts             # General helpers
```

## Key Design Patterns

### 1. **Repository Pattern**
- Abstracts database access
- All Prisma calls go through repositories
- Easy to mock for testing

```
Database ← Repository ← Service ← API Route
```

### 2. **Service Layer Pattern**
- Contains business logic
- Orchestrates repositories and external services
- Handles transformations and validation

```
API Route → Service → Repositories/External APIs
```

### 3. **Component Organization**
- Components grouped by feature (auth, dashboard, etc)
- Modals in a dedicated `ui/modals/` folder
- Reusable UI components in `ui/` subdirectories

### 4. **Library Organization**
- `lib/` contains shared utilities
- Organized by concern (auth, blockchain, validation, db)
- Each concern can have helpers/utilities

### 5. **Custom Hooks**
- Authentication state: `useAuth()`
- API calls: `useFetch()`
- Centralized in `hooks/` folder
- Exported from `hooks/index.ts`

## Import Conventions

```typescript
// From components
import { Navbar } from '@/components/dashboard/Navbar'
import { ShareModal } from '@/components/ui/modals/ShareModal'

// From hooks
import { useAuth, useFetch } from '@/hooks'

// From services
import { DocumentService } from '@/services/implementations/document.service'

// From repositories
import { DocumentRepository } from '@/repositories/implementations/document.repository'

// From lib utilities
import { validators } from '@/lib/validation/validators'
import { authUtils } from '@/lib/auth/helpers'
import { blockchainUtils } from '@/lib/blockchain/helpers'

// From types
import type { Document, User } from '@/types'
```

## File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `DocumentList.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.ts` |
| Services | camelCase with `.service.ts` suffix | `document.service.ts` |
| Repositories | camelCase with `.repository.ts` suffix | `user.repository.ts` |
| Utilities | camelCase | `validators.ts` |
| Types | camelCase with `.types.ts` suffix | `document.types.ts` |
| API routes | `route.ts` | `src/app/api/documents/route.ts` |

## Configuration Files at Root

| File | Purpose |
|------|---------|
| `.env.local` | Local environment variables (gitignored) |
| `.env.template` | Template with all required variables |
| `tsconfig.json` | TypeScript configuration |
| `next.config.ts` | Next.js configuration |
| `package.json` | Dependencies and npm scripts |
| `postcss.config.mjs` | PostCSS configuration |

## Database (Prisma at Root)

```
prisma/
├── schema.prisma      # Database schema definition
└── migrations/        # Migration history
    ├── 20251130035713_init/
    └── ...
```

**Why at root?** Next.js and most tools expect it there by convention.

## Documentation (at Root)

```
docs/
├── API_DOCUMENTATION.md
├── DEVELOPER_QUICK_REFERENCE.md
├── ARCHITECTURE_DIAGRAMS.md
├── IMPLEMENTATION_COMPLETE.md
└── ...
```

## Tests (Organized by Type)

```
tests/
├── __tests__/            # Unit and component tests
│   ├── components/
│   ├── services/
│   ├── repositories/
│   └── utils/
├── integration/          # Integration tests
├── e2e/                  # End-to-end tests
└── setup.ts              # Test configuration
```

## Scripts (Automation)

```
scripts/
├── seed.ts              # Database seeding
├── migrate.ts           # Database migrations
└── generate.ts          # Code generation
```

## Summary

✅ **Clean separation of concerns** - UI, business logic, data access
✅ **Easy to navigate** - Clear folder structure, logical grouping
✅ **Scalable** - Easy to add features without affecting others
✅ **Testable** - Repositories and services are independently testable
✅ **Best practices** - Follows industry standards for Next.js projects
✅ **Performance** - Proper code splitting and lazy loading potential
✅ **Maintainability** - Clear naming conventions and organization
