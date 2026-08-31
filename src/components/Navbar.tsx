'use client';

import React, { useState, useEffect } from 'react';
import { Currency, Language } from '@/types/travel';
import { useI18n } from '@/utils/i18n';
import { 
  Sparkles, 
  Clock, 
  Plus, 
  MapPin,
  Heart,
  Globe
} from 'lucide-react';

interface NavbarProps {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  onOpenCreateModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currency,
  setCurrency,
  language,
  setLanguage,
  onOpenCreateModal,
}) => {
  const [tokyoTime, setTokyoTime] = useState<string>('');
  const t = useI18n(language);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Tokyo',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      setTokyoTime(new Intl.DateTimeFormat('en-GB', options).format(now));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Friendly Top Status Bar */}
      <div className="editorial-ticker">
        <div className="ticker-left">
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 600 }}>
            <span>🌸</span>
            <span>{t.tripHeaderTag}</span>
          </span>
          <span style={{ color: 'var(--text-tertiary)' }}>•</span>
          <span style={{ color: 'var(--fuji-cyan)', fontWeight: 600 }}>
            {t.exchangeRate}
          </span>
        </div>

        <div className="ticker-right">
          <Clock size={13} color="var(--vermilion)" />
          <span>{t.tokyoTime}</span>
          <strong style={{ color: '#fff' }}>{tokyoTime || '07:42:00'} JST</strong>
        </div>
      </div>

      {/* Main Friendly Header */}
      <header className="editorial-header">
        <div className="brand-section">
          <div className="brand-stamp">
            <span>東</span>
            <span>2027</span>
          </div>
          <div>
            <div className="brand-heading">
              <span>{t.brandTitle}</span>
              <span className="editorial-tag tag-red hide-on-tiny" style={{ fontSize: '11px' }}>
                {t.brandTag}
              </span>
            </div>
            <div className="brand-subtext">
              <span>{t.brandSubtitle}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="navbar-actions">
          {/* Create Trip Plan Button */}
          <button
            onClick={onOpenCreateModal}
            className="btn-editorial-primary navbar-create-btn"
          >
            <Plus size={15} />
            <span>{t.createPlanBtn}</span>
          </button>

          <div className="navbar-toggle-group">
            {/* Language Switcher */}
            <div className="segmented-control">
              <button
                onClick={() => setLanguage('th')}
                className={`segmented-btn ${language === 'th' ? 'active' : ''}`}
                title="ภาษาไทย"
              >
                TH
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`segmented-btn ${language === 'en' ? 'active' : ''}`}
                title="English"
              >
                EN
              </button>
            </div>

            {/* Currency Toggle */}
            <div className="segmented-control">
              <button
                onClick={() => setCurrency('THB')}
                className={`segmented-btn ${currency === 'THB' ? 'active' : ''}`}
              >
                ฿ THB
              </button>
              <button
                onClick={() => setCurrency('JPY')}
                className={`segmented-btn ${currency === 'JPY' ? 'active' : ''}`}
              >
                ¥ JPY
              </button>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};
