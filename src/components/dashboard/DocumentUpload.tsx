"use client"
import React, { useState, useRef, useCallback } from 'react'

const documentTypes = [
  { value: 'BIRTH_CERTIFICATE', label: 'Birth Certificate', icon: '👶', blockchain: 'SAS' },
  { value: 'NATIONAL_ID', label: 'National ID', icon: '🪪', blockchain: 'SAS' },
  { value: 'PASSPORT', label: 'Passport', icon: '🛂', blockchain: 'SAS' },
  { value: 'LAND_TITLE', label: 'Land Title', icon: '🏠', blockchain: 'NFT' },
  { value: 'PROPERTY_DEED', label: 'Property Deed', icon: '📜', blockchain: 'NFT' },
  { value: 'ACADEMIC_CERTIFICATE', label: 'Academic Certificate', icon: '🎓', blockchain: 'SAS' },
  { value: 'PROFESSIONAL_LICENSE', label: 'Professional License', icon: '📋', blockchain: 'SAS' },
  { value: 'VEHICLE_REGISTRATION', label: 'Vehicle Registration', icon: '🚗', blockchain: 'NFT' },
]

export default function DocumentUpload({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedDocType = documentTypes.find(d => d.value === documentType)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }, [])

  const handleFileSelect = (selectedFile: File) => {
    const maxSize = Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || 52428800)
    if (selectedFile.size > maxSize) {
      setMessage({ type: 'error', text: `File exceeds maximum size of ${Math.round(maxSize / 1024 / 1024)}MB` })
      return
    }

    const validTypes = ['image/jpeg', 'image/png', 'application/pdf']
    if (!validTypes.includes(selectedFile.type)) {
      setMessage({ type: 'error', text: 'Only JPEG, PNG, and PDF files are accepted' })
      return
    }

    setFile(selectedFile)
    setMessage(null)

    // Auto-generate title from filename
    if (!title) {
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '')
      setTitle(nameWithoutExt.replace(/[_-]/g, ' '))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return setMessage({ type: 'error', text: 'Please select a file' })
    if (!documentType) return setMessage({ type: 'error', text: 'Please select a document type' })
    if (!title) return setMessage({ type: 'error', text: 'Please enter a title' })

    const form = new FormData()
    form.append('file', file)
    form.append('documentType', documentType)
    form.append('title', title)
    form.append('blockchainType', selectedDocType?.blockchain === 'NFT' ? 'NFT' : 'SAS_ATTESTATION')

    setLoading(true)
    setProgress(0)
    setMessage({ type: 'info', text: '🤖 AI scanning document for fraud...' })

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

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

      clearInterval(progressInterval)
      setProgress(100)

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setMessage({ type: 'error', text: body?.error || 'Upload failed' })
      } else {
        setMessage({ type: 'success', text: `✅ Document uploaded! ${selectedDocType?.blockchain === 'NFT' ? 'NFT minting' : 'SAS attestation'} in progress...` })
        setFile(null)
        setTitle('')
        setDocumentType('')
        onUploadSuccess?.()
      }
    } catch (err) {
      clearInterval(progressInterval)
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="glass-card p-6" aria-labelledby="upload-heading">
      <div className="flex items-center justify-between mb-6">
        <h2 id="upload-heading" className="text-xl font-bold flex items-center gap-3">
          <span className="text-2xl">📤</span>
          Upload Document
        </h2>
        {selectedDocType && (
          <span className={`badge ${selectedDocType.blockchain === 'NFT' ? 'badge-blockchain' : 'badge-ai'}`}>
            {selectedDocType.blockchain === 'NFT' ? '⛓️ NFT' : '📝 SAS'}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Type Selector */}
        <div>
          <label className="block text-sm font-medium text-foreground-secondary mb-2">
            Document Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {documentTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setDocumentType(type.value)}
                className={`p-3 rounded-xl text-center transition-all ${documentType === type.value
                    ? type.blockchain === 'NFT'
                      ? 'bg-solana-teal/20 border-2 border-solana-teal'
                      : 'bg-violet-accent/20 border-2 border-violet-accent'
                    : 'bg-background-secondary border border-white/10 hover:border-white/30'
                  }`}
              >
                <span className="text-2xl block mb-1">{type.icon}</span>
                <span className="text-xs">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* File Drop Zone */}
        <div
          className={`upload-zone ${isDragging ? 'dragover' : ''} ${file ? 'border-solana-teal bg-solana-teal/5' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            id="file-input"
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            className="hidden"
          />

          {file ? (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-solana-teal/20 border border-solana-teal/50 flex items-center justify-center text-3xl">
                {file.type.includes('pdf') ? '📄' : '🖼️'}
              </div>
              <div className="text-left">
                <p className="font-medium truncate max-w-xs">{file.name}</p>
                <p className="text-sm text-foreground-secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null) }}
                className="ml-auto p-2 rounded-lg hover:bg-white/10 text-foreground-secondary"
              >
                ✕
              </button>
            </div>
          ) : (
            <>
              <div className="text-5xl mb-4 opacity-50">
                {isDragging ? '📥' : '📁'}
              </div>
              <p className="text-foreground-secondary mb-2">
                <span className="text-solana-teal font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-foreground-secondary opacity-70">
                JPEG, PNG, or PDF up to 50MB
              </p>
            </>
          )}
        </div>

        {/* Title Input */}
        <div>
          <label htmlFor="title-input" className="block text-sm font-medium text-foreground-secondary mb-2">
            Document Title
          </label>
          <input
            id="title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., My Property Deed 2024"
            className="input"
          />
        </div>

        {/* Progress Bar */}
        {loading && (
          <div className="space-y-2 fade-in">
            <div className="flex justify-between text-sm">
              <span className="text-foreground-secondary">{message?.text}</span>
              <span className="text-solana-teal font-mono">{progress}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Message */}
        {!loading && message && (
          <div className={`p-4 rounded-xl fade-in ${message.type === 'success' ? 'bg-success/10 border border-success/30 text-success' :
              message.type === 'error' ? 'bg-error/10 border border-error/30 text-error' :
                'bg-violet-accent/10 border border-violet-accent/30 text-violet-accent'
            }`}>
            {message.text}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !file || !documentType || !title}
          className="btn btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Uploading...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>🚀</span>
              Upload & Secure on Blockchain
            </span>
          )}
        </button>
      </form>
    </section>
  )
}
