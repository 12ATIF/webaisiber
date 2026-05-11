export type RiskLevel = 'safe' | 'suspicious' | 'danger'

export interface ScanResult {
  id: string
  type: 'screenshot' | 'link'
  input: string
  riskScore: number
  riskLevel: RiskLevel
  timestamp: string
  indicators: string[]
  recommendation: string[]
  platform?: string
}

export interface CommunityReport {
  id: string
  title: string
  description: string
  platform: 'WhatsApp' | 'SMS' | 'Email' | 'Instagram' | 'Telegram'
  reportedAt: string
  reportCount: number
  riskLevel: RiskLevel
  tags: string[]
}

export interface SecurityTip {
  id: string
  title: string
  body: string
  icon: string
}

export const mockScanHistory: ScanResult[] = [
  {
    id: '1',
    type: 'link',
    input: 'http://bca-banking-secure.xyz/login',
    riskScore: 92,
    riskLevel: 'danger',
    timestamp: '2026-05-06T08:30:00Z',
    indicators: [
      'Domain tidak resmi (bukan bca.co.id)',
      'Menggunakan subdomain palsu yang meniru bank',
      'Meminta data login sensitif',
      'URL mengandung kata kunci manipulatif',
    ],
    recommendation: [
      'Jangan klik link ini sama sekali',
      'Laporkan ke pihak berwenang',
      'Hubungi bank resmi melalui nomor yang tertera di kartu',
    ],
    platform: 'WhatsApp',
  },
  {
    id: '2',
    type: 'screenshot',
    input: 'chat_screenshot_001.png',
    riskScore: 67,
    riskLevel: 'suspicious',
    timestamp: '2026-05-05T14:20:00Z',
    indicators: [
      'Urgensi tinggi: "Segera konfirmasi dalam 1 jam"',
      'Tawaran hadiah tidak masuk akal',
      'Meminta transfer ke rekening pribadi',
    ],
    recommendation: [
      'Verifikasi identitas pengirim terlebih dahulu',
      'Jangan transfer uang sebelum konfirmasi resmi',
      'Hubungi sumber asli untuk verifikasi',
    ],
    platform: 'WhatsApp',
  },
  {
    id: '3',
    type: 'link',
    input: 'https://shopee.co.id/promo/harbolnas',
    riskScore: 12,
    riskLevel: 'safe',
    timestamp: '2026-05-04T10:15:00Z',
    indicators: [
      'Domain resmi terverifikasi',
      'Menggunakan HTTPS dengan sertifikat valid',
    ],
    recommendation: [
      'Link ini aman untuk dibuka',
      'Tetap waspada dengan transaksi online',
    ],
    platform: 'Instagram',
  },
  {
    id: '4',
    type: 'screenshot',
    input: 'sms_screenshot_002.png',
    riskScore: 88,
    riskLevel: 'danger',
    timestamp: '2026-05-03T16:45:00Z',
    indicators: [
      'Pengirim menggunakan nomor tidak dikenal',
      'Mengklaim sebagai pihak pajak resmi',
      'Ancaman denda jika tidak segera merespons',
      'Link mencurigakan disingkat dengan bit.ly',
    ],
    recommendation: [
      'Abaikan pesan ini',
      'Blokir nomor pengirim',
      'Laporan ke Kominfo: aduankonten.id',
    ],
    platform: 'SMS',
  },
]

export const mockCommunityReports: CommunityReport[] = [
  {
    id: 'c1',
    title: 'Penipuan Berkedok Undian Berhadiah BRI',
    description: 'Pesan WhatsApp mengklaim pemenang undian BRI senilai Rp 150 juta, meminta biaya administrasi Rp 500rb terlebih dahulu.',
    platform: 'WhatsApp',
    reportedAt: '2026-05-06T07:00:00Z',
    reportCount: 234,
    riskLevel: 'danger',
    tags: ['undian palsu', 'bank', 'penipuan uang'],
  },
  {
    id: 'c2',
    title: 'Phishing Shopee — Link Diskon 90%',
    description: 'Link palsu meniru tampilan Shopee, meminta login ulang untuk mengklaim voucher diskon besar. Akun korban langsung diambil alih.',
    platform: 'Instagram',
    reportedAt: '2026-05-05T12:00:00Z',
    reportCount: 189,
    riskLevel: 'danger',
    tags: ['phishing', 'e-commerce', 'akun diretas'],
  },
  {
    id: 'c3',
    title: 'SMS Tagihan Listrik Palsu PLN',
    description: 'SMS mengklaim tunggakan listrik Rp 750rb harus dibayar dalam 24 jam atau listrik dimatikan. Disertai link pembayaran palsu.',
    platform: 'SMS',
    reportedAt: '2026-05-05T09:00:00Z',
    reportCount: 412,
    riskLevel: 'danger',
    tags: ['PLN palsu', 'tagihan', 'social engineering'],
  },
  {
    id: 'c4',
    title: 'Email Investasi Kripto Jaminan Untung',
    description: 'Email menawarkan investasi kripto dengan jaminan keuntungan 50% per bulan. Meminta transfer awal Rp 1 juta.',
    platform: 'Email',
    reportedAt: '2026-05-04T15:00:00Z',
    reportCount: 98,
    riskLevel: 'suspicious',
    tags: ['investasi palsu', 'kripto', 'skema Ponzi'],
  },
  {
    id: 'c5',
    title: 'Akun Telegram Palsu Customer Service Bank',
    description: 'Akun Telegram mengaku CS bank meminta OTP dan PIN ATM dengan alasan verifikasi akun.',
    platform: 'Telegram',
    reportedAt: '2026-05-04T11:00:00Z',
    reportCount: 156,
    riskLevel: 'danger',
    tags: ['social engineering', 'OTP', 'bank'],
  },
  {
    id: 'c6',
    title: 'Tawaran Kerja Part-Time Palsu Via WA',
    description: 'Pesan menawarkan pekerjaan part-time online Rp 500rb/hari, namun korban diminta bayar "biaya pelatihan" terlebih dahulu.',
    platform: 'WhatsApp',
    reportedAt: '2026-05-03T13:00:00Z',
    reportCount: 321,
    riskLevel: 'suspicious',
    tags: ['lowongan palsu', 'penipuan kerja'],
  },
]

export const securityTips: SecurityTip[] = [
  {
    id: 't1',
    title: 'Verifikasi Sebelum Klik',
    body: 'Selalu periksa URL sebelum mengklik link. Domain resmi bank Indonesia tidak akan menggunakan subdomain atau domain asing.',
    icon: 'shield',
  },
  {
    id: 't2',
    title: 'Jangan Bagikan OTP',
    body: 'Tidak ada pihak resmi yang akan meminta kode OTP, PIN, atau kata sandi Anda melalui telepon, SMS, atau chat.',
    icon: 'lock',
  },
  {
    id: 't3',
    title: 'Waspada Urgensi Palsu',
    body: 'Penipu sering menciptakan rasa mendesak ("dalam 1 jam", "segera atau dihapus") untuk mencegah Anda berpikir jernih.',
    icon: 'alert-triangle',
  },
  {
    id: 't4',
    title: 'Gunakan 2FA',
    body: 'Aktifkan autentikasi dua faktor (2FA) di semua akun penting untuk lapisan keamanan tambahan.',
    icon: 'key',
  },
]

export const trendingScamTopics = [
  { label: 'Undian Berhadiah', count: 1240 },
  { label: 'Phishing Bank', count: 980 },
  { label: 'Lowongan Palsu', count: 756 },
  { label: 'Investasi Bodong', count: 632 },
  { label: 'CS Palsu', count: 445 },
]
