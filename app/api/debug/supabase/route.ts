import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

function projectRefFromUrl(url: string | undefined) {
  return url?.match(/^https:\/\/([^.]+)\.supabase\.co/)?.[1] || null
}

function jwtPayload(token: string | undefined) {
  if (!token) return null

  try {
    const payload = token.split('.')[1]
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      role?: string
      ref?: string
      iss?: string
    }
  } catch {
    return null
  }
}

function errorDetails(error: unknown) {
  if (!(error instanceof Error)) return { name: 'UnknownError', message: String(error) }

  const cause = error.cause instanceof Error
    ? { name: error.cause.name, message: error.cause.message }
    : null

  return { name: error.name, message: error.message, cause }
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const servicePayload = jwtPayload(serviceRoleKey)
  const anonPayload = jwtPayload(anonKey)
  const supabaseProjectRef = projectRefFromUrl(supabaseUrl)

  try {
    const restUrl = `${supabaseUrl}/rest/v1/reagents?select=id&limit=1`
    const fetchResult = await fetch(restUrl, {
      headers: {
        apikey: serviceRoleKey || '',
        authorization: `Bearer ${serviceRoleKey || ''}`,
      },
      cache: 'no-store',
    })

    const supabase = createAdminClient()
    const { error, count } = await supabase
      .from('reagents')
      .select('id', { count: 'exact', head: true })

    return NextResponse.json({
      supabaseProjectRef,
      supabaseUrlSet: Boolean(supabaseUrl),
      anonKeySet: Boolean(anonKey),
      anonKeyRole: anonPayload?.role || null,
      anonKeyRef: anonPayload?.ref || null,
      serviceRoleKeySet: Boolean(serviceRoleKey),
      serviceRoleKeyRole: servicePayload?.role || null,
      serviceRoleKeyRef: servicePayload?.ref || null,
      restFetchStatus: fetchResult.status,
      restFetchOk: fetchResult.ok,
      supabaseQueryOk: !error,
      supabaseCount: count,
      supabaseError: error
        ? { message: error.message, code: error.code, details: error.details, hint: error.hint }
        : null,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({
      supabaseProjectRef,
      supabaseUrlSet: Boolean(supabaseUrl),
      anonKeySet: Boolean(anonKey),
      anonKeyRole: anonPayload?.role || null,
      anonKeyRef: anonPayload?.ref || null,
      serviceRoleKeySet: Boolean(serviceRoleKey),
      serviceRoleKeyRole: servicePayload?.role || null,
      serviceRoleKeyRef: servicePayload?.ref || null,
      runtimeError: errorDetails(error),
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}
