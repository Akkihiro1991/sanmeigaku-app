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
          background: 'linear-gradient(135deg, #3b0764 0%, #6d28d9 50%, #4c1d95 100%)',
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
          算命学 命式鑑定
        </div>
        <div
          style={{
            color: '#e9d5ff',
            fontSize: 30,
            marginTop: 20,
            textAlign: 'center',
          }}
        >
          生年月日で陰占・陽占を無料算出
        </div>
      </div>
    ),
    { ...size }
  )
}
