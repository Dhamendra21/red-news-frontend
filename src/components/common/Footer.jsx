"use client";
import React from 'react';
import Link from "next/link";
import { Send, Bell, Heart, Phone } from 'lucide-react';
import api from '../../services/api';
import { requestNotificationPermission } from '../../services/firebase';

/* ── Brand SVG Icons ── */
const FacebookIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const YoutubeIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const WhatsappIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const SOCIAL_LINKS = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/rednewsbharat',
    icon: <FacebookIcon size={17} />,
    hoverBg: '#1877F2',
    hoverBorder: '#1877F2',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/rednewsbharat?cplk=dTIycW1xNnJhbGgz',
    icon: <InstagramIcon size={17} />,
    hoverBg: '#E1306C',
    hoverBorder: '#E1306C',
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@RedNewsbharatpm',
    icon: <YoutubeIcon size={17} />,
    hoverBg: '#FF0000',
    hoverBorder: '#FF0000',
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/919201396145',
    icon: <WhatsappIcon size={17} />,
    hoverBg: '#25D366',
    hoverBorder: '#25D366',
  },
];

const FOOTER_CATEGORIES = [
  { id: 'politics',      name: 'राजनीति' },
  { id: 'local',         name: 'देश' },
  { id: 'international', name: 'विदेश' },
  { id: 'sports',        name: 'खेल' },
  { id: 'business',      name: 'व्यापार' },
  { id: 'technology',    name: 'टेक' },
  { id: 'entertainment', name: 'मनोरंजन' },
  { id: 'health',        name: 'स्वास्थ्य' },
  { id: 'other',         name: 'अन्य' },
];

const QUICK_LINKS = [
  { label: 'होम', path: '/' },
  { label: 'ट्रेंडिंग', path: '/trending' },
  { label: 'अपनी खबर भेजें', path: '/apni-khabar' },
  { label: 'संपादक पैनल', path: '/admin' },
  { label: 'हमारे बारे में', path: '/about' },
  { label: 'संपर्क करें', path: '/contact' },
  { label: 'गोपनीयता नीति', path: '/privacy' },
];

const linkStyle = {
  color: '#94A3B8',
  textDecoration: 'none',
  fontSize: 13,
  lineHeight: '1.8',
  display: 'block',
  transition: 'color 0.15s',
};

