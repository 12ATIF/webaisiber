import { useState } from 'react'
import {
  Lock, LockOpen, Globe, Server, ShieldCheck, ShieldAlert,
  Link2, MapPin, ChevronDown, ChevronUp, Clock, AlertTriangle,
  CheckCircle, XCircle, Wifi, ExternalLink,
} from 'lucide-react'
import { clsx } from 'clsx'
import { Card } from './ui/Card'
import type { TechnicalDetails as TechnicalDetailsType } from '../utils/types'

interface Props {
  details: TechnicalDetailsType
}

// ─── Reusable row component ──────────────────────────────────────────────────
function CheckRow({
  icon: Icon,
  label,
  value,
  status,
  sub,
}: {
  icon: typeof Lock
  label: string
  value: string
  status: 'ok' | 'warn' | 'danger' | 'info'
  sub?: string
}) {
  const statusClasses = {
    ok: 'text-emerald-600 dark:text-emerald-400',
    warn: 'text-amber-500 dark:text-amber-400',
    danger: 'text-red-500 dark:text-red-400',
    info: 'text-slate-500 dark:text-slate-400',
  }

  const StatusIcon = {
    ok: CheckCircle,
    warn: AlertTriangle,
    danger: XCircle,
    info: Globe,
  }[status]

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide mb-0.5">
          {label}
        </div>
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">
          {value}
        </div>
        {sub && (
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">{sub}</div>
        )}
      </div>
      <div className={clsx('flex items-center shrink-0', statusClasses[status])}>
        <StatusIcon className="w-4 h-4" />
      </div>
    </div>
  )
}

// ─── Section wrapper ─────────────────────────────────────────────────────────
function Section({ title, icon: Icon, children, accent }: {
  title: string
  icon: typeof Lock
  children: React.ReactNode
  accent?: string
}) {
  return (
    <div className="space-y-1">
      <div className={clsx('flex items-center gap-2 mb-2 px-0.5', accent || 'text-slate-600 dark:text-slate-300')}>
        <Icon className="w-3.5 h-3.5" />
        <span className="text-xs font-bold uppercase tracking-widest">{title}</span>
      </div>
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl px-4 py-1 border border-slate-100 dark:border-slate-700/50">
        {children}
      </div>
    </div>
  )
}

