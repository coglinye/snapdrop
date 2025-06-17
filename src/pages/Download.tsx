import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { CloudArrowDownIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { supabase, STORAGE_BUCKET } from '../lib/supabase'

export default function Download() {
  const { id } = useParams<{ id: string }>()
  const [password, setPassword] = useState('')
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  const { data: transfer, isLoading, error, refetch } = useQuery({
    queryKey: ['download', id],
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

  const downloadMutation = useMutation({
    mutationFn: async (fileId: string) => {
      if (!transfer) throw new Error('Transfer not found')

      // Check password if required
      if (transfer.password && transfer.password !== password) {
        throw new Error('Invalid password')
      }

      const file = transfer.files.find((f: any) => f.id === fileId)
      if (!file) throw new Error('File not found')

      // Get download URL
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(file.storage_path, 3600) // 1 hour expiry

      if (error) throw error

      // Increment download count
      await supabase
        .from('transfers')
        .update({ download_count: transfer.download_count + 1 })
        .eq('id', id)

      // Download file
      const link = document.createElement('a')
      link.href = data.signedUrl
      link.download = file.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      refetch()
    },
    onError: (error: any) => {
      if (error.message === 'Invalid password') {
        alert('Invalid password. Please try again.')
      } else {
        alert('Download failed. Please try again.')
      }
    }
  })

  const downloadAllMutation = useMutation({
    mutationFn: async () => {
      if (!transfer) throw new Error('Transfer not found')

      // Check password if required
      if (transfer.password && transfer.password !== password) {
        throw new Error('Invalid password')
      }

      // Download all files
      for (const file of transfer.files) {
        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .createSignedUrl(file.storage_path, 3600)

        if (error) continue

        const link = document.createElement('a')
        link.href = data.signedUrl
        link.download = file.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Increment download count
      await supabase
        .from('transfers')
        .update({ download_count: transfer.download_count + 1 })
        .eq('id', id)

      refetch()
    },
    onError: (error: any) => {
      if (error.message === 'Invalid password') {
        alert('Invalid password. Please try again.')
      } else {
        alert('Download failed. Please try again.')
      }
    }
  })

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
          <p className="text-gray-600">
            The transfer you're looking for doesn't exist or has expired.
          </p>
        </div>
      </div>
    )
  }

  const expiresAt = new Date(transfer.expires_at)
  const isExpired = expiresAt < new Date()
  const totalSize = transfer.files?.reduce((sum: number, file: any) => sum + file.size, 0) || 0
  const requiresPassword = transfer.password && !showPasswordForm

  if (isExpired) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Transfer Expired</h1>
          <p className="text-gray-600">
            This transfer expired on {expiresAt.toLocaleDateString()}.
          </p>
        </div>
      </div>
    )
  }

  if (requiresPassword) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <LockClosedIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Required</h1>
            <p className="text-gray-600">
              This transfer is protected with a password.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter password"
              />
            </div>

            <button
              onClick={() => setShowPasswordForm(true)}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Access Transfer
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <CloudArrowDownIcon className="mx-auto h-16 w-16 text-primary-600 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Download Files</h1>
        <p className="text-gray-600">
          {transfer.files?.length || 0} files • {formatFileSize(totalSize)} total
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Transfer Info */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Expires:</span>
              <span className="ml-2 text-gray-600">
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

        {/* Download All Button */}
        {transfer.files && transfer.files.length > 1 && (
          <div className="mb-6">
            <button
              onClick={() => downloadAllMutation.mutate()}
              disabled={downloadAllMutation.isPending}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors"
            >
              {downloadAllMutation.isPending ? 'Downloading...' : 'Download All Files'}
            </button>
          </div>
        )}

        {/* File List */}
        {transfer.files && transfer.files.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Files</h3>
            <div className="space-y-3">
              {transfer.files.map((file: any) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    onClick={() => downloadMutation.mutate(file.id)}
                    disabled={downloadMutation.isPending}
                    className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    {downloadMutation.isPending ? 'Downloading...' : 'Download'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}