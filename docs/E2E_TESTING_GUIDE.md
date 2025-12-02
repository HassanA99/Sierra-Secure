# 🚀 NDDV E2E Testing Guide

Complete testing guide for all three user flows: Citizen, Verifier, Maker

---

## 🏛️ CITIZEN FLOW (Musa's Journey)

### 1️⃣ CITIZEN LOGIN (Phone + PIN Only)

**Goal**: Login feels like WhatsApp, not crypto

**Test Steps**:
```
1. Go to http://localhost:3000/login
2. Click "Citizen" card
3. Enter phone number: +256 701 234567
4. Click "Continue"
5. Enter PIN: 123456
6. Click "Login"
7. Should redirect to /dashboard
```

**Expected Behavior**:
- ✅ NO "Connect Wallet" button visible
- ✅ NO "Phantom" or "Solana" mentioned anywhere
- ✅ NO private keys or seed phrases shown
- ✅ NO crypto language ("wallet," "transaction," "blockchain")
- ✅ Simple government-app UI (blue color scheme)
- ✅ Token stored in localStorage
- ✅ User role = CITIZEN

**Hidden Behind Scenes**:
- Privy auto-creates embedded Solana wallet
- Wallet is completely invisible to user
- User never knows crypto exists

---

### 2️⃣ CITIZEN UPLOADS DOCUMENT

**Test Steps**:
```
1. On dashboard, click "Upload Document"
2. Select file: test-id.jpg (ID photo)
3. Select document type: "NATIONAL_ID"
4. Enter title: "My National ID"
5. Click "Upload"
```

**Expected Behavior**:
- ✅ Shows "Analyzing Document Security..." (spinner)
- ✅ After 3 seconds, shows forensic status
- ✅ Test with different scores:

  **Score 85+**: GREEN checkmark
  ```
  ✓ Document Approved
  "Verified and will be written to blockchain"
  ```

  **Score 70-84**: ORANGE warning
  ```
  ⏳ Document Under Review
  "Government staff reviewing. Usually 1-2 hours"
  ```

  **Score <70**: RED X
  ```
  ✗ Document Rejected
  "Please upload a clearer copy"
  ```

**Hidden Behind Scenes**:
- Gemini AI analyzes document
- Checks for tampering, forgery, quality
- Extracts facial biometric data
- System checks if face already registered (dedup)
- If 85+: Auto-writes to blockchain (zero fees)
- If 70-84: Sent to maker queue
- If <70: User can retry

---

### 3️⃣ BIOMETRIC DEDUPLICATION CHECK

**Test Steps**:
```
1. Upload ID from Person A (face)
2. System saves biometric hash
3. Try to create new citizen account with same ID
4. System should BLOCK: "This identity already registered"
```

**Expected Behavior**:
- ✅ First registration: SUCCESS
- ✅ Second registration with same face: BLOCKED
- ✅ Message: "An identity is already linked to this data"
- ✅ Prevents fake duplicate accounts

---

### 4️⃣ CITIZEN SHARES DOCUMENT

**Test Steps**:
```
1. Click on an uploaded document
2. Click "Share" button
3. Modal appears with toggles:
   - Full Name (toggle ON/OFF)
   - Date of Birth (toggle ON/OFF)
   - Address (toggle ON/OFF)
   - Document Number (toggle ON/OFF)
   - Expiry Date (toggle ON/OFF)
4. Select duration: "1 Day"
5. See price: "Free" (green badge)
6. Click "Share Document"
```

**Expected Behavior**:
- ✅ Can select exactly which fields to share
- ✅ Can choose time limit (1h, 1d, 1w, 1m, unlimited)
- ✅ Price ALWAYS shows "Free"
- ✅ NO mention of gas fees or blockchain costs
- ✅ After share, shows "Shared until [date]"

**Hidden Behind Scenes**:
- System creates Solana transaction
- Fee relayer (government wallet) signs it
- Citizen never sees the fee

---

### 5️⃣ CITIZEN CHECKS DOCUMENT STATUS

**Test Steps**:
```
1. Dashboard shows list of documents
2. Each document shows:
   - Title
   - Type (National ID, Passport, etc.)
   - Status badge
   - Last updated date
3. Click on document to see full details
```

**Expected Behavior**:
- ✅ Documents organized by category:
  - **Identity**: Passport, National ID, Driver's License
  - **Property**: Land Title, Vehicle Registration, Property Deed
- ✅ Status shows: PENDING, VERIFIED, REJECTED, EXPIRED
- ✅ Forensic score visible (85+, 70-84, or <70)
- ✅ Share/Delete buttons always visible

---

## 👮 VERIFIER FLOW (Bank Teller or Police)

### 1️⃣ VERIFIER LOGIN

**Test Steps**:
```
1. Go to http://localhost:3000/login
2. Click "Government Staff" card
3. Enter Staff ID: VER-123456
4. Enter password: MySecurePass123
5. Click "Login"
6. Should redirect to /verifier
```

