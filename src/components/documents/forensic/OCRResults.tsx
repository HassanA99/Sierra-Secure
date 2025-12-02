import React from 'react'

export type OCRBlock = {
  text: string
  confidence?: number
  language?: string
  isBold?: boolean
  boundingBox?: number[]
  region?: string
}

type Props = {
  blocks: OCRBlock[]
}

const OCRResults: React.FC<Props> = ({ blocks }) => {
  if (!blocks || blocks.length === 0) return <div className="text-sm text-gray-500">No OCR results available.</div>

  return (
    <div className="space-y-2">
      {blocks.map((b, i) => (
        <div key={i} className="p-2 border rounded">
          <div className="text-sm font-medium">{b.region || 'Text Block'}</div>
          <div className="text-base text-gray-800 whitespace-pre-wrap mt-1">{b.text}</div>
          <div className="text-xs text-gray-500 mt-2">Confidence: {(b.confidence ?? 0).toFixed(2)} • Language: {b.language || 'unknown'}</div>
        </div>
      ))}
    </div>
  )
}

export default OCRResults
