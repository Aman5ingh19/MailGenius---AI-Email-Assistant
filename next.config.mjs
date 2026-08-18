/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Gzip / Brotli compression ──────────────────────────────────────────────
  compress: true,

  // ── Security Headers (Helmet-equivalent for Next.js) ─────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Block MIME type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Referrer policy — don't leak full URL to third parties
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // DNS prefetch control
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          // HSTS — force HTTPS in browsers (1 year)
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // Permissions policy — restrict browser features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Allow scripts from self + inline (Next.js needs this)
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              // Allow styles from self + inline (CSS-in-JS)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // Allow fonts from Google Fonts + self
              "font-src 'self' https://fonts.gstatic.com",
              // Allow images from self + Cloudinary CDN + data URIs
              "img-src 'self' data: blob: https://res.cloudinary.com https://avatars.githubusercontent.com https://lh3.googleusercontent.com",
              // Allow API connections to trusted origins
              "connect-src 'self' https://generativelanguage.googleapis.com https://api.groq.com https://openrouter.ai",
              // No frames from external origins
              "frame-src 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
