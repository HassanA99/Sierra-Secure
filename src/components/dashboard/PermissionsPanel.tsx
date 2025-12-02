"use client"
import React, { useEffect, useState } from 'react'

type PermissionItem = {
  id: string
  recipientId: string
  type: string
  expiresAt?: string | null
  createdAt: string
  recipient?: { id?: string; email?: string; displayName?: string }
}

export default function PermissionsPanel({ selectedDocumentId }: { selectedDocumentId?: string }) {
  const [perms, setPerms] = useState<PermissionItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (!selectedDocumentId) {
        setPerms([])
        setError(null)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('nddv_token') : null
        const userId = typeof window !== 'undefined' ? localStorage.getItem('nddv_user_id') : null
        const headers: Record<string, string> = {}
        if (token) headers['Authorization'] = `Bearer ${token}`
        if (userId) headers['x-user-id'] = userId

        const url = `/api/permissions?documentId=${encodeURIComponent(selectedDocumentId)}`
        const res = await fetch(url, { headers: Object.keys(headers).length ? headers : undefined })
        if (!res.ok) throw new Error('Failed to load permissions')
        const body = await res.json()
        if (!mounted) return
        setPerms(body.permissions || [])
      } catch (err: any) {
        setError(err?.message || 'Error loading permissions')
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => { mounted = false }
  }, [selectedDocumentId])

  return (
    <section className="bg-white p-4 rounded shadow" aria-labelledby="perm-title">
      <h3 id="perm-title" className="text-md font-medium">Permissions</h3>
      <div className="mt-3 text-sm text-gray-600">
        {!selectedDocumentId && <div>Select a document to view permissions.</div>}
        {loading && <div>Loading permissions...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && perms.length === 0 && selectedDocumentId && (
          <div>No active shares for this document.</div>
        )}
        {!loading && perms.length > 0 && (
          <ul className="list-disc list-inside ml-4">
            {perms.map((p) => (
              <li key={p.id}>
                <div className="font-medium">{p.recipient?.displayName || p.recipientId} — {p.type}</div>
                <div className="text-xs text-gray-500">Expires: {p.expiresAt ?? 'never'}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

