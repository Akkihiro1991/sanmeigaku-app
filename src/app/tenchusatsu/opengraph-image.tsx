import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e003b 0%, #6d28d9 50%, #2e1065 100%)',
        }}
      >
        <div style={{ fontSize: 110, lineHeight: 1 }}>🦝</div>
        <div
          style={{
            color: '#ffffff',
            fontSize: 56,
            fontWeight: 'bold',
            textAlign: 'center',
            padding: '24px 80px 0',
            lineHeight: 1.3,
          }}
        >
          天中殺診断
        </div>
        <div
          style={{
            color: '#e9d5ff',
            fontSize: 30,
            marginTop: 20,
            textAlign: 'center',
            padding: '0 80px',
          }}
        >
          生年月日を入れるだけで、今の状況がわかる
        </div>
        <div
          style={{
            marginTop: 32,
            padding: '12px 40px',
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '9999px',
            color: '#f3e8ff',
            fontSize: 24,
          }}
        >
          無料診断ツール
        </div>
      </div>
    ),
    { ...size }
  )
}