// ─── Header score badge ───────────────────────────────────────────────────────
function SecurityScore({ details }: { details: TechnicalDetailsType }) {
  let score = 0
  let maxScore = 0

  if (details.ssl) {
    maxScore += 2
    if (details.ssl.valid) score += 1
    if (!details.ssl.selfSigned && !details.ssl.mismatch) score += 1
  }

  if (details.headers) {
    maxScore += 1
    if (details.headers.score >= 2) score += 1
  }

  if (details.safeBrowsing) {
    maxScore += 2
    if (!details.safeBrowsing.isMalicious) score += 2
  }

  if (details.domain) {
    maxScore += 1
    if (!details.domain.isProxy) score += 1
  }

  if (details.redirects) {
    maxScore += 1
    if (!details.redirects.crossDomainRedirect) score += 1
  }

  const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  const label = pct >= 80 ? 'Aman' : pct >= 50 ? 'Perlu Waspada' : 'Mencurigakan'
  const color = pct >= 80
    ? 'text-emerald-600 dark:text-emerald-400'
    : pct >= 50
      ? 'text-amber-500 dark:text-amber-400'
      : 'text-red-500 dark:text-red-400'

  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-xs text-slate-400 uppercase tracking-widest font-medium">Skor Teknis</div>
        <div className={clsx('text-lg font-bold mt-0.5', color)}>{label}</div>
      </div>
      <div className="text-right">
        <div className={clsx('text-2xl font-black tabular-nums', color)}>{pct}%</div>
        <div className="text-xs text-slate-400">{score}/{maxScore} cek lulus</div>
      </div>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function TechnicalDetails({ details }: Props) {
  const [expanded, setExpanded] = useState(false)

  const hasData = details.ssl || details.domain || details.headers || details.redirects || details.safeBrowsing

  if (!hasData) return null

  return (
    <Card className="overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left"
        aria-expanded={expanded}
        id="technical-details-toggle"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-950/50 rounded-lg flex items-center justify-center">
            <Server className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 flex-1">
            Pemeriksaan Teknis Mendalam
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="w-3 h-3" />
            <span>{(details.checkDurationMs / 1000).toFixed(1)}s</span>
          </div>
          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center ml-1">
            {expanded
              ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
              : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            }
          </div>
        </div>

        <SecurityScore details={details} />
      </button>

      {/* Safe Browsing alert — always visible if malicious */}
      {details.safeBrowsing?.isMalicious && (
        <div className="mt-3 flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl">
          <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-bold text-red-700 dark:text-red-300">
              🚨 Google Safe Browsing: URL INI BERBAHAYA!
            </div>
            <div className="text-xs text-red-600 dark:text-red-400 mt-0.5">
              Ancaman terdeteksi: {details.safeBrowsing.threats.join(', ')}
            </div>
          </div>
        </div>
      )}

      {/* Expandable detail sections */}
      {expanded && (
        <div className="mt-4 space-y-4 animate-fade-in border-t border-slate-100 dark:border-slate-700 pt-4">

          {/* SSL Section */}
          {details.ssl !== null && (
            <Section title="Sertifikat SSL/TLS" icon={Lock} accent="text-emerald-600 dark:text-emerald-400">
              <CheckRow
                icon={details.ssl?.valid ? Lock : LockOpen}
                label="Status HTTPS"
                value={details.ssl?.valid ? 'Valid & Aktif' : 'Tidak Valid / Bermasalah'}
                status={details.ssl?.valid ? 'ok' : 'danger'}
              />
              <CheckRow
                icon={ShieldCheck}
                label="Diterbitkan oleh"
                value={details.ssl?.issuer || 'Tidak diketahui'}
                status={details.ssl?.issuer?.toLowerCase().includes('let\'s encrypt') ? 'info' : 'ok'}
                sub={details.ssl?.issuer?.toLowerCase().includes('let\'s encrypt')
                  ? 'Let\'s Encrypt gratis — umum dipakai tapi juga dipakai situs phishing'
                  : undefined}
              />
              {details.ssl?.daysUntilExpiry !== null && (
                <CheckRow
                  icon={Clock}
                  label="Kedaluwarsa"
                  value={
                    details.ssl.daysUntilExpiry! > 0
                      ? `${details.ssl.daysUntilExpiry} hari lagi`
                      : 'SUDAH KEDALUWARSA'
                  }
                  status={
                    details.ssl.daysUntilExpiry! > 30 ? 'ok'
                      : details.ssl.daysUntilExpiry! > 0 ? 'warn'
                        : 'danger'
                  }
                />
              )}
              {details.ssl?.selfSigned && (
                <CheckRow
                  icon={AlertTriangle}
                  label="Self-Signed"
                  value="Sertifikat self-signed terdeteksi"
                  status="danger"
                  sub="Sertifikat dibuat sendiri — sangat mencurigakan"
                />
              )}
              {details.ssl?.mismatch && (
                <CheckRow
                  icon={AlertTriangle}
                  label="Domain Mismatch"
                  value="Domain tidak cocok di sertifikat"
                  status="danger"
                  sub="Indikasi sertifikat palsu atau salah konfigurasi"
                />
              )}
            </Section>
          )}

          {details.ssl === null && (
            <Section title="Sertifikat SSL/TLS" icon={LockOpen} accent="text-red-500">
              <CheckRow
                icon={LockOpen}
                label="HTTPS"
                value="Tidak menggunakan HTTPS"
                status="danger"
                sub="Situs ini menggunakan HTTP biasa — data tidak dienkripsi"
              />
            </Section>
          )}

          {/* IP & Domain */}
          {details.domain && (
            <Section title="IP & Hosting" icon={Globe}>
              {details.domain.ip && (
                <CheckRow
                  icon={Wifi}
                  label="Alamat IP"
                  value={details.domain.ip}
                  status="info"
                />
              )}
              {(details.domain.city || details.domain.country) && (
                <CheckRow
                  icon={MapPin}
                  label="Lokasi Server"
                  value={[details.domain.city, details.domain.country].filter(Boolean).join(', ')}
                  status={details.domain.country === 'Indonesia' ? 'ok' : 'info'}
                  sub={details.domain.country !== 'Indonesia' ? 'Server berada di luar Indonesia' : undefined}
                />
              )}
              {details.domain.isp && (
                <CheckRow
                  icon={Server}
                  label="ISP / Hosting"
                  value={details.domain.isp}
                  status={details.domain.isHosting ? 'info' : 'ok'}
                  sub={details.domain.isHosting ? 'Server hosting komersial' : undefined}
                />
              )}
              {details.domain.isProxy && (
                <CheckRow
                  icon={AlertTriangle}
                  label="Proxy / VPN"
                  value="Server menggunakan Proxy atau VPN"
                  status="danger"
                  sub="Penggunaan proxy dapat menyembunyikan identitas asli"
                />
              )}
            </Section>
          )}

          {/* Security Headers */}
          {details.headers && (
            <Section title="Security Headers" icon={ShieldCheck} accent="text-blue-600 dark:text-blue-400">
              <CheckRow
                icon={ShieldCheck}
                label="Skor Header Keamanan"
                value={`${details.headers.score}/4 header terpasang`}
                status={details.headers.score >= 3 ? 'ok' : details.headers.score >= 1 ? 'warn' : 'danger'}
                sub={details.headers.score === 0 ? 'Tidak ada security header — umum pada situs phishing' : undefined}
              />
              <CheckRow
                icon={ShieldCheck}
                label="Content-Security-Policy"
                value={details.headers.hasContentSecurityPolicy ? 'Terpasang' : 'Tidak ada'}
                status={details.headers.hasContentSecurityPolicy ? 'ok' : 'warn'}
              />
              <CheckRow
                icon={ShieldCheck}
                label="X-Frame-Options"
                value={details.headers.hasXFrameOptions ? 'Terpasang' : 'Tidak ada'}
                status={details.headers.hasXFrameOptions ? 'ok' : 'warn'}
              />
              <CheckRow
                icon={Lock}
                label="HSTS (HTTP Strict Transport)"
                value={details.headers.hasStrictTransportSecurity ? 'Aktif' : 'Tidak aktif'}
                status={details.headers.hasStrictTransportSecurity ? 'ok' : 'warn'}
              />
            </Section>
          )}

          {/* Redirect Chain */}
          {details.redirects && (
            <Section title="Redirect Chain" icon={Link2} accent="text-violet-600 dark:text-violet-400">
              <CheckRow
                icon={Link2}
                label="Jumlah Redirect"
                value={`${details.redirects.chain.length} hop`}
                status={details.redirects.chain.length > 2 ? 'warn' : 'ok'}
                sub={details.redirects.hasMultipleRedirects ? 'Banyak redirect dapat menyembunyikan tujuan asli' : undefined}
              />
              {details.redirects.crossDomainRedirect && (
                <CheckRow
                  icon={ExternalLink}
                  label="Cross-Domain Redirect"
                  value="Redirect lintas domain terdeteksi"
                  status="warn"
                  sub={`Berakhir di: ${details.redirects.finalUrl}`}
                />
              )}
              {/* Chain list */}
              {details.redirects.chain.length > 1 && (
                <div className="py-2 space-y-1">
                  {details.redirects.chain.map((url, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="w-4 h-4 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 flex items-center justify-center text-[9px] font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 truncate font-mono">
                        {url}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          )}

          {/* Safe Browsing */}
          {details.safeBrowsing && !details.safeBrowsing.isMalicious && (
            <Section title="Google Safe Browsing" icon={ShieldCheck} accent="text-emerald-600 dark:text-emerald-400">
              <CheckRow
                icon={ShieldCheck}
                label="Status Database Google"
                value="Tidak ada ancaman terdeteksi"
                status="ok"
                sub="URL tidak ditemukan dalam database ancaman Google"
              />
            </Section>
          )}
        </div>
      )}
    </Card>
  )
}
