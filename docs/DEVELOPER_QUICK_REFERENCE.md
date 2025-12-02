# NDDV Developer Quick Reference

## 🚀 Quick Start (60 seconds)

### Windows PowerShell
```powershell
.\QUICK_START_SETUP.ps1
```

### Linux/Mac
```bash
bash SETUP.sh
```

### Manual (All Platforms)
```bash
# 1. Setup environment
cp env.template .env.local
# Edit .env.local with your values

# 2. Install & setup
npm install
npm run prisma:generate
npm run prisma:migrate-deploy

# 3. Start development
npm run dev
```

## 📂 Project Structure

```
app/
├── api/
│   ├── auth/route.ts           ← Authentication (login, verify, logout, me)
│   ├── blockchain/route.ts     ← Blockchain (attestations, NFTs, transfers)
│   ├── documents/route.ts      ← Documents (list, create, forensic)
│   │   └── [documentId]/route.ts ← Document detail (get, update, delete)
│   ├── permissions/route.ts    ← Sharing (share, list, revoke)
│   └── verify/route.ts         ← Verification (verify, batch, audit-logs)
├── documents/
├── landing/
├── onboarding/
├── register/
└── layout.tsx

src/
├── services/implementations/
│   ├── ai-forensic.service.ts   ← Gemini AI analysis
│   ├── auth.service.ts          ← User auth & KYC
│   ├── document.service.ts      ← Document orchestration
│   └── solana.service.ts        ← Blockchain operations
├── repositories/implementations/
│   ├── attestation.repository.ts ← SAS attestations
│   ├── document.repository.ts    ← Documents
│   ├── nft.repository.ts         ← NFTs
│   ├── permission.repository.ts  ← Permissions
│   └── user.repository.ts        ← Users
├── middleware/
│   └── auth.ts                  ← JWT, rate limiting, CORS
├── lib/
│   ├── prisma/client.ts         ← DB client
│   ├── privy/config.ts          ← Privy setup
│   └── privy/hooks.ts           ← React hooks
├── types/
│   ├── api.types.ts
│   ├── blockchain.types.ts
│   ├── document.types.ts
│   ├── forensic.types.ts
│   └── user.types.ts
└── utils/

prisma/
├── schema.prisma                ← Database schema
└── migrations/                  ← Migration history

docs/
├── API_DOCUMENTATION.md         ← Complete API reference
├── FORENSIC_IMPLEMENTATION_GUIDE.md
├── ARCHITECTURE_DIAGRAMS.md
├── IMPLEMENTATION_COMPLETE.md
└── VERIFICATION_CHECKLIST.md
```

## 🔑 Key Files

### Environment
- `env.template` - Copy to `.env.local` and configure

### Setup
- `QUICK_START_SETUP.ps1` - Windows setup
- `SETUP.sh` - Linux/Mac setup

### Database
- `prisma/schema.prisma` - DB schema definition
- Run: `npm run prisma:migrate-deploy`

### API Testing
- Postman collection: (create one)
- cURL examples in `docs/API_DOCUMENTATION.md`

## 🔌 API Endpoints

## 🖥️ Dashboard (Phase 2)

- **Route**: `app/dashboard` — main developer dashboard for upload, list, forensic view, and per-document actions (share, mint, delete).
- **Client token**: The frontend reads the JWT from `localStorage` key `nddv_token`. To test protected endpoints manually, add a token in the browser console:

```js
localStorage.setItem('nddv_token', '<YOUR_JWT>')
```

- **Primary UX flows**:
  - Upload a document: POST `/api/documents` (multipart). Forensic analysis runs after upload.
  - View documents: GET `/api/documents` — select a document to fetch `/api/verify/document?documentId=...` for forensic summary.
  - Share: POST `/api/permissions/share` with `{ documentId, recipientId, type, expiresIn }`.
  - Mint NFT: POST `/api/blockchain/nfts` with `{ documentId, name, symbol, uri }`.
  - Delete: DELETE `/api/documents/{id}`.

- **Developer tips**:
  - If an endpoint returns 401, ensure the `nddv_token` is set and valid.
  - The dashboard components are in `src/components/dashboard/` and use simple Tailwind utility classes and ARIA attributes for accessibility.
  - The forensic panel shows `complianceScore`, `tamperingDetected`, `confidenceLevel`, and `recommendations` returned from the verify endpoint.


### Authentication
```
POST   /api/auth/login              Login
POST   /api/auth/verify             Verify signature
POST   /api/auth/logout             Logout
GET    /api/auth/me                 Current user
```

### Documents
```
GET    /api/documents               List (with pagination)
POST   /api/documents               Upload with forensic
GET    /api/documents/[id]          Get details
PUT    /api/documents/[id]          Update metadata
DELETE /api/documents/[id]          Delete
```

### Blockchain
```
POST   /api/blockchain/attestations Create attestation
GET    /api/blockchain/attestations List attestations
POST   /api/blockchain/nfts         Mint NFT
GET    /api/blockchain/nfts         List NFTs
POST   /api/blockchain/transfer     Transfer NFT
GET    /api/blockchain/verify       Verify ownership
```