**Expected Behavior**:
- ✅ Different UI from citizen
- ✅ Professional dashboard
- ✅ Role badge shows "VERIFIER"
- ✅ Large input box for document lookup

---

### 2️⃣ VERIFIER SCANS/ENTERS DOCUMENT ID

**Test Steps**:
```
1. On Verifier dashboard, see large input box
2. Option 1: Scan QR code
   - Click camera icon
   - Scan QR from citizen's document
3. Option 2: Enter manually
   - Enter document ID: DOC12345ABC
   - Click "Verify"
```

**Expected Behavior**:
- ✅ Large input field with camera option
- ✅ After search, shows:
  
  **If Valid** (GREEN):
  ```
  ✓ VALID
  - Type: National ID
  - Holder: Musa Ahmed
  - Phone: +256 701 234567
  - Last Verified: [timestamp]
  ```

  **If Invalid** (RED):
  ```
  ✗ INVALID
  - Document not found or expired
  ```

- ✅ "Print Verification" button for record
- ✅ "Search Another" button

**Hidden Behind Scenes**:
- NO blockchain jargon
- NO "attestation" or "mint" mentioned
- Just: VALID or INVALID
- Lookup is instant

---

### 3️⃣ VERIFIER PRINTS VERIFICATION

**Test Steps**:
```
1. After verification, see "Print Verification" button
2. Click it
3. Browser print dialog opens
4. Print or save as PDF
```

**Expected Behavior**:
- ✅ Printed/PDF shows:
  - Government seal/logo
  - Document status: VALID
  - Verification timestamp
  - Verifier info
  - QR code linking to verification

---

## 🖊️ MAKER FLOW (Ministry Staff - Issue & Review)

### 1️⃣ MAKER LOGIN

**Test Steps**:
```
1. Go to http://localhost:3000/login
2. Click "Government Staff" card
3. Enter Staff ID: MAK-789012
4. Enter password: MySecurePass789
5. Click "Login"
6. Should redirect to /maker
```

**Expected Behavior**:
- ✅ Professional government dashboard
- ✅ Role badge shows "MAKER"
- ✅ Two tabs: "Document Review" (with count badge) and "Issue New"

---

### 2️⃣ MAKER REVIEWS AUDIT QUEUE

**Test Steps**:
```
1. Click "Document Review" tab
2. See count badge: "📋 5" (5 documents waiting)
3. List shows documents with score 70-84:
   - Document Type
   - Upload time
   - Score: 75
4. Click on document to see details
```

**Expected Behavior**:
- ✅ Audit queue shows documents needing human review
- ✅ Only docs with score 70-84 appear here
- ✅ Sorted by upload time (oldest first)
- ✅ Count updates in real-time

---

### 3️⃣ MAKER REVIEWS FORENSIC BREAKDOWN

**Test Steps**:
```
1. Click on document in queue
2. Right panel shows:
   - Uploader info (name, email, phone)
   - Score: 75/100
   - Breakdown:
     • Integrity: 78%
     • Authenticity: 72%
     • Metadata: 80%
     • OCR: 70%
     • Biometric: 75%
     • Security: 76%
3. See textarea for "Your Assessment"
```

**Expected Behavior**:
- ✅ Clear visual breakdown of all scores
- ✅ Color coding (green for high, orange for mid, red for low)
- ✅ Uploader contact info visible
- ✅ Comment field required before approve/reject

---

### 4️⃣ MAKER APPROVES DOCUMENT

**Test Steps**:
```
1. Review the forensic breakdown
2. Optionally add comments: "Face quality excellent, metadata valid"
3. Click "✓ Approve & Write to Blockchain"
4. Should see: "Document approved and written to blockchain"
```

**Expected Behavior**:
- ✅ Document removed from queue
- ✅ Status changes to VERIFIED
- ✅ Document written to blockchain (SAS or NFT)
- ✅ Citizen receives notification
- ✅ Audit log created

**Hidden Behind Scenes**:
- System calls solana-service to mint NFT or write attestation
- Fee relayer signs transaction
- Government pays the fee
- Blockchain records immutably

---

### 5️⃣ MAKER REJECTS DOCUMENT

**Test Steps**:
```
1. Review document and find issues
2. Add comments: "Face is blurry, ID appears forged"
3. Click "✗ Reject"
4. Should see: "Document rejected"
```

**Expected Behavior**:
- ✅ Document removed from queue
- ✅ Status changes to REJECTED
- ✅ Citizen sees error message with tips
- ✅ Citizen can re-upload clearer version
- ✅ Maker comments visible only to citizen (in feedback)

---

### 6️⃣ MAKER ISSUES NEW DOCUMENT

