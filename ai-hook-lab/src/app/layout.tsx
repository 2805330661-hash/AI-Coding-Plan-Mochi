import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Hook Lab — 爆款 Hook 生成器',
  description: '输入主题，选择平台和内容类型，AI 一次生成 10 个不同风格的爆款开头 Hook。',
  openGraph: {
    title: 'AI Hook Lab — 爆款 Hook 生成器',
    description: '输入主题，一次生成 10 个爆款 Hook 开头。',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
