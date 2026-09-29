import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/poppins/800.css';
import '@fontsource/poppins/900.css';
import '../index.css';
import { Providers } from "./providers";

export const metadata = {
  metadataBase: new URL('https://rednewsbharat.live'),
  title: {
    default: 'RED NEWS BHARAT | देश का सबसे तेज हिंदी समाचार',
    template: '%s | RED NEWS BHARAT'
  },
  description: 'सत्य और साहस की पत्रकारिता। RED NEWS BHARAT पर पाएं ब्रेकिंग हिंदी न्यूज़, प्रादेशिक खबरें, राजनीति, योजनाएं और वायरल अपडेट्स सबसे तेज़।',
  icons: {
    icon: '/logo.webp',
    apple: '/logo.webp'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }
  },
  openGraph: {
    locale: 'hi_IN',
    siteName: 'RED NEWS BHARAT',
    type: 'website'
  },
  verification: {
    google: 'YOUR_GOOGLE_VERIFICATION_CODE',
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="hi-IN">
      <body className="font-sans antialiased bg-slate-50 text-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