**Test Steps**:
```
1. Click "Issue New Document" tab
2. Form appears for:
   - Document Type (Birth Certificate, Land Title, etc.)
   - Recipient Phone Number
   - Data fields (name, DOB, etc.)
   - Issue Date / Expiry Date
3. Fill form and click "Issue"
```

**Expected Behavior**:
- ✅ New document created with government signature
- ✅ Automatically written to blockchain
- ✅ NFT minted if document type allows
- ✅ Citizen receives notification
- ✅ Cost: $0 (hidden fee relay)

---

## 🔄 COMPLETE FLOW TEST

### Full Journey (10 minutes)

```
STEP 1: Citizen logs in
  Time: 1 min
  Path: /login → /dashboard
  ✅ No crypto visible

STEP 2: Citizen uploads ID
  Time: 2 min
  Action: Upload file
  Result: Forensic analysis shows score 85+
  Status: Auto-approved ✓

STEP 3: Biometric check passes
  Time: Automatic
  Action: System checks face against existing users
  Result: No duplicate, unique face

STEP 4: Citizen shares document
  Time: 1 min
  Action: Select fields, choose duration
  Price: Free (shown to citizen)
  Result: Document shared for 1 day

STEP 5: Verifier checks document
  Time: 1 min
  Action: Enter document ID or scan QR
  Result: VALID status shown
  Print: Can print verification

STEP 6: Maker reviews audit queue
  Time: 1 min
  Action: See queue of 70-84 score documents
  Result: Can approve or reject with comments

TOTAL TIME: 10 minutes
ALL FLOWS TESTED
✅ ALL CRYPTO HIDDEN
✅ ALL COSTS ZERO
✅ ALL UX SIMPLE
```

---

## 🧪 TEST DATA

### Citizen Account
```
Phone: +256 701 234567
PIN: 123456
Role: CITIZEN
```

### Verifier Account
```
Staff ID: VER-123456
Password: MySecurePass123
Role: VERIFIER
```

### Maker Account
```
Staff ID: MAK-789012
Password: MySecurePass789
Role: MAKER
```

### Test Documents
```
- test-id.jpg (score 85+) → Auto-approved ✓
- test-id-blurry.jpg (score 60) → Rejected ✗
- test-id-medium.jpg (score 75) → Human review ⏳
```

---

## 📊 VERIFICATION CHECKLIST

- [ ] ✅ Citizen login has NO crypto language
- [ ] ✅ Forensic analysis shows "Analyzing..." spinner
- [ ] ✅ Score 85+ shows green checkmark
- [ ] ✅ Score 70-84 shows orange warning + human queue
- [ ] ✅ Score <70 shows red X + retry message
- [ ] ✅ Biometric deduplication blocks duplicates
- [ ] ✅ Sharing modal has toggles and time limits
- [ ] ✅ ALL prices show "Free" to citizen
- [ ] ✅ Verifier gets instant VALID/INVALID status
- [ ] ✅ Maker sees audit queue with 70-84 scores
- [ ] ✅ Maker can approve/reject with comments
- [ ] ✅ No "gas fees" mentioned anywhere
- [ ] ✅ No "wallet" buttons on citizen interface
- [ ] ✅ All three dashboards load at /dashboard, /verifier, /maker
- [ ] ✅ Role-based access control working
- [ ] ✅ Audit logs record all actions

---

## 🐛 DEBUGGING

### If forensic analysis fails:
```
1. Check GEMINI_API_KEY environment variable
2. Verify image format (JPEG, PNG, PDF)
3. Check file size < 50MB
4. Look at /api/forensic/health endpoint
```

### If biometric dedup doesn't work:
```
1. Check User.biometricHash in database
2. Verify SHA256 hash is being calculated
3. Check if first registration saved biometric_data
```

### If fee relayer not working:
```
1. Check Solana wallet has balance
2. Verify FEE_RELAYER_WALLET env var
3. Look at fee relayer logs
4. Citizen should still see "Free" even if relay fails
```

### If roles aren't routing correctly:
```
1. Check user.role in database (CITIZEN, VERIFIER, MAKER)
2. Check localStorage for nddv_user_role
3. Verify middleware is running
4. Check dashboard-router.ts configuration
```

---

## 📈 PERFORMANCE TARGETS

- **Login**: <2 seconds
- **Forensic analysis**: <5 seconds
- **Document upload**: <3 seconds
- **Biometric dedup**: <1 second (cache enabled)
- **Verifier lookup**: <1 second
- **Blockchain mint**: <10 seconds (hidden from user)

---

## 🎯 SUCCESS CRITERIA

✅ **All three flows work without errors**
✅ **Citizen sees ZERO crypto language**
✅ **Citizen sees ZERO cost/fees**
✅ **Forensic scoring works correctly**
✅ **Biometric deduplication prevents fakes**
✅ **Verifier can instantly verify documents**
✅ **Maker can review and approve/reject**
✅ **All blockchain operations hidden**
✅ **UI feels like government app, not exchange**
