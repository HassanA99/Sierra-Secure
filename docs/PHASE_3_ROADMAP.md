# 📋 NDDV PHASE 3 - NEXT IMPLEMENTATION ROADMAP

**Current Status**: Phase 2 Complete (Security + UX overhaul done)  
**Date**: December 2, 2025

---

## 🎯 PHASE 3 PRIORITIES

### IMMEDIATE (This Week - Critical)

#### 1. **Database Migration & Setup** ⚠️ BLOCKING
**Why**: Can't run tests without database  
**What to do**:
```bash
# Run Prisma migrations
npx prisma migrate deploy

# Create test data
npx prisma db seed  # (need to create seed.ts)

# Verify schema
npx prisma studio
```

**Files needed**:
- `prisma/seed.ts` - Test data generator
- `.env.local` - Database connection string

**Estimated Time**: 30 minutes

---

#### 2. **Test Development Server** ⚠️ CRITICAL
**Why**: Verify nothing crashes at startup  
**What to do**:
```bash
npm run dev
# Visit http://localhost:3000
# Check for errors in console
```

**Test**:
- [ ] Homepage loads
- [ ] Login page accessible
- [ ] Citizen login form renders
- [ ] Staff login form renders
- [ ] No TypeScript errors

**Estimated Time**: 15 minutes

---

#### 3. **Fix Missing Implementations** 🔧 IMPORTANT
Several components reference things that don't exist yet:

**Missing API responses**:
- `/api/documents` - Returns current format? Check schema
- `/api/permissions` - Not fully implemented
- `/api/forensic/health` - Endpoint doesn't exist

**Missing Components**:
- `DocumentList.tsx` - Already exists but needs forensic integration
- `DocumentUpload.tsx` - Exists but needs file upload logic
- `Navbar.tsx` - Exists but needs logout logic
- `Sidebar.tsx` - Exists but needs role-aware navigation

**Action**: 
```
Run: grep -r "TODO\|FIXME\|XXX" src/
Review all TODOs and resolve blocking ones
```

**Estimated Time**: 1-2 hours

---

### SHORT TERM (Next 2-3 Days - Phase 3A)

#### 4. **Complete Authentication Flow** 🔐
**What's missing**:
- JWT token verification middleware
- Protected routes (some endpoints accessible without auth)
- Refresh token logic
- Logout functionality

**Files to create**:
```
src/middleware/auth.ts          [VERIFY & COMPLETE]
src/lib/auth/jwt.ts             [NEW] Token helpers
src/lib/auth/verify.ts          [NEW] Verify functions
```

**Test scenarios**:
- [ ] Invalid token → 401 error
- [ ] Valid token → Access granted
- [ ] Expired token → Refresh or re-login
- [ ] Citizen accessing /maker → 403 error
- [ ] Verifier accessing /dashboard → 403 error

**Estimated Time**: 2-3 hours

---

#### 5. **Integrate Forensic Analysis** 🤖
**What works**:
- Gemini AI service exists (ai-forensic.service.ts)
- Forensic status endpoint exists

**What's missing**:
- Wire forensic analysis into document upload
- Real Gemini API integration (currently stubbed?)
- Stream forensic progress to UI (WebSocket or polling)
- Store forensic results properly

**Files to update**:
```
src/services/implementations/document.service.ts
src/components/dashboard/DocumentUpload.tsx
src/components/dashboard/ForensicStatusPanel.tsx
```

**Test scenarios**:
- [ ] Upload document → Gemini analyzes
- [ ] Score 85+ → Auto-approved
- [ ] Score 70-84 → In audit queue
- [ ] Score <70 → Rejected
- [ ] Real biometric data extracted

**Estimated Time**: 2-3 hours

---

#### 6. **Implement Biometric Check** 👤
**What works**:
- Biometric deduplication service exists
- API endpoint exists

**What's missing**:
- Actually call the dedup check during registration
- Store biometric data after forensic analysis
- UI feedback if duplicate detected
- Test with real face data

**Files to update**:
```
src/app/(auth)/onboarding/page.tsx    [NEW or UPDATE]
src/app/api/auth/citizen-login/route.ts
```

**Test scenarios**:
- [ ] First registration → Success, biometric saved
- [ ] Second with same face → Blocked
- [ ] Different face → Success

**Estimated Time**: 1-2 hours

---

### MEDIUM TERM (Days 4-7 - Phase 3B)

