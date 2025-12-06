# Architecture Review: Scripts, Programs & Middleware

## 📋 Overview

This document reviews the `scripts/`, `programs/`, and `middleware/` folders, identifies issues, and provides recommendations.

---

## 🔍 **1. SCRIPTS FOLDER** (`/scripts`)

### Current State
- **File**: `verify-pipeline.ts`
- **Purpose**: Test script to verify the document creation pipeline
- **Status**: ⚠️ **Has Issues**

### Issues Found

#### ❌ **Issue 1: Incorrect Import Paths**
```typescript
// ❌ WRONG (current)
import { DocumentService } from '../src/services/implementations/document.service'

// ✅ FIXED
import { DocumentService } from '@/services/implementations/document.service'
```

**Problem**: The script uses relative paths (`../src/...`) which won't work with TypeScript path aliases.

**Solution**: Updated to use `@/` alias (already fixed).

#### ⚠️ **Issue 2: Script Not Executable**
The script is written but there's no npm script to run it.

**Recommendation**: Add to `package.json`:
```json
{
  "scripts": {
    "verify:pipeline": "tsx scripts/verify-pipeline.ts"
  },
  "devDependencies": {
    "tsx": "^4.0.0"
  }
}
```

---

## 🔍 **2. PROGRAMS FOLDER** (`/programs`)

### Current State
- **Location**: `programs/document-permissions/src/lib.rs`
- **Type**: Solana Anchor Program (Rust)
- **Purpose**: Smart contract for document permissions on Solana
- **Status**: ✅ **Well Structured**

### What It Does
1. **Grant Access**: Government grants document access to verifiers
2. **Revoke Access**: Citizens can revoke access anytime
3. **Check Access**: Verifiers can verify access on-chain

### Issues Found

#### ⚠️ **Issue 1: Missing Anchor Configuration**
The program exists but there's no `Anchor.toml` or `Cargo.toml` in the root.

**Required Files**:
```
Anchor.toml          # Anchor project configuration
Cargo.toml           # Rust workspace configuration
programs/document-permissions/Cargo.toml  # Program-specific config
```

**Recommendation**: Initialize Anchor project:
```bash
anchor init document-permissions
# Then move the lib.rs content
```

#### ⚠️ **Issue 2: Placeholder Program ID**
```rust
declare_id!("11111111111111111111111111111111"); // TODO: Replace
```

**Action Required**: Generate a real program ID when deploying.

#### ✅ **What's Good**
- Clean, well-documented Rust code
- Proper error handling
- Good use of Anchor framework
- Clear access control logic

---

## 🔍 **3. MIDDLEWARE FOLDER** (`/src/middleware`)

### Current Structure
```
src/
├── middleware.ts              # Main Next.js middleware entry
└── middleware/
    ├── auth.ts               # Authentication & authorization
    ├── dashboard-router.ts   # Route-based redirects
    └── request-id.ts         # Request tracking
```

### Analysis

#### ✅ **middleware.ts** (Main Entry)
**Status**: ✅ **Good, but optimized**

**What It Does**:
- Entry point for Next.js middleware
- Routes to `dashboardRouter`
- Matches all routes except static files

**Recent Fix**: Added fast-path checks to prevent unnecessary processing.

#### ✅ **dashboard-router.ts**
**Status**: ✅ **Correctly Disabled**

**Why Disabled**: 
- Comment explains: "Prevent conflicts with Privy client-side auth"
- Relies on client-side protection in Layouts/Pages
- This is the correct approach for Privy

**Recommendation**: Keep as-is. Client-side auth is appropriate here.

#### ⚠️ **auth.ts**
**Status**: ⚠️ **Needs Production Improvements**

**Issues**:

1. **In-Memory Rate Limiting** (Lines 175-219)
   ```typescript
   const requestCounts = new Map<string, { count: number; resetAt: number }>()
   ```
   - ❌ Won't work in distributed systems (multiple servers)
   - ❌ Memory leak potential
   - ✅ **Recommendation**: Use Redis for production

2. **JWT Secret Validation** (Lines 5-13)
   - ✅ Good: Validates JWT_SECRET is set
   - ⚠️ Uses default in dev (acceptable)
   - ✅ Throws error in production if missing

3. **Functions Provided**:
   - ✅ `withAuth` - JWT validation
   - ✅ `withOptionalAuth` - Optional JWT
   - ✅ `withRole` - Role-based access (stubbed)
   - ⚠️ `withRateLimit` - In-memory (needs Redis)
   - ✅ `withCORS` - CORS handling

#### ✅ **request-id.ts**
**Status**: ✅ **Perfect**

**What It Does**:
- Adds unique request ID to all requests
- Helps with tracing and debugging
- Well-implemented

---

## 🐛 **4. TIMEOUT ISSUE** (Terminal Output)

### Problem
```
Request timed out after 3000ms
Retrying 1/3...
```

### Root Cause
Next.js middleware has a default 3000ms timeout. During compilation, middleware runs on every request, and if it takes too long, it times out.

### Fix Applied
✅ **Optimized `middleware.ts`** with fast-path checks:
```typescript
// Skip middleware for static files immediately
if (
  pathname.startsWith('/_next/') ||
  pathname.startsWith('/api/') ||
  // ... other static paths
) {
  return NextResponse.next()
}
```

### Additional Recommendations

1. **Increase Middleware Timeout** (if needed):
   ```typescript
   // next.config.ts
   export default {
     experimental: {
       middlewareTimeout: 10000, // 10 seconds
     }
   }
   ```

2. **Monitor Middleware Performance**:
   - Add logging to track slow middleware
   - Consider caching for expensive operations

---

## 📊 **Summary & Recommendations**

### ✅ **What's Good**
1. **Middleware Structure**: Well-organized, clear separation
2. **Rust Program**: Clean, well-documented code
3. **Request ID Tracking**: Properly implemented
4. **Dashboard Router**: Correctly disabled to avoid Privy conflicts

### ⚠️ **Needs Attention**
1. **Script Execution**: Add npm script + tsx dependency
2. **Rate Limiting**: Replace in-memory Map with Redis
3. **Anchor Configuration**: Add Anchor.toml and Cargo.toml
4. **Program ID**: Generate real Solana program ID

### 🔧 **Quick Fixes Applied**
1. ✅ Fixed `verify-pipeline.ts` import paths
2. ✅ Optimized `middleware.ts` with fast-path checks
3. ✅ Added early returns for static assets

### 📝 **Next Steps**
1. Add `tsx` to devDependencies
2. Add `verify:pipeline` script to package.json
3. Initialize Anchor project for Solana program
4. Consider Redis for rate limiting in production
5. Generate real Solana program ID

---

## 🎯 **Priority Actions**

### High Priority
- [ ] Add Anchor.toml configuration
- [ ] Replace in-memory rate limiting with Redis (production)
- [ ] Test middleware timeout fix

### Medium Priority
- [ ] Add npm script for verify-pipeline
- [ ] Generate real Solana program ID
- [ ] Add middleware performance monitoring

### Low Priority
- [ ] Document middleware architecture
- [ ] Add unit tests for middleware
- [ ] Create deployment guide for Solana program

---

**Last Updated**: 2025-01-XX
**Status**: ✅ Issues Identified & Partially Fixed

