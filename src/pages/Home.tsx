import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { CloudArrowUpIcon, DocumentIcon } from '@heroicons/react/24/outline'
import { useMutation } from '@tanstack/react-query'
import { supabase, STORAGE_BUCKET } from '../lib/supabase'

export default function Home() {
  const navigate = useNavigate()
  const [files, setFiles] = useState<File[]>([])
  const [message, setMessage] = useState('')
  const [expiryDays, setExpiryDays] = useState(7)
  const [password, setPassword] = useState('')
  const [uploading, setUploading] = useState(false)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setFiles(prev => [...prev, ...acceptedFiles])
    },
    multiple: true
  })

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (files.length === 0) throw new Error('No files selected')
      
      setUploading(true)
      
      // Create transfer record
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expiryDays)
      
      const { data: transfer, error: transferError } = await supabase
        .from('transfers')
        .insert({
          name: `Transfer ${new Date().toLocaleDateString()}`,
          message: message || null,
          expires_at: expiresAt.toISOString(),
          password: password || null,
        })
        .select()
        .single()

      if (transferError) throw transferError

      // Upload files
      const uploadPromises = files.map(async (file) => {
        const fileName = `${transfer.id}/${file.name}`
        
        const { error: uploadError } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(fileName, file)

        if (uploadError) throw uploadError

        // Create file record
        const { error: fileError } = await supabase
          .from('files')
          .insert({
            transfer_id: transfer.id,
            name: file.name,
            size: file.size,
            mime_type: file.type,
            storage_path: fileName,
          })

        if (fileError) throw fileError
      })

      await Promise.all(uploadPromises)
      
      return transfer.id
    },
    onSuccess: (transferId) => {
      navigate(`/transfer/${transferId}`)
    },
    onError: (error) => {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    },
    onSettled: () => {
      setUploading(false)
    }
  })

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Send files up to 2GB for free
        </h1>
        <p className="text-xl text-gray-600">
          No registration required. Files are automatically deleted after 7 days.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* File Drop Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400'
          }`}
        >
          <input {...getInputProps()} />
          <CloudArrowUpIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-lg text-primary-600">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-lg text-gray-600 mb-2">
                Drag and drop files here, or click to select files
              </p>
              <p className="text-sm text-gray-500">
                Maximum file size: 2GB per file
              </p>
            </div>
          )}
        </div>

        {/* Selected Files */}
        {files.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Selected Files ({files.length})
            </h3>
            <div className="space-y-3">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <DocumentIcon className="h-8 w-8 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Total size: {formatFileSize(totalSize)}
              </p>
            </div>
          </div>
        )}

        {/* Transfer Options */}
        <div className="mt-8 space-y-6">
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message (optional)
            </label>
            <textarea
              id="message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Add a message for the recipient..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-2">
                Expires after
              </label>
              <select
                id="expiry"
                value={expiryDays}
                onChange={(e) => setExpiryDays(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value={1}>1 day</option>
                <option value={3}>3 days</option>
                <option value={7}>7 days</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password (optional)
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Protect with password"
              />
            </div>
          </div>
        </div>

        {/* Upload Button */}
        <div className="mt-8">
          <button
            onClick={() => uploadMutation.mutate()}
            disabled={files.length === 0 || uploading}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-md transition-colors"
          >
            {uploading ? 'Uploading...' : 'Create Transfer'}
          </button>
        </div>
      </div>
    </div>
  )
}