#### 7. **Build Document Categories** 📚
**What's missing**:
- UI to filter by category (Identity, Property, etc.)
- Backend queries filtered by type
- Visual grouping in dashboard

**Files to create**:
```
src/components/dashboard/DocumentCategories.tsx [NEW]
```

**Features**:
- Tab-based filtering (All, Identity, Property)
- Count badges ("5 documents")
- Category icons

**Estimated Time**: 1-2 hours

---

#### 8. **Complete Verifier Dashboard** ✅
**What works**:
- UI component built
- Lookup endpoint exists

**What's missing**:
- Real document lookup from database
- QR code scanner integration
- Print functionality
- Audit logging for verifications

**Files to update**:
```
src/components/dashboard/VerifierDashboard.tsx
src/app/api/verify/document/[documentId]/route.ts
```

**Test scenarios**:
- [ ] Scan valid document → Shows details
- [ ] Scan invalid ID → Shows error
- [ ] Print → Creates PDF
- [ ] Audit log recorded

**Estimated Time**: 2-3 hours

---

#### 9. **Complete Maker Dashboard** 📋
**What works**:
- Audit queue UI built
- Approval/rejection logic exists

**What's missing**:
- Real audit queue query (70-84 score documents)
- Forensic breakdown display
- Approval writes to blockchain
- Rejection sends feedback to citizen
- Notification system

**Files to update**:
```
src/components/dashboard/MakerDashboard.tsx
src/app/api/forensic/audit-queue/route.ts
```

**Features to add**:
- Real-time queue updates
- Approve button → Mint NFT/Attestation
- Reject button → Send reason to citizen
- Comments required before action
- Batch operations (approve multiple)

**Estimated Time**: 3-4 hours

---

#### 10. **Payment/Fee Relayer Integration** 💸
**What works**:
- Fee relayer service stubbed
- Pricing API shows all free

**What's missing**:
- Real Solana transaction signing
- Connection to government wallet
- Fee estimation
- Transaction confirmation
- Error handling if relayer fails

**Files to update**:
```
src/services/implementations/fee-relayer.service.ts
src/services/implementations/solana.service.ts
```

**Test scenarios**:
- [ ] Create transaction → Relayer signs
- [ ] Relayer pays fee → User sees Free
- [ ] Relayer fails → Graceful error
- [ ] Track relay for audit

**Estimated Time**: 2-3 hours

---

### LONGER TERM (Week 2+ - Phase 3C)

#### 11. **Notifications System** 🔔
- Email notifications to citizens
- SMS alerts for staff
- In-app notification badges
- Notification preferences

**Estimated Time**: 2-3 hours

---

#### 12. **Document Sharing Execution** 🔗
- Actually execute the sharing logic (currently UI only)
- Create permission records in database
- Set expiry times
- Encrypt shared data
- Generate share links/QR codes

**Estimated Time**: 3-4 hours

---

#### 13. **NFT Minting Integration** 🎨
- Connect to Solana metaplex
- Mint NFTs for approved documents
- Generate metadata/images
- Store mint addresses

**Estimated Time**: 2-3 hours

---

#### 14. **Attestation/SAS Integration** 📜
- Issue SAS attestations for documents
- Store attestation IDs
- Verify attestations on lookup

**Estimated Time**: 2-3 hours

---

#### 15. **Admin Dashboard** 👨‍💼
- Provision staff (create VERIFIER/MAKER accounts)
- Monitor system health
- View analytics
- Manage fee relayer wallet

**Estimated Time**: 4-5 hours

---

## 🚀 IMMEDIATE ACTION PLAN (TODAY)

### Step 1: Database Setup
```bash
# 1. Create .env.local with database URL
# 2. Run migrations
npx prisma migrate deploy

# 3. Test database connection
npx prisma studio
```

### Step 2: Start Server
```bash
npm run dev
# Open http://localhost:3000
# Check console for errors
```

### Step 3: Check All TODOs
```bash
grep -r "TODO\|FIXME\|BLOCKING" src/ --include="*.ts" --include="*.tsx"
```

### Step 4: Fix Critical Issues
Create a checklist of blocking issues and fix them in order

### Step 5: Run E2E Test
Follow `docs/E2E_TESTING_GUIDE.md` to test each flow

---

## 📊 PRIORITY MATRIX

