import * as tls from 'tls'
import * as dns from 'dns/promises'
import * as https from 'https'
import * as http from 'http'
import { URL } from 'url'

export interface SslInfo {
  valid: boolean
  issuer: string
  expiresAt: string | null
  daysUntilExpiry: number | null
  selfSigned: boolean
  mismatch: boolean
}

export interface DomainInfo {
  ip: string | null
  country: string | null
  city: string | null
  isp: string | null
  isProxy: boolean
  isHosting: boolean
}

export interface SecurityHeadersInfo {
  hasContentSecurityPolicy: boolean
  hasXFrameOptions: boolean
  hasXContentTypeOptions: boolean
  hasStrictTransportSecurity: boolean
  score: number // 0-4
}

export interface RedirectInfo {
  chain: string[]
  finalUrl: string
  hasMultipleRedirects: boolean
  crossDomainRedirect: boolean
}

export interface SafeBrowsingInfo {
  isMalicious: boolean
  threats: string[]
}

export interface SecurityCheckResult {
  ssl: SslInfo | null
  domain: DomainInfo | null
  headers: SecurityHeadersInfo | null
  redirects: RedirectInfo | null
  safeBrowsing: SafeBrowsingInfo | null
  checkedAt: string
  checkDurationMs: number
}

// ─── SSL Check ─────────────────────────────────────────────────────────────
function checkSsl(hostname: string): Promise<SslInfo> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve({
        valid: false,
        issuer: 'Timeout',
        expiresAt: null,
        daysUntilExpiry: null,
        selfSigned: false,
        mismatch: false,
      })
    }, 6000)

    try {
      const socket = tls.connect(
        { host: hostname, port: 443, servername: hostname, rejectUnauthorized: false },
        () => {
          clearTimeout(timeout)
          const cert = socket.getPeerCertificate()
          socket.destroy()

          if (!cert || !cert.subject) {
            resolve({ valid: false, issuer: 'No cert', expiresAt: null, daysUntilExpiry: null, selfSigned: false, mismatch: false })
            return
          }

          const validTo = cert.valid_to ? new Date(cert.valid_to) : null
          const daysUntilExpiry = validTo
            ? Math.floor((validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : null

          const issuerOrg = String(
            cert.issuer?.O || cert.issuer?.CN || 'Unknown',
          )

          // Self-signed: subject === issuer
          const selfSigned =
            JSON.stringify(cert.subject) === JSON.stringify(cert.issuer)

          // Domain mismatch check
          const rawSan = (cert as unknown as Record<string, unknown>).subjectaltname
          const san: string = typeof rawSan === 'string' ? rawSan : ''
          const cnRaw = cert.subject?.CN
          const cn = Array.isArray(cnRaw) ? cnRaw[0] : (cnRaw ?? '')
          const mismatch = !san.toLowerCase().includes(hostname.toLowerCase()) &&
            String(cn).toLowerCase() !== hostname.toLowerCase()

          resolve({
            valid: socket.authorized || (!selfSigned && daysUntilExpiry !== null && daysUntilExpiry > 0),
            issuer: issuerOrg,
            expiresAt: validTo ? validTo.toISOString() : null,
            daysUntilExpiry,
            selfSigned,
            mismatch,
          })
        },
      )

      socket.on('error', () => {
        clearTimeout(timeout)
        resolve({ valid: false, issuer: 'Connection error', expiresAt: null, daysUntilExpiry: null, selfSigned: false, mismatch: false })
      })
    } catch {
      clearTimeout(timeout)
      resolve({ valid: false, issuer: 'Error', expiresAt: null, daysUntilExpiry: null, selfSigned: false, mismatch: false })
    }
  })
}

