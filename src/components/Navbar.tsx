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
    <div style={{ marginBottom: '24px' }}>
      {/* Friendly Top Status Bar */}
      <div className="editorial-ticker">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 600 }}>
            <span>🌸</span>
            <span>ทริปญี่ปุ่น 2027</span>
          </span>
          <span style={{ color: 'var(--text-tertiary)' }}>•</span>
          <span style={{ color: 'var(--fuji-cyan)', fontWeight: 600 }}>
            เรทเงินเยน: 100 JPY ≈ 23.50 THB
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={13} color="var(--vermilion)" />
            <span>เวลาโตเกียว:</span>
            <strong style={{ color: '#fff' }}>{tokyoTime || '07:42:00'} JST</strong>
          </span>
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
              TOKYO TRIP 2027
              <span className="editorial-tag tag-red" style={{ fontSize: '11px' }}>
                🌸 Japan Vacation
              </span>
            </div>
            <div className="brand-subtext">
              <span>ชุมชนแบ่งปันและวางแผนเที่ยวญี่ปุ่นแบบเข้าใจง่าย</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Create Trip Plan Button */}
          <button
            onClick={onOpenCreateModal}
            className="btn-editorial-primary"
          >
            <Plus size={16} />
            <span>+ สร้างแพลนใหม่</span>
          </button>

          {/* Currency Toggle */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-surface-raised)',
              border: '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-pill)',
              padding: '3px',
            }}
          >
            <button
              onClick={() => setCurrency('THB')}
              style={{
                padding: '6px 14px',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                background: currency === 'THB' ? 'var(--vermilion)' : 'transparent',
                color: currency === 'THB' ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              ฿ บาท (THB)
            </button>
            <button
              onClick={() => setCurrency('JPY')}
              style={{
                padding: '6px 14px',
                border: 'none',
                borderRadius: 'var(--radius-pill)',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                background: currency === 'JPY' ? 'var(--vermilion)' : 'transparent',
                color: currency === 'JPY' ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.15s ease',
              }}
            >
              ¥ เยน (JPY)
            </button>
          </div>
        </div>
      </header>
    </div>
  );
};
