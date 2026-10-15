'use client';

import React from 'react';
import { Language } from '@/types/travel';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  className?: string;
  showGlobe?: boolean;
}

// Crisp Vector SVG for Thailand Flag
export const ThaiFlag: React.FC<{ size?: number; className?: string }> = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={Math.round((size * 2) / 3)}
    viewBox="0 0 900 600"
    className={`flag-svg ${className}`}
    aria-hidden="true"
    style={{
      borderRadius: '2.5px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.4)',
      flexShrink: 0,
      display: 'inline-block',
      verticalAlign: 'middle',
    }}
  >
    <rect width="900" height="600" fill="#EF3340" />
    <rect y="100" width="900" height="400" fill="#FFFFFF" />
    <rect y="200" width="900" height="200" fill="#00205B" />
  </svg>
);

// Crisp Vector SVG for United Kingdom / English Flag
export const UKFlag: React.FC<{ size?: number; className?: string }> = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={Math.round((size * 2) / 3)}
    viewBox="0 0 60 36"
    className={`flag-svg ${className}`}
    aria-hidden="true"
    style={{
      borderRadius: '2.5px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.4)',
      flexShrink: 0,
      display: 'inline-block',
      verticalAlign: 'middle',
    }}
  >
    <clipPath id="uk-flag-clip">
      <rect width="60" height="36" rx="2.5" />
    </clipPath>
    <g clipPath="url(#uk-flag-clip)">
      <rect width="60" height="36" fill="#012169" />
      <path d="M0,0 L60,36 M60,0 L0,36" stroke="#ffffff" strokeWidth="6" />
      <path d="M0,0 L60,36 M60,0 L0,36" stroke="#C8102E" strokeWidth="2.5" />
      <path d="M30,0 v36 M0,18 h60" stroke="#ffffff" strokeWidth="10" />
      <path d="M30,0 v36 M0,18 h60" stroke="#C8102E" strokeWidth="6" />
    </g>
  </svg>
);

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  language,
  onLanguageChange,
  className = '',
  showGlobe = true,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent, targetLang: Language) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onLanguageChange(targetLang);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onLanguageChange('en');
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onLanguageChange('th');
    }
  };

  return (
    <div
      className={`lang-switcher-wrapper ${className}`}
      role="radiogroup"
      aria-label="Language selector / สลับภาษา"
    >
      {showGlobe && (
        <div className="lang-switcher-icon" title="Select Language / เลือกภาษา">
          <Globe size={13} className="lang-globe-icon" />
        </div>
      )}

      <div className="lang-switcher-track">
        {/* Animated Sliding Background Indicator */}
        <div
          className={`lang-indicator ${language === 'en' ? 'indicator-en' : 'indicator-th'}`}
          aria-hidden="true"
        />

        {/* Thai Language Option */}
        <button
          type="button"
          role="radio"
          aria-checked={language === 'th'}
          tabIndex={0}
          onClick={() => onLanguageChange('th')}
          onKeyDown={(e) => handleKeyDown(e, 'th')}
          className={`lang-option-btn ${language === 'th' ? 'is-active' : ''}`}
          title="สลับเป็นภาษาไทย (Thai)"
        >
          <ThaiFlag size={16} />
          <span className="lang-text">
            <span className="lang-primary-label">ไทย</span>
            <span className="lang-code-badge">TH</span>
          </span>
        </button>

        {/* English Language Option */}
        <button
          type="button"
          role="radio"
          aria-checked={language === 'en'}
          tabIndex={0}
          onClick={() => onLanguageChange('en')}
          onKeyDown={(e) => handleKeyDown(e, 'en')}
          className={`lang-option-btn ${language === 'en' ? 'is-active' : ''}`}
          title="Switch to English"
        >
          <UKFlag size={16} />
          <span className="lang-text">
            <span className="lang-primary-label">ENG</span>
            <span className="lang-code-badge">EN</span>
          </span>
        </button>
      </div>
    </div>
  );
};
