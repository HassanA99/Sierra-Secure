import React from 'react'

export type TamperIndicatorItem = {
  type: string
  severity?: string
  confidence?: number
  description?: string
  recommendation?: string
}

type Props = {
  indicators: TamperIndicatorItem[]
}

const severityColor = (s?: string) => {
  if (!s) return 'text-gray-600'
  if (s === 'CRITICAL') return 'text-red-700'
  if (s === 'HIGH') return 'text-red-600'
  if (s === 'MEDIUM') return 'text-yellow-600'
  if (s === 'LOW') return 'text-green-600'
  return 'text-gray-600'
}

const TamperingIndicators: React.FC<Props> = ({ indicators }) => {
  if (!indicators || indicators.length === 0) {
    return <div className="text-sm text-gray-500">No tampering indicators detected.</div>
  }

  return (
    <div className="space-y-3">
      {indicators.map((it, idx) => (
        <div key={idx} className="p-3 border rounded-md bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div className="font-medium">{it.type}</div>
            <div className={`text-sm ${severityColor(it.severity)}`}>{it.severity || 'UNKNOWN'}</div>
          </div>
          {it.description && <div className="text-sm text-gray-600 mt-1">{it.description}</div>}
          <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
            <div>Confidence: {(it.confidence ?? 0).toFixed(2)}</div>
            {it.recommendation && <div className="italic">{it.recommendation}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}

export default TamperingIndicators
