import { Router, Request, Response } from 'express'
import { analyzeLink, analyzeScreenshot } from '../services/gemini'
import { saveScan, getRecentScans } from '../services/firestore'
import { runSecurityChecks } from '../services/securityChecker'

const router = Router()

// POST /v1/analyze
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { type, content, filename } = req.body as {
      type: string
      content: string
      filename?: string
    }

    if (!type || !['link', 'screenshot'].includes(type)) {
      return res.status(400).json({ success: false, error: 'type harus "link" atau "screenshot"' })
    }

    if (!content) {
      return res.status(400).json({ success: false, error: 'content wajib diisi' })
    }

    let analysis
    let input: string

    if (type === 'link') {
      // Validate URL
      try {
        new URL(content)
      } catch {
        return res.status(400).json({ success: false, error: 'URL tidak valid' })
      }

      // Run deep security checks in parallel with nothing else blocking
      console.log(`[analyze] Running deep security check for: ${content}`)
      const security = await runSecurityChecks(content)
      console.log(`[analyze] Security check done in ${security.checkDurationMs}ms`)

      // Pass security data to Gemini for richer analysis
      analysis = await analyzeLink(content, security)
      input = content
    } else {
      // screenshot — content is base64 data URL: "data:image/jpeg;base64,..."
      const match = content.match(/^data:(image\/\w+);base64,(.+)$/)
      if (!match) {
        return res
          .status(400)
          .json({ success: false, error: 'Format gambar tidak valid (harus base64 data URL)' })
      }
      const [, mimeType, base64Data] = match
      analysis = await analyzeScreenshot(base64Data, mimeType)
      input = filename || 'screenshot.png'
    }

    const record = await saveScan({ type: type as 'link' | 'screenshot', input, analysis })

    return res.json({ success: true, data: record })
  } catch (err: unknown) {
    console.error('[analyze] Error:', err)
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan internal'
    return res.status(500).json({ success: false, error: message })
  }
})

// GET /v1/scans — riwayat scan terbaru (publik)
router.get('/scans', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt((req.query.limit as string) || '20', 10), 50)
    const scans = await getRecentScans(limit)
    return res.json({ success: true, data: scans })
  } catch (err: unknown) {
    console.error('[scans] Error:', err)
    return res.status(500).json({ success: false, error: 'Gagal mengambil riwayat scan' })
  }
})

export { router as analyzeRouter }
