import { NextRequest, NextResponse } from 'next/server'
import { validateAuth } from '@/lib/auth-guard'
import { SapClient } from '@/lib/sap-client'

export async function GET(req: NextRequest) {
  // 1. Authorize session
  const auth = await validateAuth(req)
  if (auth.error) return auth.error

  try {
    // 2. Fetch inventory list from SAP Service Layer
    const items = await SapClient.getInventory()
    return NextResponse.json({ success: true, items })
  } catch (err: any) {
    console.error('[SAP-Inventory-Route] Fetch handler error:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