export default function Footer() {
  const handleNotification = async () => {
    try {
      const token = await requestNotificationPermission();
      if (token) {
        await api.post('/notifications/subscribe', { token });
        alert('सूचनाएं सक्रिय हो गई हैं!');
      } else {
        alert('सूचनाएं चालू करने के लिए अनुमति की आवश्यकता है।');
      }
    } catch (error) {
      console.error('Error activating notifications:', error);
      alert('कुछ गलत हो गया। कृपया बाद में प्रयास करें।');
    }
  };

  return (
    <footer style={{ background: '#0F172A', color: '#fff', marginTop: 48 }}>

      {/* ── Main footer content ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 32px' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* ── Col 1: Brand & Contact ── */}
          <div>
            {/* Logo */}
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <img src="/logo.webp" alt="RED NEWS BHARAT" style={{ height: 55, objectFit: 'contain' }} />
            </Link>

            <p style={{ color: '#64748B', fontSize: 13, lineHeight: 1.8, marginBottom: 18 }}>
              भारत का सबसे तेज़ और विश्वसनीय हिंदी समाचार पोर्टल। ताज़ा खबरें, राष्ट्रीय–अंतर्राष्ट्रीय समाचार और स्थानीय खबरें एक जगह।
            </p>

            {/* Social Icons (Facebook, Instagram, YouTube, WhatsApp) */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              {SOCIAL_LINKS.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  style={{
                    background: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: 8,
                    width: 38,
                    height: 38,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#CBD5E1',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = s.hoverBg;
                    e.currentTarget.style.borderColor = s.hoverBorder;
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = '#1E293B';
                    e.currentTarget.style.borderColor = '#334155';
                    e.currentTarget.style.color = '#CBD5E1';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>

            {/* Contact / Phone Numbers */}
            <div style={{ paddingTop: 16, borderTop: '1px solid #1E293B' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Phone size={13} style={{ color: '#DC2626' }} /> संपर्क सूत्र / WhatsApp:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <a
                  href="tel:+919201396145"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 9,
                    color: '#F1F5F9',
                    textDecoration: 'none',
                    fontSize: 13,
                    fontWeight: 600,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#F1F5F9'; e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  <span style={{ background: '#1E293B', width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #334155', color: '#DC2626' }}>
                    <Phone size={12} />
                  </span>
                  <span>+91 92013 96145</span>
                </a>

                <a
                  href="tel:+917489544706"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 9,
                    color: '#F1F5F9',
                    textDecoration: 'none',
                    fontSize: 13,
                    fontWeight: 600,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#DC2626'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#F1F5F9'; e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  <span style={{ background: '#1E293B', width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #334155', color: '#DC2626' }}>
                    <Phone size={12} />
                  </span>
                  <span>+91 74895 44706</span>
                </a>
              </div>
            </div>
          </div>

          {/* ── Col 2: Quick Links ── */}
          <div>
            <h4 style={{ fontWeight: 800, fontSize: 13, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16, paddingBottom: 10, borderBottom: '2px solid #DC2626', display: 'inline-block' }}>
              उपयोगी लिंक
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {QUICK_LINKS.map(link => (
                <li key={link.path}>
                  <Link href={link.path}
                    style={linkStyle}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
                  >
                    <span style={{ color: '#DC2626', marginRight: 6 }}>›</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 3: Categories ── */}
          <div>
            <h4 style={{ fontWeight: 800, fontSize: 13, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16, paddingBottom: 10, borderBottom: '2px solid #DC2626', display: 'inline-block' }}>
              समाचार वर्ग
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {FOOTER_CATEGORIES.map(cat => (
                <li key={cat.id}>
                  <Link href={`/category/${cat.id}`}
                    style={linkStyle}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
                  >
                    <span style={{ color: '#DC2626', marginRight: 6 }}>›</span>
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 4: Newsletter / Notifications ── */}
          <div>
            <h4 style={{ fontWeight: 800, fontSize: 13, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16, paddingBottom: 10, borderBottom: '2px solid #DC2626', display: 'inline-block' }}>
              सूचनाएं पाएं
            </h4>
            <p style={{ color: '#64748B', fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
              ताज़ा खबरों की सूचना सबसे पहले पाने के लिए सब्सक्राइब करें।
            </p>

            {/* Push notification button */}
            <button
              onClick={handleNotification}
              style={{
                background: '#DC2626',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '10px 16px',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                width: '100%',
                marginBottom: 16,
                transition: 'background 0.15s',
                letterSpacing: '0.02em',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#B91C1C'}
              onMouseLeave={e => e.currentTarget.style.background = '#DC2626'}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Bell size={16} /> सूचनाएं चालू करें</span>
            </button>

            {/* Newsletter email input */}
            <div style={{ display: 'flex', gap: 0, borderRadius: 6, overflow: 'hidden', border: '1px solid #334155' }}>
              <input
                type="email"
                placeholder="आपका ईमेल..."
                style={{
                  flex: 1, background: '#1E293B', border: 'none',
                  padding: '9px 12px', fontSize: 13, color: '#fff',
                  outline: 'none',
                }}
              />
              <button
                style={{
                  background: '#DC2626', color: '#fff', border: 'none',
                  padding: '9px 14px', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', flexShrink: 0,
                }}
              >
                सब्सक्राइब
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom copyright bar ── */}
      <div style={{ borderTop: '1px solid #1E293B', padding: '16px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, textAlign: 'center' }}>
          <p style={{ color: '#475569', fontSize: 12 }}>
            © {new Date().getFullYear()} <strong style={{ color: '#94A3B8' }}>RED NEWS BHARAT</strong>. सर्वाधिकार सुरक्षित।
          </p>
          <p style={{ color: '#334155', fontSize: 11 }}>
            Made with <Heart size={12} fill="#ef4444" color="#ef4444" style={{ display: 'inline' }} /> for भारत — निष्पक्ष, तेज़, विश्वसनीय पत्रकारिता
          </p>
        </div>
      </div>
    </footer>
  );
}
