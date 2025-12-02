import React from 'react'
import ComplianceScoreDisplay from './ComplianceScoreDisplay'
import TamperingIndicators from './TamperingIndicators'
import OCRResults from './OCRResults'

import type { ForensicReport } from '@/types/forensic.types'

type Props = {
  report?: ForensicReport | null
}

const ForensicResultsPanel: React.FC<Props> = ({ report }) => {
  if (!report) {
    return <div className="p-4 border rounded-md bg-white text-sm text-gray-600">No forensic report available.</div>
  }

  const score = report.complianceScore?.overall ?? 0
  const indicators = report.tampering?.indicators ?? []
  const ocrBlocks = report.ocrAnalysis && report.ocrAnalysis.extractedText ? [{ text: report.ocrAnalysis.extractedText, confidence: report.ocrAnalysis.averageConfidence, language: report.ocrAnalysis.detectedLanguage }] : []

  return (
    <div className="space-y-6 p-4 bg-gray-50 rounded-md">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">Forensic Analysis</h3>
          <p className="text-sm text-gray-500">Analysis ID: {report.analysisId}</p>
        </div>
        <ComplianceScoreDisplay score={score} />
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Tampering Indicators</h4>
        <TamperingIndicators indicators={indicators} />
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">OCR Results</h4>
        <OCRResults blocks={ocrBlocks} />
      </div>

      <div className="pt-2 border-t">
        <div className="text-sm text-gray-700">Recommended Action: <span className="font-medium">{report.recommendedAction || report.blockchainRecommendation || 'REVIEW'}</span></div>
      </div>
    </div>
  )
}

export default ForensicResultsPanel
