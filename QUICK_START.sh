#!/usr/bin/env bash

# NDDV Forensic System - Quick Command Reference
# Copy & paste these commands to get started

# ============================================================
# IMMEDIATE ACTIONS (Do these first)
# ============================================================

# 1. Review the guides
echo "📖 Read these guides in order:"
echo "   1. FORENSIC_SYSTEM_SUMMARY.md (executive overview)"
echo "   2. ARCHITECTURE_DIAGRAMS.md (architecture & diagrams)"
echo "   3. FORENSIC_IMPLEMENTATION_GUIDE.md (detailed guide)"
echo "   4. NEXT_STEPS.md (step-by-step integration)"

# 2. Run the database migration
echo ""
echo "💾 Create database tables:"
echo "   npx prisma migrate dev --name add_forensic_analysis"

# 3. Verify the migration worked
echo ""
echo "✅ Verify database changes:"
echo "   npx prisma studio"
echo "   (Look for 'forensic_analyses' table and updated 'documents' table)"

# ============================================================
# BUILD & DEPLOYMENT VERIFICATION
# ============================================================

# 4. Verify TypeScript compilation
echo ""
echo "🔍 Check for TypeScript errors:"
echo "   npx tsc --noEmit"

# 5. Lint the code
echo ""
echo "📝 Run ESLint:"
echo "   npm run lint"

# 6. Validate Prisma schema
echo ""
echo "📋 Validate database schema:"
echo "   npx prisma validate"

# ============================================================
# DEVELOPMENT TESTING
# ============================================================

# 7. Start development server
echo ""
echo "🚀 Start development server:"
echo "   npm run dev"
echo "   (Available at http://localhost:3000)"

# 8. Test forensic health endpoint
echo ""
echo "🏥 Test health check (run in another terminal):"
echo "   curl 'http://localhost:3000/api/forensic/health?endpoint=health'"

# 9. Test with sample document
echo ""
echo "📄 Test forensic analysis (example):"
echo "   curl -X POST http://localhost:3000/api/documents/test-123/forensic \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{"
echo "       \"fileBuffer\": \"base64_image_here\","
echo "       \"documentType\": \"PASSPORT\","
echo "       \"mimeType\": \"image/jpeg\""
echo "     }'"

# ============================================================
# ENVIRONMENT SETUP
# ============================================================

# 10. Add Gemini API key
echo ""
echo "🔑 Add Gemini API key to .env.local:"
echo "   echo 'GEMINI_API_KEY=your_api_key_here' >> .env.local"
echo "   (Get from: https://aistudio.google.com/app/apikey)"

# ============================================================
# DATABASE OPERATIONS
# ============================================================

# 11. Generate Prisma Client
echo ""
echo "🔧 Generate Prisma types:"
echo "   npx prisma generate"

# 12. View database GUI
echo ""
echo "📊 Open Prisma Studio GUI:"
echo "   npx prisma studio"

# 13. Run database seed (if you create one)
echo ""
echo "🌱 Seed database (when ready):"
echo "   npx prisma db seed"

# ============================================================
# PRODUCTION BUILD
# ============================================================

# 14. Production build
echo ""
echo "📦 Build for production:"
echo "   npm run build"

# 15. Start production server
echo ""
echo "🚀 Start production server:"
echo "   npm start"

# ============================================================
# NEXT STEPS FOR DEVELOPER
# ============================================================

echo ""
echo "════════════════════════════════════════════════════════"
echo "🎯 NEXT STEPS FOR YOU (In Order)"
echo "════════════════════════════════════════════════════════"
echo ""
echo "STEP 1: Database Migration (5 minutes)"
echo "   → npx prisma migrate dev --name add_forensic_analysis"
echo ""
echo "STEP 2: Review Documentation (15 minutes)"
echo "   → Read NEXT_STEPS.md for integration guide"
echo ""
echo "STEP 3: Implement DocumentService (30 minutes)"
echo "   → See code example in NEXT_STEPS.md"
echo "   → Create src/services/implementations/document.service.ts"
echo ""
echo "STEP 4: Add Gemini Integration (1 hour)"
echo "   → npm install @google/generative-ai"
echo "   → Update AIDocumentForensicService methods"
echo ""
echo "STEP 5: Frontend UI (2 hours)"
echo "   → Create React components for forensic results"
echo "   → Component structure in documentation"
echo ""
echo "STEP 6: Testing (1 hour)"
echo "   → Write integration tests"
echo "   → Test with sample documents"
echo ""
echo "════════════════════════════════════════════════════════"
echo "✅ All files are ready!"
echo "📖 Start with: FORENSIC_SYSTEM_SUMMARY.md"
echo "🚀 Then run: npx prisma migrate dev --name add_forensic_analysis"
echo "════════════════════════════════════════════════════════"
