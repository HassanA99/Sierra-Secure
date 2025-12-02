# Phase 2 — Dashboard QA Checklist

This checklist covers manual verification for the Dashboard (Phase 2) features implemented in the frontend.

Setup
- [ ] Start the dev server: `npm run dev`
- [ ] Ensure `.env.local` is configured and the backend services are reachable
- [ ] In the browser console set a valid JWT for testing: `localStorage.setItem('nddv_token', '<JWT>')`

Core Flows
- [ ] Upload document
  - Upload a supported file (PDF, PNG, JPG) <= configured max size
  - Confirm response is successful and the document appears in the list
  - Confirm forensic analysis runs (Forensic panel displays analysis)

- [ ] List & select document
  - Documents load on page load
  - Selecting a document shows forensic summary
  - Keyboard navigation: tab to a document and press Enter/Space to select

- [ ] Share document
  - Open Share modal, enter a valid recipient user id, choose permission, click Share
  - Confirm API call returns success and permission appears in the backend (or GET /api/permissions)
  - Verify error handling when recipient is missing or API fails

- [ ] Mint NFT (placeholder flow)
  - Open Mint modal, provide Name, Symbol, and a Metadata URI
  - Confirm API call to `/api/blockchain/nfts` succeeds (or returns expected placeholder response)
  - Verify created NFT record in backend using `GET /api/blockchain/nfts`

- [ ] Delete document
  - Click Delete, confirm in the dialog
  - Confirm document is removed from the list and backend returns success
  - Verify error handling for delete failures

Accessibility & Usability
- [ ] All interactive controls are keyboard focusable
- [ ] Modal dialogs have proper aria-modal/role attributes
- [ ] Informational messages are announced (aria-live)
- [ ] Buttons have visible focus rings

Developer Notes
- Token storage: `localStorage` key `nddv_token`
- Dashboard components: `src/components/dashboard/`
- API endpoints used: `/api/documents`, `/api/verify/document`,  `/api/permissions/share`, `/api/blockchain/nfts`

If anything fails, record the failing step, reproduce steps, and the API response (status + body) to help debugging.
