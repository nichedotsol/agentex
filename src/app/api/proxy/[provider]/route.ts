import { NextRequest, NextResponse } from 'next/server'

const PROVIDER_URLS: Record<string, string> = {
  anthropic: 'https://api.anthropic.com/v1/messages',
  openai: 'https://api.openai.com/v1/chat/completions',
  openclaw: 'https://api.openclaw.ai/v1/chat/completions',
}

export async function POST(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    // TODO: Implement session authentication
    // const session = await getSession(request)
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // TODO: Get API key from secure storage
    // const apiKey = await getApiKey(session.userId, params.provider)
    // if (!apiKey) {
    //   return NextResponse.json({ error: 'API key not configured' }, { status: 400 })
    // }

    // For now, use environment variables (temporary)
    const apiKeyEnvMap: Record<string, string> = {
      anthropic: process.env.ANTHROPIC_API_KEY || '',
      openai: process.env.OPENAI_API_KEY || '',
      openclaw: process.env.OPENCLAW_API_KEY || '',
    }

    const apiKey = apiKeyEnvMap[params.provider]
    if (!apiKey) {
      return NextResponse.json(
        { error: `API key not configured for ${params.provider}` },
        { status: 400 }
      )
    }

    const body = await request.json()
    const providerUrl = PROVIDER_URLS[params.provider]

    if (!providerUrl) {
      return NextResponse.json(
        { error: `Unknown provider: ${params.provider}` },
        { status: 400 }
      )
    }

    // Proxy request to provider
    const response = await fetch(providerUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'x-api-key': apiKey, // For Anthropic
        ...(params.provider === 'anthropic' && {
          'anthropic-version': '2023-06-01',
        }),
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error(`Proxy error for ${params.provider}:`, error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
