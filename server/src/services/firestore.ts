import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { readFileSync } from 'fs'
import { join } from 'path'
import type { GeminiAnalysisResult, RiskLevel, TechnicalDetails } from './gemini'

// Initialize Firebase Admin — uses JSON file locally, env vars on Cloud Run
if (!getApps().length) {
  // Try service account JSON file first (local dev)
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
    ? join(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS)
    : join(process.cwd(), 'serviceAccountKey.json')

  let credential: ReturnType<typeof cert>

  try {
    const raw = JSON.parse(readFileSync(keyPath, 'utf-8'))
    if (!raw.private_key) throw new Error('Missing private_key in JSON')
    credential = cert(raw)
    console.log('[Firebase] Initialized from service account file:', keyPath)
  } catch (fileErr) {
    // Fallback to individual env vars (Cloud Run deployment)
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const projectId = process.env.FIREBASE_PROJECT_ID

    if (!privateKey || !clientEmail || !projectId) {
      console.error('[Firebase] Cannot initialize: service account file missing and env vars incomplete.', (fileErr as Error).message)
      throw fileErr
    }
    credential = cert({ projectId, privateKey: privateKey.replace(/\\n/g, '\n'), clientEmail })
    console.log('[Firebase] Initialized from environment variables')
  }

  initializeApp({ credential })
}

const db = getFirestore()
db.settings({ ignoreUndefinedProperties: true })

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
  technicalDetails?: TechnicalDetails
}

export async function saveScan(data: {
  type: 'link' | 'screenshot'
  input: string
  analysis: GeminiAnalysisResult
}): Promise<ScanRecord> {
  const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  const record: ScanRecord = {
    id,
    type: data.type,
    input: data.input,
    riskScore: data.analysis.riskScore,
    riskLevel: data.analysis.riskLevel,
    indicators: data.analysis.indicators,
    recommendation: data.analysis.recommendation,
    summary: data.analysis.summary,
    timestamp: new Date().toISOString(),
    technicalDetails: data.analysis.technicalDetails,
  }

  try {
    const docRef = db.collection('scans').doc()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, ...payloadWithoutId } = record
    await docRef.set({ ...payloadWithoutId, createdAt: Timestamp.now() })
    record.id = docRef.id
    console.log('[Firestore] Scan saved:', docRef.id)
  } catch (err) {
    console.warn('[Firestore] saveScan failed, returning local record:', (err as Error).message)
  }

  return record
}

export async function getRecentScans(limit = 20): Promise<ScanRecord[]> {
  try {
    const snap = await db.collection('scans').orderBy('createdAt', 'desc').limit(limit).get()

    return snap.docs.map((doc) => {
      const d = doc.data()
      return {
        id: doc.id,
        type: d.type,
        input: d.input,
        riskScore: d.riskScore,
        riskLevel: d.riskLevel,
        indicators: d.indicators || [],
        recommendation: d.recommendation || [],
        summary: d.summary || '',
        timestamp: d.timestamp,
        technicalDetails: d.technicalDetails,
      } as ScanRecord
    })
  } catch (err) {
    console.warn('[Firestore] getRecentScans failed:', (err as Error).message)
    return []
  }
}