// ─── IP & Geo Check ─────────────────────────────────────────────────────────
async function checkDomain(hostname: string): Promise<DomainInfo> {
  try {
    const addresses = await dns.resolve4(hostname).catch(() => [])
    const ip = addresses[0] || null

    if (!ip) return { ip: null, country: null, city: null, isp: null, isProxy: false, isHosting: false }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    try {
      const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,isp,proxy,hosting`, {
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!res.ok) throw new Error('ip-api failed')

      const data = await res.json() as {
        status: string
        country?: string
        city?: string
        isp?: string
        proxy?: boolean
        hosting?: boolean
      }

      return {
        ip,
        country: data.country || null,
        city: data.city || null,
        isp: data.isp || null,
        isProxy: data.proxy || false,
        isHosting: data.hosting || false,
      }
    } catch {
      clearTimeout(timeoutId)
      return { ip, country: null, city: null, isp: null, isProxy: false, isHosting: false }
    }
  } catch {
    return { ip: null, country: null, city: null, isp: null, isProxy: false, isHosting: false }
  }
}

// ─── Security Headers Check ──────────────────────────────────────────────────
async function checkSecurityHeaders(urlStr: string): Promise<SecurityHeadersInfo> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(urlStr, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    }).catch(() => null)

    clearTimeout(timeoutId)

    if (!res) {
      return { hasContentSecurityPolicy: false, hasXFrameOptions: false, hasXContentTypeOptions: false, hasStrictTransportSecurity: false, score: 0 }
    }

    const csp = res.headers.has('content-security-policy')
    const xfo = res.headers.has('x-frame-options')
    const xcto = res.headers.has('x-content-type-options')
    const hsts = res.headers.has('strict-transport-security')

    const score = [csp, xfo, xcto, hsts].filter(Boolean).length

    return {
      hasContentSecurityPolicy: csp,
      hasXFrameOptions: xfo,
      hasXContentTypeOptions: xcto,
      hasStrictTransportSecurity: hsts,
      score,
    }
  } catch {
    return { hasContentSecurityPolicy: false, hasXFrameOptions: false, hasXContentTypeOptions: false, hasStrictTransportSecurity: false, score: 0 }
  }
}

// ─── Redirect Chain ──────────────────────────────────────────────────────────
function followRedirects(urlStr: string, maxRedirects = 8): Promise<RedirectInfo> {
  return new Promise((resolve) => {
    const chain: string[] = [urlStr]
    let redirectCount = 0

    const timeout = setTimeout(() => {
      resolve({
        chain,
        finalUrl: chain[chain.length - 1],
        hasMultipleRedirects: chain.length > 2,
        crossDomainRedirect: hasCrossDomainRedirect(chain),
      })
    }, 10000)

    function follow(currentUrl: string) {
      try {
        const parsed = new URL(currentUrl)
        const lib = parsed.protocol === 'https:' ? https : http

        const req = lib.request(
          { hostname: parsed.hostname, path: parsed.pathname + parsed.search, method: 'HEAD', port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80) },
          (res) => {
            const location = res.headers.location
            if (location && redirectCount < maxRedirects && (res.statusCode ?? 0) >= 300 && (res.statusCode ?? 0) < 400) {
              redirectCount++
              const nextUrl = location.startsWith('http') ? location : `${parsed.origin}${location}`
              chain.push(nextUrl)
              follow(nextUrl)
            } else {
              clearTimeout(timeout)
              resolve({
                chain,
                finalUrl: currentUrl,
                hasMultipleRedirects: chain.length > 2,
                crossDomainRedirect: hasCrossDomainRedirect(chain),
              })
            }
          },
        )
        req.on('error', () => {
          clearTimeout(timeout)
          resolve({ chain, finalUrl: currentUrl, hasMultipleRedirects: chain.length > 2, crossDomainRedirect: hasCrossDomainRedirect(chain) })
        })
        req.setTimeout(5000, () => {
          req.destroy()
          clearTimeout(timeout)
          resolve({ chain, finalUrl: currentUrl, hasMultipleRedirects: chain.length > 2, crossDomainRedirect: hasCrossDomainRedirect(chain) })
        })
        req.end()
      } catch {
        clearTimeout(timeout)
        resolve({ chain, finalUrl: currentUrl, hasMultipleRedirects: chain.length > 2, crossDomainRedirect: hasCrossDomainRedirect(chain) })
      }
    }

    follow(urlStr)
  })
}

function hasCrossDomainRedirect(chain: string[]): boolean {
  if (chain.length < 2) return false
  try {
    const originDomain = new URL(chain[0]).hostname.replace(/^www\./, '')
    const finalDomain = new URL(chain[chain.length - 1]).hostname.replace(/^www\./, '')
    return originDomain !== finalDomain
  } catch {
    return false
  }
}

// ─── Google Safe Browsing ────────────────────────────────────────────────────
async function checkSafeBrowsing(urlStr: string): Promise<SafeBrowsingInfo> {
  const apiKey = process.env.SAFE_BROWSING_API_KEY
  if (!apiKey) {
    return { isMalicious: false, threats: [] }
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const res = await fetch(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          client: { clientId: 'waspadasiber', clientVersion: '1.0' },
          threatInfo: {
            threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
            platformTypes: ['ANY_PLATFORM'],
            threatEntryTypes: ['URL'],
            threatEntries: [{ url: urlStr }],
          },
        }),
      },
    )
    clearTimeout(timeoutId)

    const data = await res.json() as { matches?: Array<{ threatType: string }> }
    const threats = (data.matches || []).map((m) => m.threatType)

    return { isMalicious: threats.length > 0, threats }
  } catch {
    return { isMalicious: false, threats: [] }
  }
}

// ─── Main Entry ──────────────────────────────────────────────────────────────
export async function runSecurityChecks(urlStr: string): Promise<SecurityCheckResult> {
  const start = Date.now()

  let parsed: URL
  try {
    parsed = new URL(urlStr)
  } catch {
    return {
      ssl: null,
      domain: null,
      headers: null,
      redirects: null,
      safeBrowsing: null,
      checkedAt: new Date().toISOString(),
      checkDurationMs: 0,
    }
  }

  const hostname = parsed.hostname
  const isHttps = parsed.protocol === 'https:'

  // Run all checks in parallel for speed
  const [ssl, domain, headers, redirects, safeBrowsing] = await Promise.all([
    isHttps ? checkSsl(hostname) : Promise.resolve(null),
    checkDomain(hostname),
    checkSecurityHeaders(urlStr),
    followRedirects(urlStr),
    checkSafeBrowsing(urlStr),
  ])

  return {
    ssl,
    domain,
    headers,
    redirects,
    safeBrowsing,
    checkedAt: new Date().toISOString(),
    checkDurationMs: Date.now() - start,
  }
}
