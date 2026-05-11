import type { ScanRecord } from './types'

export type { ScanRecord }

export interface AnalyzeRequest {
  type: 'link' | 'screenshot'
  content: string     // URL (link) atau nama file (screenshot)
  file?: File         // File object untuk screenshot
  filename?: string
}

export interface AnalyzeResponse {
  success: boolean
  data?: ScanRecord
  error?: string
}

export interface ScansResponse {
  success: boolean
  data?: ScanRecord[]
  error?: string
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/v1'

/** Konversi File ke base64 data URL */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Gagal membaca file'))
    reader.readAsDataURL(file)
  })
}

export async function analyzeContent(payload: AnalyzeRequest): Promise<AnalyzeResponse> {
  try {
    let body: Record<string, string>

    if (payload.type === 'screenshot') {
      if (!payload.file) {
        return { success: false, error: 'File gambar tidak ditemukan' }
      }
      const base64 = await fileToBase64(payload.file)
      body = {
        type: 'screenshot',
        content: base64,
        filename: payload.file.name,
      }
    } else {
      body = {
        type: 'link',
        content: payload.content,
      }
    }

    const res = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const json = await res.json() as AnalyzeResponse

    if (!res.ok) {
      return { success: false, error: json.error || 'Terjadi kesalahan server' }
    }

    return json
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal terhubung ke server'
    return { success: false, error: `Gagal terhubung ke server. Periksa koneksi internet Anda. (${message})` }
  }
}

export async function fetchScanHistory(limit = 20): Promise<ScansResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/scans?limit=${limit}`)
    const json = await res.json() as ScansResponse
    return json
  } catch {
    return { success: false, error: 'Gagal memuat riwayat scan' }
  }
}

export { API_BASE_URL }
