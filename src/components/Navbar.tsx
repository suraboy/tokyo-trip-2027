'use client';

import React, { useState, useEffect } from 'react';
import { Currency } from '@/types/travel';
import { 
  Sparkles, 
  Clock, 
  Plus, 
  MapPin,
  Heart
} from 'lucide-react';

interface NavbarProps {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  onOpenCreateModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currency,
  setCurrency,
  onOpenCreateModal,
}) => {
  const [tokyoTime, setTokyoTime] = useState<string>('');

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
            <span>ทริปญี่ปุ่น 2027</span>
          </span>
          <span style={{ color: 'var(--text-tertiary)' }}>•</span>
          <span style={{ color: 'var(--fuji-cyan)', fontWeight: 600 }}>
            เรทเงินเยน: 100 JPY ≈ 23.50 THB
          </span>
        </div>

        <div className="ticker-right">
          <Clock size={13} color="var(--vermilion)" />
          <span>เวลาโตเกียว:</span>
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
              <span>TOKYO TRIP 2027</span>
              <span className="editorial-tag tag-red hide-on-tiny" style={{ fontSize: '11px' }}>
                🌸 Japan Vacation
              </span>
            </div>
            <div className="brand-subtext">
              <span>ชุมชนแบ่งปันและวางแผนเที่ยวญี่ปุ่นแบบเข้าใจง่าย</span>
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
            <span>+ สร้างแพลนใหม่</span>
          </button>

          {/* Currency Toggle */}
          <div className="navbar-currency-toggle">
            <button
              onClick={() => setCurrency('THB')}
              className={`currency-btn ${currency === 'THB' ? 'active' : ''}`}
            >
              ฿ THB
            </button>
            <button
              onClick={() => setCurrency('JPY')}
              className={`currency-btn ${currency === 'JPY' ? 'active' : ''}`}
            >
              ¥ JPY
            </button>
          </div>
        </div>
      </header>
    </div>
  );
};
