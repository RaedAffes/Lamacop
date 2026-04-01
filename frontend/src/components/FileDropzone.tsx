"use client"

import { useCallback, useMemo, useRef, useState } from "react"

type StoredFile = {
  name: string
  type: string
  dataUrl: string
  size: number
}

export default function FileDropzone({
  label,
  helpText,
  accept,
  maxSizeBytes = 1024 * 1024,
  value,
  onChange,
}: {
  label: string
  helpText?: string
  accept?: string
  maxSizeBytes?: number
  value: StoredFile | null
  onChange: (file: StoredFile | null) => void
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () => reject(new Error("Failed to read file"))
        reader.readAsDataURL(file)
      })

      onChange({
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        dataUrl,
      })
    },
    [maxSizeBytes, onChange]
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
              {value ? value.name : "Drop a file here"}
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
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
            >
              Upload
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {value && isImage && (
          <img
            src={value.dataUrl}
            alt={value.name}
            className="mt-4 h-32 w-32 rounded-lg border border-slate-200 object-cover"
          />
        )}

        {value && !isImage && (
          <a
            className="mt-4 inline-block text-sm font-semibold text-slate-600 underline underline-offset-4 hover:text-slate-900"
            href={value.dataUrl}
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
