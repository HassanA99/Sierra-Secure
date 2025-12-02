

## 💻 NDDV Developer Specification: Phase 2 & Beyond

### 🎯 1. Core Goal & User Experience (UX)

The primary goal is to build a **single, unified web application (Next.js)** that hides all complexity related to blockchain and wallets.

* **1.1 Single Application Principle:** All user roles (Citizen, Verifier, Maker) will access the same `app.nddv.gov.sl` URL when we buys the domain but not now. 
* **1.2 Wallet Abstraction:** The user **must not** see "Select Wallet (Phantom, Solflare)" screens. All wallet creation and management are handled invisibly by **Privy**.
* **1.3 Gasless Experience:** All transactions initiated by the **Citizen** must be gasless. The **SolanaService** must use the Government Fee Relayer account to cover all fees.

***

### 2. 🔑 Authentication & Role-Based Access

The system must handle three distinct user types using the same login flow.

* **2.1 Unified Login Flow:**
    1.  User enters **Phone Number**.
    2.  User receives **OTP (SMS)**.
    3.  User enters **Mandatory NDDV PIN** (2nd Factor).
    4.  The system uses the phone number to retrieve the associated **Privy Embedded Wallet Address**.
* **2.2 Role Assignment Logic:** Upon successful login, the application must query the database to determine the user's role and set a state variable (`userRole`).
    * **Roles:** `CITIZEN`, `VERIFIER`, `MAKER`.
    note: we have to add role field in user table.
* **2.3 Conditional Rendering (The Core Task):**
    * If `userRole == CITIZEN`: Render the **Digital Vault Dashboard** (View/Share documents).
    * If `userRole == VERIFIER`: Render the **Verification Portal** (Document lookup/scanning interface).
    * If `userRole == MAKER`: Render the **Issuance/Audit Dashboard** (Document minting forms, forensic review queue).

***

### 3. 🛡️ Security & Integrity Workflow

The document issuance flow must integrate the **AIDocumentForensicService** before any blockchain commitment.

* **3.1 Pre-Issuance Forensic Check (The AI Gate):**
    * When a **Maker** uploads a document, or a **Citizen** uploads their ID during KYC, the `DocumentService` **MUST** call `AIDocumentForensicService.runForensicAnalysis()`.
    * This is a synchronous call (Frontend must show a 2-3 second loading state).
* **3.2 Decision Logic:** The `DocumentService` acts based on the resulting **Compliance Score** (0-100):
    * Score **$\ge$ 85**: Proceed to blockchain issuance (call `SolanaService.attest()`).
    * Score **$70-84$**: Update document status to **PENDING\_REVIEW** and route to the **Maker Audit Queue**.
    * Score **$<70$**: **REJECT** the document and notify the uploader.
* **3.3 Deduplication Enforcement:** The system must use the **extracted biometric data** from the forensic report (stored in the database) as a secondary check to prevent users from creating multiple accounts with different SIM cards.

***

### 4. 🗄️ Document Management

The UI must reflect the different cryptographic properties of the documents.

* **4.1 Document Categorization:**
    * **IDENTITY/STATUS:** Must be represented as a **Solana Attestation Service (SAS)** record. *Cannot be transferred.*
    * **ASSETS/OWNERSHIP:** Must be represented as a **Metaplex NFT**. *Transferable* via a clear "Transfer Ownership" button.
* **4.2 Sharing Interface:** The frontend for the `POST /api/permissions/share` endpoint must use **clear, granular controls** (sliders, toggles) to allow the Citizen to define the **time limit** and **specific data fields** shared (e.g., only Name and Hash, not Address).

***

### 5. ⚠️ Error Handling & Performance Feedback

Since blockchain and AI calls can introduce latency, the frontend must be resilient.

* **5.1 Handling Latency:** For any long-running process (Forensic Check, Blockchain Minting, NFT Transfer), the frontend must use **loading states** and **progress feedback**. Avoid showing generic spinners; use specific, helpful text (e.g., "Running AI Check..." or "Awaiting Solana Transaction Confirmation...").
* **5.2 Security Communication:** Use high-trust visuals like the **"Verified Security Seal"** and **"Trust Score"** to communicate security status to the Citizen instead of raw technical details.
* **5.3 Auditable Errors:** When an error occurs, the API must return a clear, user-friendly message, but the backend must log the full technical error (transaction ID, stack trace) for the **Maker/Audit Logs**.

***

### 6. 🔗 Critical Integration Points

| File/Service | Must Call | Purpose |
| :--- | :--- | :--- |
| `AuthService` | `Privy` | Wallet creation/retrieval linked to Phone Number. |
| `DocumentService` | `AIDocumentForensicService` | **MANDATORY** pre-issuance fraud check. |
| `DocumentService` | `SolanaService` | Execution of all SAS Attestation and NFT Minting. |
| `SolanaService` | Fee Relayer Logic | Ensure all Citizen transactions are **Gasless**. |