"use client"
import React, { useState } from 'react'

interface ShareSettings {
  recipientPhone?: string
  recipientEmail?: string
  dataFields: {
    name: boolean
    dateOfBirth: boolean
    address: boolean
    documentNumber: boolean
    expiryDate: boolean
  }
  duration: 'unlimited' | '1hour' | '1day' | '1week' | '1month'
}

/**
 * Smart Sharing Modal
 * 
 * Citizens can share documents with granular control:
 * - Choose which data to share (toggles)
 * - Choose time limit (1 hour to unlimited)
 * - NO BLOCKCHAIN JARGON - just "Share for 1 hour"
 * - Cost always shown as Zero (hidden fee relay)
 */
export default function ShareModal({
  open,
  onClose,
  onShare,
  documentId,
  documentTitle = 'Document',
}: {
  open: boolean
  onClose: () => void
  onShare: (settings: ShareSettings) => Promise<void>
  documentId: string
  documentTitle?: string
}) {
  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    dataFields: {
      name: true,
      dateOfBirth: true,
      address: false,
      documentNumber: true,
      expiryDate: true,
    },
    duration: '1day',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleShare = async () => {
    setError(null)
    setLoading(true)
    try {
      await onShare(shareSettings)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share document')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900">
            Share "{documentTitle}"
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Control what information is shared and for how long
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Data Fields Section */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">
              What data to share?
            </h3>
            <div className="space-y-2">
              {[
                { key: 'name', label: 'Full Name', description: 'Your legal name' },
                { key: 'dateOfBirth', label: 'Date of Birth', description: 'Your DOB' },
                { key: 'address', label: 'Address', description: 'Residential address' },
                {
                  key: 'documentNumber',
                  label: 'Document Number',
                  description: 'ID/Passport number',
                },
                { key: 'expiryDate', label: 'Expiry Date', description: 'When it expires' },
              ].map((field) => (
                <label
                  key={field.key}
                  className="flex items-start p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={shareSettings.dataFields[field.key as keyof typeof shareSettings.dataFields]}
                    onChange={(e) =>
                      setShareSettings({
                        ...shareSettings,
                        dataFields: {
                          ...shareSettings.dataFields,
                          [field.key]: e.target.checked,
                        },
                      })
                    }
                    className="mt-1 w-4 h-4 rounded border-gray-300"
                  />
                  <div className="ml-3 flex-1">
                    <p className="font-medium text-gray-900">{field.label}</p>
                    <p className="text-xs text-gray-500">{field.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Duration Section */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">How long to share?</h3>
            <div className="space-y-2">
              {[
                { value: '1hour', label: '1 Hour', emoji: '⏱' },
                { value: '1day', label: '1 Day', emoji: '📅' },
                { value: '1week', label: '1 Week', emoji: '📆' },
                { value: '1month', label: '1 Month', emoji: '📆' },
                { value: 'unlimited', label: 'Unlimited', emoji: '♾' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    setShareSettings({
                      ...shareSettings,
                      duration: option.value as ShareSettings['duration'],
                    })
                  }
                  className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
                    shareSettings.duration === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option.emoji} {option.label}</span>
                    {shareSettings.duration === option.value && (
                      <span className="text-blue-600">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Cost Section */}
          <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-gray-900 font-medium">Sharing Cost:</span>
              <span className="text-green-600 font-bold text-lg">Free</span>
            </div>
            <p className="text-xs text-green-700 mt-1">
              No fees for sharing your documents - always free
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 p-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
          >
            {loading ? 'Sharing...' : 'Share Document'}
          </button>
        </div>
      </div>
    </div>
  )
}

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 rounded border focus:outline-none focus:ring-2" type="button">Cancel</button>
          <button
            onClick={async () => {
              if (!recipientId) return setError('Recipient is required')
              setError(null)
              setLoading(true)
              try {
                await onShare(recipientId, type, expiresIn ? parseInt(expiresIn) : undefined)
                onClose()
              } catch (err: any) {
                setError(err?.message || 'Share failed')
              } finally {
                setLoading(false)
              }
            }}
            disabled={loading}
            className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
            type="button"
          >
            {loading ? 'Sharing...' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  )
}
