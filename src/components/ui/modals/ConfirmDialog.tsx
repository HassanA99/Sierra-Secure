"use client"
import React from 'react'

export default function ConfirmDialog({ open, title, message, onCancel, onConfirm, loading }: {
  open: boolean
  title?: string
  message?: string
  onCancel: () => void
  onConfirm: () => void
  loading?: boolean
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="bg-white rounded p-4 w-80 shadow" role="document">
        <h3 id="confirm-title" className="font-semibold">{title || 'Confirm'}</h3>
        <p className="text-sm text-gray-600 mt-2">{message || 'Are you sure?'}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1 rounded border focus:outline-none focus:ring-2" type="button">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="px-3 py-1 rounded bg-red-600 text-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-300" type="button">{loading ? 'Working...' : 'Confirm'}</button>
        </div>
      </div>
    </div>
  )
}