### Permissions
```
POST   /api/permissions/share       Share document
GET    /api/permissions             List permissions
DELETE /api/permissions             Revoke permission
```

### Verification
```
GET    /api/verify/document         Verify document
POST   /api/verify/batch            Batch verify
GET    /api/verify/audit-logs       Audit logs
```

## 📦 npm Scripts

```bash
npm run dev                 # Development (Turbopack)
npm run build              # Production build
npm run start              # Production server
npm run lint               # Linting
npm run type-check         # TypeScript check
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Create migration
npm run prisma:migrate-deploy  # Apply migrations
npm run prisma:reset       # Reset database (dev only)
npm run prisma:studio      # Open Prisma Studio GUI
```

## 🔐 Authentication Flow

```
Client                          Server
  |                               |
  +------ POST /auth/login ------>|
  |      (privyUserId, email)     |
  |                               |
  |<---- JWT Token + User Data ---|
  |                               |
  +-- GET /documents ------------>| (Bearer token)
  | (Authorization: Bearer ...)   |
  |                               |
  |<---- Document List ----------|
```

## 🛡️ Security Notes

- **JWT Secret**: Change in `.env.local` (min 32 chars)
- **Rate Limiting**: 100 requests/minute per user
- **File Upload**: Max 50MB, JPEG/PNG/PDF only
- **Database**: Use PostgreSQL (never SQLite in production)
- **Solana**: Use devnet for testing, mainnet for production

## 🐛 Common Issues

### "Cannot find module '@prisma/client'"
```bash
npm run prisma:generate
npm install
```

### "DATABASE_URL not found"
```bash
# Check .env.local exists and has DATABASE_URL
cp env.template .env.local
# Edit .env.local with your PostgreSQL connection
```

### "Invalid Solana address"
- Ensure address is valid base58 (44 chars)
- Check you're using correct network (devnet vs mainnet)

### "Token expired"
- JWT tokens expire after 24 hours
- Client must handle refresh/re-login

## 📚 Documentation

| Doc | Purpose |
|-----|---------|
| `API_DOCUMENTATION.md` | Complete API reference with examples |
| `FORENSIC_IMPLEMENTATION_GUIDE.md` | Detailed forensic system guide |
| `ARCHITECTURE_DIAGRAMS.md` | System architecture and flows |
| `VERIFICATION_CHECKLIST.md` | Implementation verification |
| `IMPLEMENTATION_COMPLETE.md` | Phase 1 summary |

## 🔗 Key Technologies

| Tech | Version | Purpose |
|------|---------|---------|
| Next.js | 15.5.4 | Framework |
| TypeScript | 5 | Type safety |
| Prisma | 6.17.1 | ORM |
| PostgreSQL | 14+ | Database |
| Solana Web3 | 1.98.4 | Blockchain |
| Privy | 3.3.0 | Wallet auth |
| Google Gemini | API | AI analysis |
| Tailwind | 4 | Styling |

## 💡 Development Tips

### Adding New API Endpoint
1. Create file in `app/api/{feature}/route.ts`
2. Export GET, POST, PUT, DELETE functions
3. Use `request.headers.get('x-user-id')` for auth
4. Import and use services from `src/services`
5. Add to `docs/API_DOCUMENTATION.md`

### Adding New Database Model
1. Update `prisma/schema.prisma`
2. Create migration: `npm run prisma:migrate`
3. Implement repository in `src/repositories/implementations/`
4. Create service in `src/services/implementations/`
5. Wire into API routes

### Testing Endpoints
```bash
# Using cURL
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <token>" \
  -H "x-user-id: <user-id>"

# Using Postman
# Import from docs/API_DOCUMENTATION.md examples
```

## 🚀 Deployment

### Vercel (Recommended for Next.js)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables
Set on deployment platform:
- `NEXT_PUBLIC_PRIVY_APP_ID`
- `PRIVY_APP_SECRET`
- `DATABASE_URL` (production PostgreSQL)
- `JWT_SECRET` (strong random value)
- `GOOGLE_API_KEY`
- `NEXT_PUBLIC_SOLANA_RPC_URL` (mainnet)

## 📞 Support Resources

- **GitHub Issues**: Report bugs
- **Discussions**: Ask questions
- **Docs Folder**: `docs/`
- **API Reference**: `docs/API_DOCUMENTATION.md`
- **Architecture**: `docs/ARCHITECTURE_DIAGRAMS.md`

## ✅ Pre-Deployment Checklist

- [ ] All endpoints tested
- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] JWT_SECRET is strong random value
- [ ] CORS_ORIGIN configured
- [ ] Privy credentials set
- [ ] Google API key configured
- [ ] Solana RPC URL set (mainnet)
- [ ] Database backups configured
- [ ] Monitoring/logging enabled
- [ ] Rate limiting tested
- [ ] Error handling verified

---

**Last Updated**: Phase 1 Implementation Complete
**Status**: ✅ Production Ready (Testing Required)
