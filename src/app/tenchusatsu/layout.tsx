import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '天中殺診断｜生年月日で今すぐ無料チェック🦝',
  description:
    '生年月日を入れるだけで、あなたの天中殺の種類と今の状況がわかる無料診断ツール',
  openGraph: {
    title: '天中殺診断｜生年月日で今すぐ無料チェック🦝',
    description:
      '生年月日を入れるだけで、あなたの天中殺の種類と今の状況がわかる無料診断ツール',
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '天中殺診断｜生年月日で今すぐ無料チェック🦝',
    description:
      '生年月日を入れるだけで、あなたの天中殺の種類と今の状況がわかる無料診断ツール',
  },
}

export default function TenchusatsuLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
