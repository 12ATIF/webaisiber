// Shared types used by both API client and AppContext
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

export interface ScanRecord {
  id: string
  type: 'link' | 'screenshot'
  input: string
  riskScore: number
  riskLevel: RiskLevel
  indicators: string[]
  recommendation: string[]
  summary: string
  timestamp: string
  platform?: string
  technicalDetails?: TechnicalDetails
}
