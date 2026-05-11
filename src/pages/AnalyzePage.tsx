import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Upload, Link2, Image, X, AlertCircle, Shield } from 'lucide-react'
import { clsx } from 'clsx'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'
import { LoadingAnalysis } from '../components/LoadingAnalysis'
import { useApp } from '../context/AppContext'
import { analyzeContent } from '../utils/api'

type Tab = 'screenshot' | 'link'

export function AnalyzePage() {
  const [params] = useSearchParams()
  const [tab, setTab] = useState<Tab>((params.get('tab') as Tab) || 'screenshot')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [link, setLink] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { state, dispatch } = useApp()

  useEffect(() => {
    const t = params.get('tab') as Tab
    if (t) setTab(t)
  }, [params])

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) {
      setError('Hanya file gambar yang diperbolehkan (PNG, JPG, WEBP).')
      return
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('Ukuran file maksimal 10 MB.')
      return
    }
    setError(null)
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }, [])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [handleFile])

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  const removeFile = () => {
    setFile(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const validate = (): boolean => {
    if (tab === 'screenshot' && !file) {
      setError('Silakan pilih atau seret gambar terlebih dahulu.')
      return false
    }
    if (tab === 'link') {
      if (!link.trim()) {
        setError('Silakan masukkan URL yang ingin dicek.')
        return false
      }
      try {
        new URL(link.trim())
      } catch {
        setError('URL tidak valid. Pastikan dimulai dengan http:// atau https://')
        return false
      }
    }
    setError(null)
    return true
  }

  const handleAnalyze = async () => {
    if (!validate()) return
    dispatch({ type: 'SET_ANALYZING', payload: true })

    const res = await analyzeContent(
      tab === 'link'
        ? { type: 'link', content: link.trim() }
        : { type: 'screenshot', content: file!.name, file: file!, filename: file!.name },
    )

    dispatch({ type: 'SET_ANALYZING', payload: false })

    if (!res.success || !res.data) {
      setError(res.error || 'Terjadi kesalahan. Coba lagi.')
      return
    }

    dispatch({ type: 'ADD_SCAN_RESULT', payload: res.data })
    navigate('/result')
  }

  if (state.isAnalyzing) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <LoadingAnalysis />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Analisis Konten
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Upload screenshot chat atau masukkan link yang ingin kamu cek.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {[
          { n: 1, label: 'Pilih Konten' },
          { n: 2, label: 'Analisis AI' },
          { n: 3, label: 'Hasil' },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-3">
            <div className={clsx(
              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold',
              s.n === 1
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-400',
            )}>
              {s.n}
            </div>
            <span className={clsx(
              'text-sm font-medium hidden sm:block',
              s.n === 1 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400',
            )}>
              {s.label}
            </span>
            {i < 2 && <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700 w-8" />}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-slate-200 dark:bg-slate-800 rounded-xl">
        {([['screenshot', 'Upload Screenshot', Image], ['link', 'Cek Link', Link2]] as const).map(
          ([t, label, Icon]) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null) }}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all',
                tab === t
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ),
        )}
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)} className="mb-4">
          {error}
        </Alert>
      )}

      {/* Input file — di luar drop zone agar click event tidak bubble balik */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />

      {/* Screenshot tab */}
      {tab === 'screenshot' && (
        <div className="space-y-4">
          {!preview ? (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
              className={clsx(
                'border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                dragOver
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 scale-[1.01]'
                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-slate-700/50',
              )}
            >
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
                Seret gambar ke sini
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                atau klik untuk memilih file
              </p>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-600">
                PNG, JPG, WEBP • Maks 10 MB
              </span>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
              <img src={preview} alt="Preview" className="w-full max-h-80 object-contain" />
              <button
                onClick={removeFile}
                className="absolute top-3 right-3 w-8 h-8 bg-white dark:bg-slate-700 rounded-full shadow-md flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
              >
                <X className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>
              <div className="absolute bottom-3 left-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate max-w-48">
                  {file?.name}
                </p>
                <p className="text-[10px] text-slate-400">
                  {file ? (file.size / 1024).toFixed(1) : 0} KB
                </p>
              </div>
            </div>
          )}

          <Alert variant="info">
            <strong>Tips:</strong> Screenshot harus memperlihatkan keseluruhan percakapan agar analisis lebih akurat.
          </Alert>
        </div>
      )}

      {/* Link tab */}
      {tab === 'link' && (
        <div className="space-y-4">
          <Input
            label="URL yang Mencurigakan"
            placeholder="https://contoh-link-mencurigakan.com"
            value={link}
            onChange={e => setLink(e.target.value)}
            leftIcon={<Link2 className="w-4 h-4" />}
            hint="Salin dan tempel link yang kamu terima dari pesan atau media sosial"
            onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
          />

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">
                  Perhatian
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-500 leading-relaxed">
                  Jangan buka link yang mencurigakan di browser sebelum dicek. Cukup salin dan tempel di sini.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Button
        size="lg"
        fullWidth
        className="mt-6"
        onClick={handleAnalyze}
        disabled={(tab === 'screenshot' && !file) || (tab === 'link' && !link.trim())}
        icon={<Shield className="w-5 h-5" />}
      >
        Analyze Now
      </Button>
    </div>
  )
}

