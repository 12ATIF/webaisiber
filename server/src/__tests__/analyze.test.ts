import request from 'supertest'
import { app } from '../index'

// Mock Gemini service
jest.mock('../services/gemini', () => ({
  analyzeLink: jest.fn().mockResolvedValue({
    riskScore: 85,
    riskLevel: 'danger',
    indicators: ['Domain tidak resmi', 'Meminta data sensitif'],
    recommendation: ['Jangan klik link ini', 'Laporkan ke pihak berwenang'],
    summary: 'Link mencurigakan meniru situs bank.',
  }),
  analyzeScreenshot: jest.fn().mockResolvedValue({
    riskScore: 45,
    riskLevel: 'suspicious',
    indicators: ['Urgensi palsu ditemukan', 'Tawaran mencurigakan'],
    recommendation: ['Verifikasi ke sumber resmi', 'Jangan bagikan data'],
    summary: 'Screenshot mengandung pola phishing.',
  }),
}))

// Mock Firestore service
jest.mock('../services/firestore', () => ({
  saveScan: jest.fn().mockImplementation(async (data) => ({
    id: 'mock-scan-id-123',
    type: data.type,
    input: data.input,
    riskScore: data.analysis.riskScore,
    riskLevel: data.analysis.riskLevel,
    indicators: data.analysis.indicators,
    recommendation: data.analysis.recommendation,
    summary: data.analysis.summary,
    timestamp: new Date().toISOString(),
  })),
  getRecentScans: jest.fn().mockResolvedValue([
    {
      id: 'scan-1',
      type: 'link',
      input: 'http://fake-bank.xyz',
      riskScore: 92,
      riskLevel: 'danger',
      indicators: ['Domain palsu'],
      recommendation: ['Jangan klik'],
      summary: 'Link berbahaya',
      timestamp: new Date().toISOString(),
    },
  ]),
}))

describe('GET /health', () => {
  it('mengembalikan status ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.service).toBe('WaspadaSiber API')
  })
})

describe('POST /v1/analyze — link', () => {
  it('berhasil menganalisis URL dan mengembalikan ScanResult', async () => {
    const res = await request(app)
      .post('/v1/analyze')
      .send({ type: 'link', content: 'https://fake-bank-bca.xyz/login' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toMatchObject({
      id: 'mock-scan-id-123',
      type: 'link',
      riskScore: 85,
      riskLevel: 'danger',
    })
    expect(Array.isArray(res.body.data.indicators)).toBe(true)
    expect(Array.isArray(res.body.data.recommendation)).toBe(true)
  })

  it('menolak request tanpa content', async () => {
    const res = await request(app).post('/v1/analyze').send({ type: 'link' })
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
    expect(res.body.error).toBeTruthy()
  })

  it('menolak URL yang tidak valid', async () => {
    const res = await request(app)
      .post('/v1/analyze')
      .send({ type: 'link', content: 'bukan-url-valid' })
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('menolak type yang tidak dikenali', async () => {
    const res = await request(app)
      .post('/v1/analyze')
      .send({ type: 'invalid', content: 'test' })
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })
})

describe('POST /v1/analyze — screenshot', () => {
  it('berhasil menganalisis gambar base64', async () => {
    // Minimal valid PNG base64 data URL
    const base64Png =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

    const res = await request(app)
      .post('/v1/analyze')
      .send({ type: 'screenshot', content: base64Png, filename: 'test.png' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.type).toBe('screenshot')
    expect(res.body.data.riskLevel).toBe('suspicious')
  })

  it('menolak screenshot tanpa format base64 yang benar', async () => {
    const res = await request(app)
      .post('/v1/analyze')
      .send({ type: 'screenshot', content: 'bukan-base64' })
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })
})

describe('GET /v1/scans', () => {
  it('mengembalikan daftar riwayat scan', async () => {
    const res = await request(app).get('/v1/scans')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data.length).toBeGreaterThan(0)
    expect(res.body.data[0]).toHaveProperty('riskLevel')
    expect(res.body.data[0]).toHaveProperty('riskScore')
  })

  it('menerima query param limit', async () => {
    const res = await request(app).get('/v1/scans?limit=5')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
  })
})

describe('404 handler', () => {
  it('mengembalikan 404 untuk endpoint tidak dikenal', async () => {
    const res = await request(app).get('/v1/tidak-ada')
    expect(res.status).toBe(404)
    expect(res.body.success).toBe(false)
  })
})
