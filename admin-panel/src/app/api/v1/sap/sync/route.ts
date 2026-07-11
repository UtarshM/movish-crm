import { NextRequest, NextResponse } from 'next/server'
import { validateAuth } from '@/lib/auth-guard'
import { SapClient } from '@/lib/sap-client'

export async function POST(req: NextRequest) {
  // 1. Authorize session
  const auth = await validateAuth(req)
  if (auth.error) return auth.error

  try {
    const body = await req.json()
    const { jobCard } = body

    if (!jobCard || !jobCard.id) {
      return NextResponse.json({ error: 'Missing jobCard payload or ID' }, { status: 400 })
    }

    // 2. Post invoice to SAP Service Layer
    const syncResult = await SapClient.postInvoice(jobCard)

    if (!syncResult.success) {
      return NextResponse.json({ error: syncResult.message }, { status: 502 })
    }

    return NextResponse.json({
      success: true,
      docEntry: syncResult.docEntry,
      message: syncResult.message
    })
  } catch (err: any) {
    console.error('[SAP-Sync-Route] Sync handler error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
