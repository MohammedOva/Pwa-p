import { NextResponse } from 'next/server'

const allowedStages = new Set([
  'permission-result',
  'messaging-support',
  'service-worker-register',
  'service-worker-ready',
  'token-request',
  'firestore-save',
])

const safeCodePattern = /^[a-zA-Z0-9._/-]{1,100}$/

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')

  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        return NextResponse.json({ ok: false }, { status: 403 })
      }
    } catch {
      return NextResponse.json({ ok: false }, { status: 403 })
    }
  } else if (request.headers.get('sec-fetch-site') === 'cross-site') {
    return NextResponse.json({ ok: false }, { status: 403 })
  }

  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > 512) {
    return NextResponse.json({ ok: false }, { status: 413 })
  }

  let payload: unknown
  try {
    const body = await request.text()
    if (body.length > 512) return NextResponse.json({ ok: false }, { status: 413 })
    payload = JSON.parse(body)
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  if (typeof payload !== 'object' || payload === null) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const { stage, code } = payload as { stage?: unknown; code?: unknown }
  if (
    typeof stage !== 'string' ||
    !allowedStages.has(stage) ||
    typeof code !== 'string' ||
    !safeCodePattern.test(code)
  ) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  // Deliberately omit tokens, browser identifiers, and raw exception messages.
  console.error(`[notification-activation] stage=${stage} code=${code}`)
  return NextResponse.json({ ok: true }, { status: 202 })
}