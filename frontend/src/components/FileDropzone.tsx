"use client"

import { useCallback, useMemo, useRef, useState } from "react"

type StoredFile = {
  name: string
  type: string
  size: number
  url?: string
  dataUrl?: string
}

declare const process: {
  env: {
    NEXT_PUBLIC_API_URL?: string
  }
}

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL || "/api/v1").replace(/\/$/, "")
}

export default function FileDropzone({
  label,
  helpText,
  accept,
  maxSizeBytes = 1024 * 1024,
  value,
  onChange,
  uploadFolder = "uploads",
}: {
  label: string
  helpText?: string
  accept?: string
  maxSizeBytes?: number
  value: StoredFile | null
  onChange: (file: StoredFile | null) => void
  uploadFolder?: string
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const isImage = useMemo(() => {
    return !!value?.type?.startsWith("image/")
  }, [value?.type])

  const readFile = useCallback(
    async (file: File) => {
      setError(null)
      if (file.size > maxSizeBytes) {
        setError(
          `File is too large. Max ${(maxSizeBytes / 1024 / 1024).toFixed(1)} MB.`
        )
        return
      }

      setUploading(true)
      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("folder", uploadFolder)

        const response = await fetch(`${getApiBaseUrl()}/uploads`, {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Upload failed")
        }

        const payload = (await response.json()) as { url: string; blob_name: string }
        onChange({
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
          url: `${getApiBaseUrl()}/uploads/${encodeURIComponent(payload.blob_name)}`,
        })
      } catch {
        setError("Upload failed. Check Azure Blob Storage configuration and backend availability.")
      } finally {
        setUploading(false)
      }
    },
    [maxSizeBytes, onChange, uploadFolder]
  )

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return
      void readFile(files[0])
    },
    [readFile]
  )

  return (
    <div>
      <div className="text-xs font-semibold text-slate-700">{label}</div>
      {helpText && <div className="mt-1 text-xs text-slate-500">{helpText}</div>}

      <div
        onDragEnter={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDragOver(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDragOver(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDragOver(false)
        }}
        onDrop={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDragOver(false)
          handleFiles(e.dataTransfer.files)
        }}
        className={
          dragOver
            ? "mt-2 rounded-lg border border-slate-900 bg-slate-50 p-4"
            : "mt-2 rounded-lg border border-slate-200 bg-white p-4"
        }
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">
              {value ? value.name : uploading ? "Uploading..." : "Drop a file here"}
            </div>
            <div className="mt-1 text-xs text-slate-500">
              {value
                ? `${Math.max(1, Math.round(value.size / 1024))} KB`
                : "or click to upload"}
            </div>
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Upload
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                disabled={uploading}
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {value && isImage && (value.url || value.dataUrl) && (
          <img
            src={value.url ?? value.dataUrl}
            alt={value.name}
            className="mt-4 h-32 w-32 rounded-lg border border-slate-200 object-cover"
          />
        )}

        {value && !isImage && (value.url || value.dataUrl) && (
          <a
            className="mt-4 inline-block text-sm font-semibold text-slate-600 underline underline-offset-4 hover:text-slate-900"
            href={value.url ?? value.dataUrl}
            download={value.name}
          >
            Download
          </a>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}

export type { StoredFile }
