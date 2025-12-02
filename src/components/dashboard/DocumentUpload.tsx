"use client"
import React, { useState } from 'react'

export default function DocumentUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return setMessage('Select a file first')

    if (file.size > Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || 52428800)) {
      return setMessage('File exceeds maximum size')
    }

    const form = new FormData()
    form.append('file', file)

    setLoading(true)
    setMessage(null)

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('nddv_token') : null
      const userId = typeof window !== 'undefined' ? localStorage.getItem('nddv_user_id') : null
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`
      if (userId) headers['x-user-id'] = userId

      const res = await fetch('/api/documents', {
        method: 'POST',
        body: form,
        headers: Object.keys(headers).length ? headers : undefined,
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setMessage(body?.error || 'Upload failed')
      } else {
        setMessage('Upload succeeded')
        setFile(null)
      }
    } catch (err) {
      setMessage('Upload error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-white p-4 rounded shadow" aria-labelledby="upload-heading">
      <h2 id="upload-heading" className="text-lg font-medium">Upload Document</h2>
      <form onSubmit={handleSubmit} className="mt-3" aria-describedby="upload-help">
        <label htmlFor="file-input" className="sr-only">Choose document to upload</label>
        <input
          id="file-input"
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm"
          aria-required="true"
        />

        <div className="mt-3 flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
          {message && <div id="upload-help" role="status" className="text-sm text-gray-700">{message}</div>}
        </div>
      </form>
    </section>
  )
}
