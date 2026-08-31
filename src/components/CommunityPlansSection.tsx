'use client';

import React, { useState } from 'react';
import { CommunityTripPlan, Currency } from '@/types/travel';
import { MONTHS_DATA, JPY_TO_THB_RATE } from '@/data/mockData';
import { 
  Users, 
  MapPin, 
  Calendar, 
  Plus, 
  ArrowUpRight, 
  Sparkles, 
  Search, 
  Heart,
  User,
  Compass
} from 'lucide-react';

interface CommunityPlansSectionProps {
  plans: CommunityTripPlan[];
  onOpenCreateModal: () => void;
  onSelectTripForDetail: (trip: CommunityTripPlan) => void;
  currency: Currency;
}

export const CommunityPlansSection: React.FC<CommunityPlansSectionProps> = ({
  plans,
  onOpenCreateModal,
  onSelectTripForDetail,
  currency,
}) => {
  const [filterDuration, setFilterDuration] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [likedTripIds, setLikedTripIds] = useState<string[]>([]);

  const handleToggleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (likedTripIds.includes(id)) {
      setLikedTripIds(likedTripIds.filter((t) => t !== id));
    } else {
      setLikedTripIds([...likedTripIds, id]);
    }
  };

  const filteredPlans = plans.filter((p) => {
    if (filterDuration === 'short' && p.duration_days > 5) return false;
    if (filterDuration === 'medium' && (p.duration_days < 6 || p.duration_days > 8)) return false;
    if (filterDuration === 'long' && p.duration_days < 9) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const match =
        p.trip_title.toLowerCase().includes(q) ||
        p.creator_name.toLowerCase().includes(q) ||
        p.destinations.some((d) => d.toLowerCase().includes(q)) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const formatPrice = (thb?: number) => {
    if (!thb) return '-';
    if (currency === 'THB') return `฿${thb.toLocaleString()} บาท`;
    return `¥${Math.round(thb / JPY_TO_THB_RATE).toLocaleString()} เยน`;
  };

  const getMonthSeasonEmoji = (monthNum: number) => {
    if ([3, 4].includes(monthNum)) return '🌸';
    if ([10, 11].includes(monthNum)) return '🍁';
    if ([12, 1, 2].includes(monthNum)) return '❄️';
    return '🌿';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Section Header */}
      <div className="bento-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="editorial-tag tag-cyan">
                <Users size={12} /> ชุมชนนักเดินทาง (Community Feed)
              </span>
              <span className="editorial-tag tag-red">
                {plans.length} แพลนทั้งหมด
              </span>
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
              รวมไอเดียแพลนเที่ยวญี่ปุ่น 2027
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              ดูแพลนของคนอื่นเพื่อเก็บไอเดีย หรือกดสร้างแพลนของตัวเองได้ง่ายๆ
            </p>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="btn-editorial-primary"
          >
            <Plus size={16} />
            <span>+ สร้างแพลนใหม่</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div
          style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-hairline)',
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {/* Search */}
          <div style={{ flex: 1, minWidth: '240px', position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={15} color="var(--text-tertiary)" style={{ position: 'absolute', left: '14px' }} />
            <input
              type="text"
              placeholder="ค้นหาชื่อแพลน, ที่เที่ยว (เช่น ฟูจิ, ชิบูย่า, ซากุระ)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px 9px 38px',
                borderRadius: 'var(--radius-pill)',
                background: 'var(--bg-surface-raised)',
                border: '1px solid var(--border-hairline)',
                color: '#fff',
                fontSize: '13.5px',
                outline: 'none',
              }}
            />
          </div>

          {/* Lifestyle Duration Pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: '🔥 ทั้งหมด' },
              { id: 'short', label: '⚡ 3-5 วัน (วันลาน้อย)' },
              { id: 'medium', label: '🗼 6-8 วัน (โตเกียว+ฟูจิ)' },
              { id: 'long', label: '🚄 9+ วัน (ข้ามเมือง)' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterDuration(f.id)}
                className={`btn-editorial-secondary ${filterDuration === f.id ? 'active' : ''}`}
                style={{
                  padding: '7px 16px',
                  fontSize: '12.5px',
                  borderRadius: 'var(--radius-pill)',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Community Plans Grid */}
      {filteredPlans.length === 0 ? (
        <div
          className="bento-card"
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div style={{ fontSize: '36px' }}>🗾</div>
          <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
            ยังไม่มีแพลนท่องเที่ยวในระบบ
          </h4>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '480px', lineHeight: '1.6' }}>
            ร่วมเป็นคนแรกที่สร้างและแชร์แพลนท่องเที่ยวญี่ปุ่น 2027 ลงในชุมชน!
          </p>
          <button
            onClick={onOpenCreateModal}
            className="btn-editorial-primary"
            style={{ padding: '10px 24px', marginTop: '6px' }}
          >
            <Plus size={16} />
            <span>+ สร้างแพลนแรกของคุณ</span>
          </button>
        </div>
      ) : (
        <div className="grid-cols-2">
          {filteredPlans.map((plan) => {
            const monthObj = MONTHS_DATA.find((m) => m.month === plan.target_month);
            const seasonEmoji = getMonthSeasonEmoji(plan.target_month);
            const isLiked = likedTripIds.includes(plan.id);
            const likesCount = (plan.likes_count || 0) + (isLiked ? 1 : 0);

            return (
              <div
                key={plan.id}
                className="bento-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  padding: '24px',
                }}
                onClick={() => onSelectTripForDetail(plan)}
              >
                <div>
                  {/* Top Header with Traveler Badge & Like */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className="editorial-tag tag-cyan" style={{ fontSize: '11px' }}>
                        🎒 @{plan.creator_name}
                      </span>
                      <span className="editorial-tag tag-red" style={{ fontSize: '11px' }}>
                        ⏱️ {plan.duration_days} วัน
                      </span>
                      <span className="editorial-tag tag-gold" style={{ fontSize: '11px' }}>
                        {seasonEmoji} {monthObj?.nameTh || `เดือน ${plan.target_month}`} {plan.target_year}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleToggleLike(e, plan.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: isLiked ? 'rgba(255, 101, 132, 0.2)' : 'var(--bg-surface-raised)',
                        border: '1px solid',
                        borderColor: isLiked ? '#ff6584' : 'var(--border-hairline)',
                        borderRadius: 'var(--radius-pill)',
                        padding: '4px 10px',
                        color: isLiked ? '#ff6584' : 'var(--text-secondary)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Heart size={13} fill={isLiked ? '#ff6584' : 'none'} color={isLiked ? '#ff6584' : 'var(--text-secondary)'} />
                      <span>{likesCount}</span>
                    </button>
                  </div>

                  {/* Plan Title */}
                  <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', marginBottom: '8px', lineHeight: '1.4' }}>
                    {plan.trip_title}
                  </h4>

                  {/* Notes Preview */}
                  {plan.custom_notes && (
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {plan.custom_notes}
                    </p>
                  )}

                  {/* Destinations Pills */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginBottom: '6px', fontWeight: 600 }}>
                      สถานที่ในทริปนี้ ({plan.destinations.length} แห่ง):
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {plan.destinations.slice(0, 4).map((dest, idx) => (
                        <span
                          key={idx}
                          style={{
                            padding: '4px 10px',
                            background: 'var(--bg-surface-raised)',
                            border: '1px solid var(--border-hairline)',
                            borderRadius: 'var(--radius-pill)',
                            fontSize: '12px',
                            color: '#fff',
                          }}
                        >
                          📍 {dest}
                        </span>
                      ))}
                      {plan.destinations.length > 4 && (
                        <span style={{ padding: '4px 10px', fontSize: '12px', color: 'var(--fuji-cyan)', fontWeight: 600 }}>
                          +{plan.destinations.length - 4} อื่นๆ
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Specs & Action */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '14px',
                    borderTop: '1px solid var(--border-hairline)',
                    marginTop: '8px',
                  }}
                >
                  <div style={{ fontSize: '13px', color: '#34d399', fontWeight: 700 }}>
                    งบประมาณ: {formatPrice(plan.estimated_budget_thb)}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--vermilion)', fontSize: '12.5px', fontWeight: 700 }}>
                    <span>🚀 เปิด Dashboard แพลนนี้</span>
                    <ArrowUpRight size={15} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
