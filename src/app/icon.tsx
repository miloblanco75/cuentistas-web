import { ImageResponse } from 'next/og';

// Configuración del Icono (Next.js Metadata API)
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Generación Dinámica del Favicon
export default function Icon() {
  return new ImageResponse(
    (
      // Estilo Cuentistas: Fondo negro, 'C' dorada
      <div
        style={{
          fontSize: 24,
          background: '#050508',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#D4AF37',
          fontWeight: 'bold',
          fontFamily: 'serif',
          border: '1px solid rgba(212,175,55,0.3)',
        }}
      >
        C
      </div>
    ),
    {
      ...size,
    }
  );
}
