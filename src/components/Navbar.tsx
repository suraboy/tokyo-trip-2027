'use client';

import React from 'react';
import { TabType, Currency } from '@/types/travel';
import { 
  Sparkles, 
  Calendar, 
  Plane, 
  MapPin, 
  DollarSign, 
  Compass, 
  Heart,
  LayoutDashboard
} from 'lucide-react';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  wishlistCount: number;
  selectedMonthName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  wishlistCount,
  selectedMonthName,
}) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'overview', label: 'ภาพรวม (Overview)', icon: <LayoutDashboard size={18} /> },
    { id: 'dates', label: 'หาวันที่ดีที่สุด (Best Dates)', icon: <Calendar size={18} />, badge: selectedMonthName },
    { id: 'flights', label: 'ตั๋วเครื่องบิน (Flights)', icon: <Plane size={18} /> },
    { id: 'attractions', label: 'ที่เที่ยว (Attractions)', icon: <MapPin size={18} />, badge: wishlistCount > 0 ? `${wishlistCount} ที่` : undefined },
    { id: 'itinerary', label: 'แพลน & งบประมาณ (Budget)', icon: <DollarSign size={18} /> },
    { id: 'wayfinder', label: 'Wayfinder Roadmap', icon: <Compass size={18} />, badge: '5 Decisions' },
  ];

  return (
    <div>
      {/* Top Bar */}
      <header className="header-glass">
        <div className="brand-badge">
          <div className="brand-logo">
            <span>東</span>
          </div>
          <div>
            <div className="brand-title">
              TOKYO TRIP 2027
              <span className="badge badge-sakura" style={{ fontSize: '10px', padding: '2px 8px' }}>
                <Sparkles size={11} /> Next.js App
              </span>
            </div>
            <div className="brand-subtitle">
              Japan Travel Intelligence & Wayfinder Decision Planner
            </div>
          </div>
        </div>

        <div className="header-actions">
          {/* Wishlist quick status */}
          <button 
            onClick={() => setActiveTab('attractions')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '9999px',
              padding: '6px 14px',
              color: '#fb7185',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            <Heart size={14} fill={wishlistCount > 0 ? '#fb7185' : 'transparent'} />
            <span>Wishlist <strong>{wishlistCount}</strong> รายการ</span>
          </button>

          {/* Currency Switcher */}
          <div className="currency-toggle">
            <button
              className={`currency-btn ${currency === 'THB' ? 'active' : ''}`}
              onClick={() => setCurrency('THB')}
            >
              THB (฿)
            </button>
            <button
              className={`currency-btn ${currency === 'JPY' ? 'active' : ''}`}
              onClick={() => setCurrency('JPY')}
            >
              JPY (¥)
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="tab-bar">
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              className={`tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.icon}
              <span>{t.label}</span>
              {t.badge && (
                <span className="tab-btn-badge" style={{ 
                  background: isActive ? 'var(--accent-pink)' : 'rgba(255,255,255,0.1)',
                  color: '#fff'
                }}>
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
