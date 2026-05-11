import { useEffect, useState } from 'react'
import { Shield, Lock, Globe, Server, Link2, ShieldCheck } from 'lucide-react'

const steps = [
  { icon: Link2,       text: 'Memeriksa struktur URL & domain...' },
  { icon: Lock,        text: 'Mengvalidasi sertifikat SSL/TLS...' },
  { icon: Globe,       text: 'Menganalisis geolokasi server...' },
  { icon: Server,      text: 'Memeriksa security headers...' },
  { icon: ShieldCheck, text: 'Menghubungi Google Safe Browsing...' },
  { icon: Shield,      text: 'AI menganalisis semua data teknis...' },
  { icon: Shield,      text: 'Menghitung skor risiko komprehensif...' },
]

export function LoadingAnalysis() {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setStepIndex(i => Math.min(i + 1, steps.length - 1))
    }, 2500)
    return () => clearInterval(id)
  }, [])

  const progress = Math.round(((stepIndex + 1) / steps.length) * 100)
  const StepIcon = steps[stepIndex].icon

  return (
    <div className="flex flex-col items-center gap-6 py-10 animate-fade-in">
      {/* Animated shield */}
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg">
          <StepIcon className="w-10 h-10 text-white animate-pulse" />
        </div>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full animate-ping" />
      </div>

      <div className="text-center">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
          Pemeriksaan Keamanan Mendalam
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 h-5 transition-all animate-fade-in" key={stepIndex}>
          {steps[stepIndex].text}
        </p>
      </div>

      {/* Step indicator dots */}
      <div className="flex gap-1.5">
        {steps.map((_, i) => (
          <div
            key={i}
            className={[
              'h-1.5 rounded-full transition-all duration-500',
              i === stepIndex
                ? 'w-5 bg-blue-600'
                : i < stepIndex
                  ? 'w-1.5 bg-blue-400'
                  : 'w-1.5 bg-slate-200 dark:bg-slate-700',
            ].join(' ')}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-64 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-xs text-slate-400">
        Proses biasanya memakan waktu 10–20 detik untuk analisis penuh
      </p>
    </div>
  )
}
