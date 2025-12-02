import React from 'react'

type Props = {
  score: number
}

const ComplianceScoreDisplay: React.FC<Props> = ({ score }) => {
  const color = score >= 85 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="flex items-center space-x-4">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-xl font-semibold ${color}`}>
        {score}
      </div>
      <div>
        <div className="text-sm text-gray-500">Compliance Score</div>
        <div className="font-medium text-lg">{score}/100</div>
      </div>
    </div>
  )
}

export default ComplianceScoreDisplay
