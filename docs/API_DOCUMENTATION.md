# NDDV API Documentation

## Overview

The NDDV API is a RESTful API built with Next.js 15, providing endpoints for document management, blockchain operations, forensic analysis, and user authentication.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All protected endpoints require an Authorization header with a JWT token:

```
Authorization: Bearer <jwt-token>
```

Or use the custom header:

```
x-auth-token: <jwt-token>
```

For authenticated requests, the user ID is passed via:

```
x-user-id: <user-id>
```

## Endpoints

### Authentication

#### POST /auth/login
Login with Privy and create session.

**Request:**
```json
{
  "privyUserId": "string",
  "email": "string",
  "walletAddress": "string",
  "displayName": "string (optional)"
}
```

**Response:**
```json
{
  "user": {
    "id": "string",
    "email": "string",
    "walletAddress": "string",
    "displayName": "string",
    "kycStatus": "pending|verified|rejected"
  },
  "token": "jwt-token"
}
```

#### POST /auth/verify
Verify wallet signature and create session.

**Request:**
```json
{
  "message": "string",
  "signature": "string",
  "walletAddress": "string"
}
```

**Response:**
```json
{
  "user": { ... },
  "token": "jwt-token"
}
```

#### POST /auth/logout
Logout current user (invalidates session).

**Request:** (requires authentication)

**Response:**
```json
{
  "success": true,
  "message": "Logged out"
}
```

#### GET /auth/me
Get current authenticated user.

**Request:** (requires authentication)

**Response:**
```json
{
  "id": "string",
  "email": "string",
  "walletAddress": "string",
  "displayName": "string",
  "status": "active|inactive",
  "kycStatus": "pending|verified|rejected",
  "createdAt": "ISO 8601 datetime"
}
```

---

### Documents

#### GET /documents
List user's documents with pagination.

**Query Parameters:**
- `skip` (number): Offset for pagination (default: 0)
- `take` (number): Number of documents to return, max 100 (default: 10)

**Response:**
```json
{
  "documents": [
    {
      "id": "string",
      "fileName": "string",
      "fileSize": "number",
      "fileType": "string",
      "status": "uploaded|analyzing|ready|error",
      "createdAt": "ISO 8601 datetime"
    }
  ],
  "pagination": {
    "total": "number",
    "skip": "number",
    "take": "number"
  }
}
```

#### POST /documents
Upload new document with forensic analysis.

**Request:** (multipart/form-data)
- `file` (File): Document file (max 50MB)
- `expiresAt` (ISO 8601 datetime, optional): Document expiration date

**Response:**
```json
{
  "document": {
    "id": "string",
    "fileName": "string",
    "fileSize": "number",
    "status": "uploaded",
    "createdAt": "ISO 8601 datetime"
  },
  "forensic": {
    "id": "string",
    "status": "analyzing|completed",
    "complianceScore": "number"
  }
}
```

#### GET /documents/[documentId]
Get document details with forensic report.

**Response:**
```json
{
  "document": {
    "id": "string",
    "fileName": "string",
    "status": "ready|error",
    "createdAt": "ISO 8601 datetime"
  },
  "forensic": {
    "analysisId": "string",
    "complianceScore": "number (0-100)",
    "tamperingDetected": "boolean",
    "confidenceLevel": "number (0-100)",
    "ocrResults": { ... },
    "analysis": { ... },
    "recommendations": ["string"],
    "analyzedAt": "ISO 8601 datetime"
  }
}
```

#### PUT /documents/[documentId]
Update document metadata.

**Request:**
```json
{
  "status": "ready|archived",
  "expiresAt": "ISO 8601 datetime (optional)"
}
```

**Response:**
```json
{
  "id": "string",
  "fileName": "string",
  "status": "string",
  "expiresAt": "ISO 8601 datetime"
}
```

#### DELETE /documents/[documentId]
Delete document permanently.

**Response:**
```json
{
  "success": true,
  "message": "Document deleted"
}
```

---

### Blockchain

#### POST /blockchain/attestations
Create a SAS (Solana Attestation Service) attestation on blockchain.

**Request:**
```json
{
  "documentId": "string",
  "issuerAddress": "solana-address",
  "documentType": "birth_certificate|id_card|diploma|license|land_deed|vehicle_title"
}
```

**Response:**
```json
{
  "attestation": {
    "id": "string",
    "sasId": "string",
    "transactionHash": "string",
    "status": "confirmed"
  }
}
```

#### GET /blockchain/attestations
List user's attestations.

**Response:**
```json
{
  "attestations": [
    {
      "id": "string",
      "sasId": "string",
      "holderAddress": "string",
      "issuerAddress": "string",
      "documentType": "string",
      "status": "active|deactivated",
      "transactionHash": "string",
      "createdAt": "ISO 8601 datetime"
    }
  ]
}
```

#### POST /blockchain/nfts
Mint a new NFT from document.

**Request:**
```json
{
  "documentId": "string",
  "name": "string",
  "symbol": "string",
  "uri": "ipfs or http url to metadata",
  "isSoulbound": "boolean (default: false)"
}
```

**Response:**
```json
{
  "nft": {
    "id": "string",
    "mintAddress": "solana-address",
    "name": "string",
    "symbol": "string",
    "transactionHash": "string"
  }
}
```

#### GET /blockchain/nfts
List user's NFTs.

**Response:**
```json
{
  "nfts": [
    {
      "id": "string",
      "mintAddress": "string",
      "name": "string",
      "symbol": "string",
      "ownerAddress": "string",
      "isSoulbound": "boolean",
      "transactionHash": "string",
      "createdAt": "ISO 8601 datetime"
    }
  ]
}
```

