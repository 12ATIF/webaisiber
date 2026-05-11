import { useNavigate } from 'react-router-dom'
import {
  CheckCircle, AlertTriangle, XCircle, ChevronRight,
  RotateCcw, Flag, ExternalLink, Shield,
} from 'lucide-react'
import { clsx } from 'clsx'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Alert } from '../components/ui/Alert'
import { RiskScore } from '../components/RiskScore'
import { Badge } from '../components/ui/Badge'
import { TechnicalDetails } from '../components/TechnicalDetails'
import { useApp } from '../context/AppContext'
import type { RiskLevel } from '../utils/types'

const levelMeta: Record<RiskLevel, {
  title: string
  subtitle: string
  icon: typeof CheckCircle
  alertVariant: 'success' | 'warning' | 'error'
  bg: string
}> = {
  safe: {
    title: 'Konten Ini Tampak Aman',
    subtitle: 'Tidak ditemukan indikasi penipuan yang signifikan.',
    icon: CheckCircle,
    alertVariant: 'success',
    bg: 'bg-green-50 dark:bg-green-950/20',
  },
  suspicious: {
    title: 'Ada Hal yang Perlu Diwaspadai',
    subtitle: 'Ditemukan beberapa pola yang perlu diverifikasi lebih lanjut.',
    icon: AlertTriangle,
    alertVariant: 'warning',
    bg: 'bg-yellow-50 dark:bg-yellow-950/20',
  },
  danger: {
    title: 'Konten Ini Sangat Berbahaya!',
    subtitle: 'Ditemukan pola penipuan kuat. Jangan ikuti instruksi dalam konten ini.',
    icon: XCircle,
    alertVariant: 'error',
    bg: 'bg-red-50 dark:bg-red-950/20',
  },
}

export function ResultPage() {
  const navigate = useNavigate()
  const { state } = useApp()
  const result = state.currentResult

  if (!result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <Shield className="w-14 h-14 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">
          Belum ada hasil analisis
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
          Mulai dengan menganalisis screenshot atau link mencurigakan.
        </p>
        <Button onClick={() => navigate('/analyze')}>Mulai Analisis</Button>
      </div>
    )
  }

  const meta = levelMeta[result.riskLevel]
  const Icon = meta.icon

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">

      {/* Header result card */}
      <Card className={clsx('text-center py-8', meta.bg)}>
        <div className="flex justify-center mb-6">
          <RiskScore score={result.riskScore} level={result.riskLevel} />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{meta.title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          {meta.subtitle}
        </p>

        {/* Input summary */}
        <div className="mt-4 inline-flex items-center gap-2 bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm max-w-full overflow-hidden">
          <span className="text-slate-400 shrink-0">Diperiksa:</span>
          <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
            {result.input}
          </span>
        </div>
      </Card>

      {/* Alert banner */}
      <Alert variant={meta.alertVariant} title={meta.title}>
        {meta.subtitle}
      </Alert>

      {/* Indicators */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
            <Icon className={clsx(
              'w-4 h-4',
              result.riskLevel === 'safe' && 'text-green-600',
              result.riskLevel === 'suspicious' && 'text-yellow-600',
              result.riskLevel === 'danger' && 'text-red-600',
            )} />
          </div>
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">
            Indikator yang Ditemukan
          </h2>
          <Badge variant={result.riskLevel} className="ml-auto">
            {result.indicators.length} temuan
          </Badge>
        </div>
        <ul className="space-y-3">
          {result.indicators.map((ind, i) => (
            <li
              key={i}
              className={clsx(
                'flex items-start gap-3 p-3 rounded-xl text-sm animate-fade-in',
                `delay-${(i + 1) * 100}`,
                result.riskLevel === 'danger' && 'bg-red-50 dark:bg-red-950/20',
                result.riskLevel === 'suspicious' && 'bg-yellow-50 dark:bg-yellow-950/20',
                result.riskLevel === 'safe' && 'bg-green-50 dark:bg-green-950/20',
              )}
            >
              <ChevronRight className={clsx(
                'w-4 h-4 shrink-0 mt-0.5',
                result.riskLevel === 'danger' && 'text-red-500',
                result.riskLevel === 'suspicious' && 'text-yellow-500',
                result.riskLevel === 'safe' && 'text-green-500',
              )} />
              <span className="text-slate-700 dark:text-slate-200">{ind}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Technical Details — only for link scans with data */}
      {result.type === 'link' && result.technicalDetails && (
        <TechnicalDetails details={result.technicalDetails} />
      )}

      {/* Recommendations */}
      <Card>
        <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-blue-100 dark:bg-blue-950/50 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </span>
          Rekomendasi Tindakan
        </h2>
        <ul className="space-y-3">
          {result.recommendation.map((rec, i) => (
            <li
              key={i}
              className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl text-sm animate-fade-in"
              style={{ animationDelay: `${(i + 1) * 100}ms` }}
            >
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="text-slate-700 dark:text-slate-200 font-medium">{rec}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* CTA buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {result.riskLevel !== 'safe' && (
          <Button
            variant="danger"
            size="lg"
            fullWidth
            icon={<Flag className="w-4 h-4" />}
            onClick={() => window.open('https://aduankonten.id', '_blank')}
          >
            Laporkan Penipuan
          </Button>
        )}
        <Button
          variant="outline"
          size="lg"
          fullWidth
          icon={<RotateCcw className="w-4 h-4" />}
          onClick={() => navigate('/analyze')}
        >
          Cek Lagi
        </Button>
      </div>

      {/* Resource link */}
      <div className="text-center">
        <a
          href="https://kominfo.go.id"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 hover:underline"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Pelajari lebih lanjut di Kominfo.go.id
        </a>
      </div>
    </div>
  )
}
