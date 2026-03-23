import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 36,
          fontWeight: 700,
          color: '#1a1a1a',
          letterSpacing: '-1px',
        }}
      >
        <span style={{ fontFamily: 'serif', fontStyle: 'italic' }}>Kosvana</span>
      </div>
    ),
    {
      ...size,
    }
  );
}
