import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CheckCircleIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline'
import { supabase } from '../lib/supabase'
import { useState } from 'react'

export default function Transfer() {
  const { id } = useParams<{ id: string }>()
  const [copied, setCopied] = useState(false)

  const { data: transfer, isLoading, error } = useQuery({
    queryKey: ['transfer', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transfers')
        .select(`
          *,
          files (*)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id
  })

  const downloadUrl = `${window.location.origin}/download/${id}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(downloadUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transfer...</p>
        </div>
      </div>
    )
  }

  if (error || !transfer) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Transfer not found</h1>
          <p className="text-gray-600 mb-8">
            The transfer you're looking for doesn't exist or has expired.
          </p>
          <Link
            to="/"
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-md font-medium"
          >
            Create New Transfer
          </Link>
        </div>
      </div>
    )
  }

  const totalSize = transfer.files?.reduce((sum: number, file: any) => sum + file.size, 0) || 0
  const expiresAt = new Date(transfer.expires_at)
  const isExpired = expiresAt < new Date()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Transfer Created Successfully!
        </h1>
        <p className="text-gray-600">
          Your files are ready to be shared. Send the link below to your recipients.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Transfer Info */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Transfer Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Files:</span>
              <span className="ml-2 text-gray-600">{transfer.files?.length || 0}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Total size:</span>
              <span className="ml-2 text-gray-600">{formatFileSize(totalSize)}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Expires:</span>
              <span className={`ml-2 ${isExpired ? 'text-red-600' : 'text-gray-600'}`}>
                {expiresAt.toLocaleDateString()} at {expiresAt.toLocaleTimeString()}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Downloads:</span>
              <span className="ml-2 text-gray-600">{transfer.download_count}</span>
            </div>
          </div>
          
          {transfer.message && (
            <div className="mt-4">
              <span className="font-medium text-gray-700">Message:</span>
              <p className="mt-1 text-gray-600 bg-gray-50 p-3 rounded-md">
                {transfer.message}
              </p>
            </div>
          )}
        </div>

        {/* Download Link */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Share this link</h3>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={downloadUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
            />
            <button
              onClick={copyToClipboard}
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              <ClipboardDocumentIcon className="h-5 w-5" />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* File List */}
        {transfer.files && transfer.files.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Files in this transfer</h3>
            <div className="space-y-2">
              {transfer.files.map((file: any) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex justify-center">
          <Link
            to="/"
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md font-medium"
          >
            Create Another Transfer
          </Link>
        </div>
      </div>
    </div>
  )
}