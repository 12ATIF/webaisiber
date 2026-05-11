import { GoogleGenerativeAI } from '@google/generative-ai'
import type { SecurityCheckResult } from './securityChecker'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

export type RiskLevel = 'safe' | 'suspicious' | 'danger'

export interface TechnicalDetails {
  ssl: {
    valid: boolean
    issuer: string
    expiresAt: string | null
    daysUntilExpiry: number | null
    selfSigned: boolean
    mismatch: boolean
  } | null
  domain: {
    ip: string | null
    country: string | null
    city: string | null
    isp: string | null
    isProxy: boolean
    isHosting: boolean
  } | null
  headers: {
    hasContentSecurityPolicy: boolean
    hasXFrameOptions: boolean
    hasXContentTypeOptions: boolean
    hasStrictTransportSecurity: boolean
    score: number
  } | null
  redirects: {
    chain: string[]
    finalUrl: string
    hasMultipleRedirects: boolean
    crossDomainRedirect: boolean
  } | null
  safeBrowsing: {
    isMalicious: boolean
    threats: string[]
  } | null
  checkDurationMs: number
}

export interface GeminiAnalysisResult {
  riskScore: number
  riskLevel: RiskLevel
  indicators: string[]
  recommendation: string[]
  summary: string
  technicalDetails?: TechnicalDetails
}

const SYSTEM_PROMPT = `Kamu adalah sistem deteksi penipuan siber (cyber fraud detection) untuk masyarakat Indonesia.
Tugasmu menganalisis konten yang diberikan dan menentukan apakah ini penipuan.

PENTING: Respons HANYA dalam format JSON valid, tanpa markdown, tanpa code block, tanpa teks tambahan.

Format respons JSON:
{
  "riskScore": <angka 0-100>,
  "riskLevel": "<safe|suspicious|danger>",
  "indicators": ["indikator 1", "indikator 2"],
  "recommendation": ["rekomendasi 1", "rekomendasi 2"],
  "summary": "<ringkasan dalam bahasa Indonesia>"
}

Panduan skor risiko:
- 0-34  → safe     (konten aman)
- 35-69 → suspicious (perlu verifikasi)
- 70-100 → danger   (penipuan jelas)

Indikator yang harus dicek:
- Permintaan data sensitif (OTP, PIN, password, rekening)
- Domain tidak resmi atau meniru situs terpercaya
- Urgensi palsu ("segera", "dalam 1 jam", "atau dihapus")
- Penawaran tidak masuk akal (hadiah besar, diskon 90%+)
- Link dipersingkat (bit.ly, tinyurl) untuk menyembunyikan tujuan
- Bahasa manipulatif atau ancaman
- Pengirim tidak dapat diverifikasi
- Transfer ke rekening pribadi`

function scoreToLevel(score: number): RiskLevel {
  if (score >= 70) return 'danger'
  if (score >= 35) return 'suspicious'
  return 'safe'
}

function parseGeminiResponse(text: string): Omit<GeminiAnalysisResult, 'technicalDetails'> {
  const cleaned = text
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/g, '')
    .trim()

  const parsed = JSON.parse(cleaned)
  const score = Math.max(0, Math.min(100, Number(parsed.riskScore) || 0))

  return {
    riskScore: score,
    riskLevel: (['safe', 'suspicious', 'danger'] as RiskLevel[]).includes(parsed.riskLevel)
      ? parsed.riskLevel
      : scoreToLevel(score),
    indicators: Array.isArray(parsed.indicators) ? parsed.indicators : [],
    recommendation: Array.isArray(parsed.recommendation) ? parsed.recommendation : [],
    summary: String(parsed.summary || ''),
  }
}