#### POST /blockchain/transfer
Transfer NFT to another address.

**Request:**
```json
{
  "nftId": "string",
  "recipientAddress": "solana-address"
}
```

**Response:**
```json
{
  "transfer": {
    "nftId": "string",
    "transactionHash": "string",
    "newOwner": "solana-address"
  }
}
```

#### GET /blockchain/verify?mint=<mint-address>
Verify NFT ownership on chain.

**Response:**
```json
{
  "isOwned": "boolean"
}
```

---

### Permissions & Sharing

#### POST /permissions/share
Share document with another user.

**Request:**
```json
{
  "documentId": "string",
  "recipientId": "string",
  "type": "READ|SHARE|VERIFY",
  "expiresIn": "number (milliseconds, optional)"
}
```

**Response:**
```json
{
  "permission": {
    "id": "string",
    "documentId": "string",
    "recipientId": "string",
    "type": "READ|SHARE|VERIFY",
    "expiresAt": "ISO 8601 datetime",
    "createdAt": "ISO 8601 datetime"
  }
}
```

#### GET /permissions?documentId=<id>
List document permissions.

**Response:**
```json
{
  "permissions": [
    {
      "id": "string",
      "recipientId": "string",
      "type": "READ|SHARE|VERIFY",
      "expiresAt": "ISO 8601 datetime",
      "recipient": {
        "id": "string",
        "email": "string",
        "displayName": "string"
      },
      "createdAt": "ISO 8601 datetime"
    }
  ]
}
```

#### DELETE /permissions?permissionId=<id>
Revoke document permission.

**Response:**
```json
{
  "success": true,
  "message": "Permission revoked"
}
```

---

### Verification & Audit

#### GET /verify/document?documentId=<id>
Verify document authenticity and get forensic report.

**Response:**
```json
{
  "document": {
    "id": "string",
    "fileName": "string",
    "status": "ready",
    "createdAt": "ISO 8601 datetime"
  },
  "forensic": {
    "complianceScore": "number",
    "tamperingDetected": "boolean",
    "confidenceLevel": "number",
    "analysis": { ... }
  }
}
```

#### POST /verify/batch
Batch verify multiple documents.

**Request:**
```json
{
  "documentIds": ["string", "string"]
}
```

**Response:**
```json
{
  "summary": {
    "total": "number",
    "verified": "number",
    "pending": "number"
  },
  "results": [
    {
      "documentId": "string",
      "fileName": "string",
      "status": "string",
      "verified": "boolean"
    }
  ]
}
```

#### GET /verify/audit-logs
Get audit logs for current user.

**Query Parameters:**
- `resourceId` (string, optional): Filter by resource ID
- `action` (string, optional): Filter by action type
- `limit` (number, default: 50, max: 100)
- `offset` (number, default: 0)

**Response:**
```json
{
  "logs": [
    {
      "id": "string",
      "action": "UPLOAD_DOCUMENT|SHARE_DOCUMENT|REVOKE_PERMISSION|etc",
      "resourceType": "document|permission|attestation",
      "resourceId": "string",
      "details": { ... },
      "createdAt": "ISO 8601 datetime"
    }
  ],
  "pagination": {
    "total": "number",
    "limit": "number",
    "offset": "number",
    "hasMore": "boolean"
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "message": "Detailed error message (optional)",
  "details": { ... }
}
```

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (access denied)
- `404`: Not Found
- `409`: Conflict (duplicate permission, etc)
- `429`: Rate Limited
- `500`: Internal Server Error

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Default**: 100 requests per minute
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Retry**: Use `Retry-After` header when receiving 429 response

---

## Examples

### Complete Login Flow

```bash
# 1. Login with Privy
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "privyUserId": "did_user_123",
    "email": "user@example.com",
    "walletAddress": "7qLTa9z..."
  }'

# Response includes token
# {
#   "user": { ... },
#   "token": "eyJhbGc..."
# }

# 2. Upload document (with token)
curl -X POST http://localhost:3000/api/documents \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "x-user-id: user_123" \
  -F "file=@document.pdf"

# 3. Get forensic results
curl http://localhost:3000/api/documents/doc_123 \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "x-user-id: user_123"
```

### Document Sharing Flow

```bash
# Share document
curl -X POST http://localhost:3000/api/permissions/share \
  -H "Authorization: Bearer <token>" \
  -H "x-user-id: user_123" \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "doc_123",
    "recipientId": "user_456",
    "type": "READ",
    "expiresIn": 604800000
  }'

# Recipient can now access document
curl http://localhost:3000/api/documents/doc_123 \
  -H "Authorization: Bearer <recipient-token>" \
  -H "x-user-id: user_456"
```

---

## Implementation Notes

- All timestamps are in ISO 8601 format
- File uploads support: JPEG, PNG, PDF (max 50MB)
- Solana addresses must be valid base58 format
- Blockchain operations are asynchronous (check status polling)
- Forensic analysis runs automatically on document upload

---

## Security

- JWT tokens expire after 24 hours
- All endpoints validate input strictly
- Solana address validation prevents blockchain errors
- File size limits prevent abuse
- Rate limiting protects against DoS
- Audit logs track all operations
- Soft deletes preserve data for compliance

---

## Support

For issues or questions, see:
- `docs/FORENSIC_IMPLEMENTATION_GUIDE.md` - Detailed implementation guide
- `docs/ARCHITECTURE_DIAGRAMS.md` - System architecture
- `docs/NEXT_STEPS.md` - Integration steps
- `README.md` - Project overview
