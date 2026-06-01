import { NextRequest, NextResponse } from 'next/server'
import type { HookResult, HookStyle } from '@/types'
import { HOOK_STYLES } from '@/types'

const PLATFORM_GUIDES: Record<string, string> = {
  xiaohongshu: '小红书平台：种草语气、emoji友好、女性用户居多，常用"姐妹们""谁懂啊"开头，亲切分享感',
  douyin: '抖音平台：黄金3秒法则、快节奏、口语化、强冲突或强反差，抓住注意力',
  bilibili: 'B站平台：弹幕文化、玩梗多、Z世代语言，常用"卧槽""离谱""绝了"等口头禅',
  youtube: 'YouTube平台：信息密度高、中长视频教程感，"你一定不知道""99%的人都没发现"',
  x: 'X/Twitter平台：极简有力、观点鲜明、140字内的信息炸弹，适合中英文混搭',
}

const TYPE_GUIDES: Record<string, string> = {
  video: '内容形式为视频。Hook需要制造视觉期待，引导观众看完。',
  article: '内容形式为图文笔记。Hook需要结合封面图让人停下来阅读。',
  ad: '内容形式为产品广告。Hook需要突出产品卖点与用户痛点的关联。',
  tutorial: '内容形式为教程。Hook需要暗示学会后的收益或揭露常见错误。',
  opinion: '内容形式为观点帖。Hook需要鲜明立场，激发讨论和转发。',
}

function buildSystemPrompt(platform: string, contentType: string): string {
  return `你是一位资深爆款文案专家，精通各内容平台的算法和用户心理。

${PLATFORM_GUIDES[platform]}
${TYPE_GUIDES[contentType]}

请为给定主题生成10个不同风格的Hook开头文案。

必须覆盖以下10种风格，每种恰好1条：
1. 悬念反转 — 先设预期再推翻，制造意外
2. 数字冲击 — 用具体数字制造信息差和好奇心
3. 情感共鸣 — 说出用户内心感受，让人点头认同
4. 痛点直击 — 点出常见困扰，给出解决暗示
5. 认知颠覆 — 挑战固有认知，让人想一探究竟
6. 身份认同 — 标签化特定人群，制造归属感
7. 利益承诺 — 明确告诉用户看了能获得什么
8. 故事开场 — 用微型叙事或对话开场
9. 提问互动 — 用问题勾起好奇或引发讨论
10. 趋势借势 — 结合当前热门话题或趋势

每条Hook要求：
- 15-40个中文字符
- 风格标签必须是上述10种之一
- clickbaitScore为1-10的整数（代表点击欲望强度）
- reason为一句简短推荐理由（15字以内）

返回严格JSON格式，只返回JSON，不要任何其他文字：
{
  "hooks": [
    { "text": "具体hook文案", "style": "悬念反转", "clickbaitScore": 9, "reason": "反转制造强烈好奇" },
    { "text": "具体hook文案", "style": "数字冲击", "clickbaitScore": 8, "reason": "数字增加可信度" },
    { "text": "具体hook文案", "style": "情感共鸣", "clickbaitScore": 7, "reason": "引发读者情感认同" },
    { "text": "具体hook文案", "style": "痛点直击", "clickbaitScore": 8, "reason": "直接戳中用户痛点" },
    { "text": "具体hook文案", "style": "认知颠覆", "clickbaitScore": 9, "reason": "打破固有认知" },
    { "text": "具体hook文案", "style": "身份认同", "clickbaitScore": 7, "reason": "精准定位目标人群" },
    { "text": "具体hook文案", "style": "利益承诺", "clickbaitScore": 8, "reason": "明确的价值主张" },
    { "text": "具体hook文案", "style": "故事开场", "clickbaitScore": 7, "reason": "微型叙事引发好奇" },
    { "text": "具体hook文案", "style": "提问互动", "clickbaitScore": 7, "reason": "问题引发思考和互动" },
    { "text": "具体hook文案", "style": "趋势借势", "clickbaitScore": 8, "reason": "紧跟热点话题" }
  ]
}`
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.LLM_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API_KEY_MISSING', message: '请在 .env.local 中设置 LLM_API_KEY=sk-xxx' },
      { status: 500 }
    )
  }

  let body: { topic?: string; platform?: string; contentType?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'INVALID_JSON', message: '请求格式错误' }, { status: 400 })
  }

  const { topic, platform, contentType } = body
  if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
    return NextResponse.json({ error: 'MISSING_TOPIC', message: '请输入主题' }, { status: 400 })
  }
  if (!platform || !PLATFORM_GUIDES[platform]) {
    return NextResponse.json({ error: 'INVALID_PLATFORM', message: '请选择有效平台' }, { status: 400 })
  }
  if (!contentType || !TYPE_GUIDES[contentType]) {
    return NextResponse.json({ error: 'INVALID_TYPE', message: '请选择有效内容类型' }, { status: 400 })
  }

  const systemPrompt = buildSystemPrompt(platform, contentType)

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-v4-pro',
        temperature: 1.0,
        max_tokens: 4096,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `主题：${topic.trim()}` },
        ],
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      return NextResponse.json(
        { error: 'API_ERROR', message: `模型返回错误 (${response.status})，请稍后重试` },
        { status: 500 }
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: 'EMPTY_RESPONSE', message: '模型未返回内容，请重试' },
        { status: 500 }
      )
    }

    let parsed: { hooks?: HookResult[] }
    try {
      parsed = JSON.parse(content)
    } catch {
      return NextResponse.json(
        { error: 'PARSE_ERROR', message: '模型返回格式异常，请重试' },
        { status: 500 }
      )
    }

    if (!Array.isArray(parsed.hooks) || parsed.hooks.length === 0) {
      return NextResponse.json(
        { error: 'NO_HOOKS', message: '未能生成有效 Hook，请换个主题试试' },
        { status: 500 }
      )
    }

    function isValidStyle(s: unknown): s is HookStyle {
      return typeof s === 'string' && (HOOK_STYLES as readonly string[]).includes(s)
    }

    const hooks: HookResult[] = parsed.hooks.map((h: Partial<HookResult>, i: number) => ({
      id: `hook-${Date.now()}-${i}`,
      text: typeof h.text === 'string' ? h.text.slice(0, 80) : '',
      style: isValidStyle(h.style) ? h.style : '悬念反转',
      clickbaitScore: typeof h.clickbaitScore === 'number'
        ? Math.max(1, Math.min(10, Math.round(h.clickbaitScore)))
        : 5,
      reason: typeof h.reason === 'string' ? h.reason.slice(0, 40) : '值得一试的Hook',
    }))

    return NextResponse.json({ hooks })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return NextResponse.json(
        { error: 'TIMEOUT', message: '生成超时，请减少内容后重试' },
        { status: 504 }
      )
    }
    return NextResponse.json(
      { error: 'NETWORK_ERROR', message: '网络错误，请检查网络后重试' },
      { status: 500 }
    )
  }
}