function buildTechnicalContext(security: SecurityCheckResult): string {
  const lines: string[] = ['\n\n=== DATA TEKNIS HASIL PENGECEKAN NYATA ===']

  // SSL
  if (security.ssl) {
    const s = security.ssl
    lines.push(`\nSSL/TLS:`)
    lines.push(`  - Valid: ${s.valid ? 'Ya' : 'TIDAK'}`)
    lines.push(`  - Issuer: ${s.issuer}`)
    lines.push(`  - Kedaluwarsa dalam: ${s.daysUntilExpiry !== null ? s.daysUntilExpiry + ' hari' : 'Tidak diketahui'}`)
    if (s.selfSigned) lines.push(`  - ⚠️ SERTIFIKAT SELF-SIGNED (sangat mencurigakan)`)
    if (s.mismatch) lines.push(`  - ⚠️ DOMAIN MISMATCH di sertifikat`)
  } else {
    lines.push(`\nSSL/TLS: Tidak menggunakan HTTPS (HTTP biasa — tidak aman)`)
  }

  // Domain/IP
  if (security.domain) {
    const d = security.domain
    lines.push(`\nIP & Hosting:`)
    lines.push(`  - IP: ${d.ip || 'Tidak diketahui'}`)
    lines.push(`  - Lokasi server: ${d.city || '?'}, ${d.country || 'Tidak diketahui'}`)
    lines.push(`  - ISP/Hosting: ${d.isp || 'Tidak diketahui'}`)
    if (d.isProxy) lines.push(`  - ⚠️ SERVER INI MENGGUNAKAN PROXY/VPN`)
    if (d.isHosting) lines.push(`  - Info: Server ini adalah hosting (bukan IP rumahan)`)
  }

  // Security Headers
  if (security.headers) {
    const h = security.headers
    lines.push(`\nSecurity Headers (${h.score}/4 terpasang):`)
    lines.push(`  - Content-Security-Policy: ${h.hasContentSecurityPolicy ? '✓' : '✗ Tidak ada'}`)
    lines.push(`  - X-Frame-Options: ${h.hasXFrameOptions ? '✓' : '✗ Tidak ada'}`)
    lines.push(`  - X-Content-Type-Options: ${h.hasXContentTypeOptions ? '✓' : '✗ Tidak ada'}`)
    lines.push(`  - Strict-Transport-Security (HSTS): ${h.hasStrictTransportSecurity ? '✓' : '✗ Tidak ada'}`)
    if (h.score === 0) lines.push(`  - ⚠️ Tidak ada satu pun security header — sangat mencurigakan`)
  }

  // Redirects
  if (security.redirects) {
    const r = security.redirects
    lines.push(`\nRedirect Chain (${r.chain.length} hop):`)
    r.chain.forEach((url, i) => lines.push(`  ${i + 1}. ${url}`))
    if (r.crossDomainRedirect) lines.push(`  - ⚠️ REDIRECT LINTAS DOMAIN TERDETEKSI`)
    if (r.hasMultipleRedirects) lines.push(`  - ⚠️ Banyak redirect (teknik penyembunyian tujuan)`)
  }

  // Safe Browsing
  if (security.safeBrowsing) {
    const sb = security.safeBrowsing
    if (sb.isMalicious) {
      lines.push(`\n🚨 GOOGLE SAFE BROWSING: URL INI TERDETEKSI BERBAHAYA!`)
      lines.push(`  - Kategori ancaman: ${sb.threats.join(', ')}`)
    } else {
      lines.push(`\nGoogle Safe Browsing: Tidak ditemukan di database ancaman Google`)
    }
  }

  lines.push('\n\nBerdasarkan data teknis di atas, berikan analisis komprehensif.')
  lines.push('Perhatikan khusus: Safe Browsing positif = danger, SSL invalid + no headers = suspicious/danger.')
  lines.push('Jangan hanya berdasarkan nama domain, gunakan data teknis nyata di atas.')

  return lines.join('\n')
}

export async function analyzeLink(
  url: string,
  security?: SecurityCheckResult,
): Promise<GeminiAnalysisResult> {
  const technicalContext = security ? buildTechnicalContext(security) : ''

  const prompt = `${SYSTEM_PROMPT}

Analisis URL berikut:
URL: ${url}

Periksa struktur domain, kata kunci mencurigakan, dan pola phishing.${technicalContext}`

  const result = await model.generateContent(prompt)
  const text = result.response.text().trim()
  const base = parseGeminiResponse(text)

  // Build technicalDetails for response
  const technicalDetails: TechnicalDetails | undefined = security
    ? {
        ssl: security.ssl,
        domain: security.domain,
        headers: security.headers,
        redirects: security.redirects,
        safeBrowsing: security.safeBrowsing,
        checkDurationMs: security.checkDurationMs,
      }
    : undefined

  return { ...base, technicalDetails }
}

export async function analyzeScreenshot(
  base64Data: string,
  mimeType: string,
): Promise<GeminiAnalysisResult> {
  const imagePart = {
    inlineData: { data: base64Data, mimeType },
  }

  const prompt = `${SYSTEM_PROMPT}

Analisis screenshot/gambar berikut. Baca semua teks yang terlihat dalam gambar dan periksa setiap elemen untuk indikasi penipuan.`

  const result = await model.generateContent([prompt, imagePart])
  const text = result.response.text().trim()
  return parseGeminiResponse(text)
}
