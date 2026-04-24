import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    // 执行一个简单的数据库查询来保持 Supabase 活跃
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('reagents')
      .select('id')
      .limit(1)

    if (error) {
      console.error('Health check database error:', error)
      return NextResponse.json(
        {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    })
  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