| Task | Priority | Complexity | Time | Blocking | Status |
|------|----------|-----------|------|----------|--------|
| Database setup | 🔴 CRITICAL | Low | 30m | YES | ⏳ TODO |
| Server startup test | 🔴 CRITICAL | Low | 15m | YES | ⏳ TODO |
| Fix missing impls | 🔴 CRITICAL | Medium | 2h | YES | ⏳ TODO |
| Auth middleware | 🟠 HIGH | Medium | 2h | YES | ⏳ TODO |
| Forensic integration | 🟠 HIGH | High | 2h | YES | ⏳ TODO |
| Biometric check | 🟠 HIGH | Medium | 1h | YES | ⏳ TODO |
| Categories UI | 🟡 MEDIUM | Low | 1h | NO | ⏳ TODO |
| Verifier completion | 🟡 MEDIUM | Medium | 2h | NO | ⏳ TODO |
| Maker completion | 🟡 MEDIUM | Medium | 3h | NO | ⏳ TODO |
| Fee relayer | 🟡 MEDIUM | High | 2h | NO | ⏳ TODO |

---

## ⚠️ KNOWN ISSUES TO RESOLVE

### Immediate Blockers:
1. **Database not initialized** - Can't run anything without DB
2. **Gemini API calls** - Are they real or stubbed?
3. **Environment variables** - All set correctly?
4. **TypeScript errors** - Are there any compilation errors?
5. **Missing functions** - Services calling non-existent functions?

### Find with:
```bash
# TypeScript errors
npx tsc --noEmit

# Runtime errors
npm run dev > /tmp/errors.log

# Missing implementations
grep -r "not implemented\|TODO\|throw Error" src/
```

---

## 🎯 SUCCESS CRITERIA FOR PHASE 3

✅ **Server starts without errors**  
✅ **All three login flows work**  
✅ **Document upload triggers forensic analysis**  
✅ **Forensic scores calculated correctly**  
✅ **Biometric deduplication blocks duplicates**  
✅ **Verifier can lookup documents**  
✅ **Maker can approve/reject documents**  
✅ **All costs shown as Free**  
✅ **Full E2E test passes**  
✅ **Zero crypto visible to citizens**  

---

## 📈 TIMELINE ESTIMATE

| Phase | Tasks | Time | Status |
|-------|-------|------|--------|
| **Phase 3A** | Setup + Auth | 1 day | ⏳ TODO |
| **Phase 3B** | Forensic + Biometric | 1-2 days | ⏳ TODO |
| **Phase 3C** | Verifier + Maker | 1-2 days | ⏳ TODO |
| **Phase 3D** | Notifications + Sharing | 1-2 days | ⏳ TODO |
| **Phase 3E** | Blockchain Integration | 2-3 days | ⏳ TODO |
| **Testing** | Full E2E + QA | 1-2 days | ⏳ TODO |

**Total Phase 3 Timeline**: 7-10 days

---

## 🔗 DEPENDENCIES

```
Phase 3A (Database + Auth)
  ↓
Phase 3B (Forensic + Biometric)
  ↓
Phase 3C (Verifier + Maker)
  ↓
Phase 3D (Notifications + Sharing)
  ↓
Phase 3E (Blockchain Integration)
  ↓
Testing & Launch
```

---

## 💡 QUICK WINS (Do First)

These are easy wins that unblock other work:

1. **Database migration** - 30 min, unblocks everything
2. **Fix TypeScript errors** - 30 min, unblocks testing
3. **Verify server starts** - 15 min, confirms no critical issues
4. **Create test data** - 30 min, enables testing
5. **Test citizen login** - 15 min, validates auth flow

**Total quick wins**: ~2 hours, massive value

---

## 📝 NEXT STEPS

**RIGHT NOW**:
1. [ ] Setup database
2. [ ] Start dev server
3. [ ] Check for errors
4. [ ] Fix critical issues
5. [ ] Test login flows

**Then**:
6. [ ] Integrate Gemini forensic
7. [ ] Test document upload + analysis
8. [ ] Test biometric dedup
9. [ ] Complete verifier flow
10. [ ] Complete maker flow

---

## 🤔 QUESTIONS TO ANSWER

Before proceeding:

1. **Is Gemini API key working?**
   - Test: `curl https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY`

2. **Is database connected?**
   - Test: `npx prisma studio` (should open web UI)

3. **Is Privy configured?**
   - Check: `NEXT_PUBLIC_PRIVY_APP_ID` is set

4. **Are all environment variables set?**
   - Check: `.env.local` has all required vars

5. **Are there TypeScript errors?**
   - Run: `npx tsc --noEmit`

---

**Ready to start Phase 3? Let's go! 🚀**
