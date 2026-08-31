'use client';

import React from 'react';
import { CommunityTripPlan, Currency } from '@/types/travel';
import { MONTHS_DATA, JPY_TO_THB_RATE } from '@/data/mockData';
import { 
  X, 
  User, 
  Calendar, 
  MapPin, 
  Plane, 
  Sparkles, 
  Clock, 
  Heart,
  DollarSign
} from 'lucide-react';

interface TripDetailModalProps {
  trip: CommunityTripPlan | null;
  onClose: () => void;
  currency: Currency;
}

export const TripDetailModal: React.FC<TripDetailModalProps> = ({
  trip,
  onClose,
  currency,
}) => {
  if (!trip) return null;

  const monthObj = MONTHS_DATA.find((m) => m.month === trip.target_month);
  const budgetTHB = trip.estimated_budget_thb || 38000;
  const budgetJPY = Math.round(budgetTHB / JPY_TO_THB_RATE);

  const displayBudget =
    currency === 'THB'
      ? `฿${budgetTHB.toLocaleString()} บาท`
      : `¥${budgetJPY.toLocaleString()} เยน`;

  const seasonEmoji = [3, 4].includes(trip.target_month) ? '🌸' : [10, 11].includes(trip.target_month) ? '🍁' : [12, 1, 2].includes(trip.target_month) ? '❄️' : '🌿';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', padding: '28px', background: 'var(--bg-surface)' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span className="editorial-tag tag-cyan" style={{ fontSize: '11.5px' }}>
                <User size={12} /> ผู้สร้าง: @{trip.creator_name}
              </span>
              <span className="editorial-tag tag-red" style={{ fontSize: '11.5px' }}>
                ⏱️ {trip.duration_days} วัน ({trip.duration_days - 1} คืน)
              </span>
              <span className="editorial-tag tag-gold" style={{ fontSize: '11.5px' }}>
                {seasonEmoji} {monthObj?.nameTh || `เดือน ${trip.target_month}`} {trip.target_year}
              </span>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', lineHeight: '1.3' }}>
              {trip.trip_title}
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-pill)',
              background: 'var(--bg-surface-raised)',
              border: '1px solid var(--border-hairline)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Specs Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px',
            padding: '16px',
            background: 'var(--bg-surface-raised)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-hairline)',
            marginBottom: '20px',
          }}
        >
          <div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
              ช่วงเวลาเดินทาง
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginTop: '3px' }}>
              {monthObj ? `${monthObj.nameTh} (${monthObj.seasonTh})` : `${trip.target_month}/${trip.target_year}`}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
              สายการบินเป้าหมาย
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--fuji-cyan)', marginTop: '3px' }}>
              {trip.selected_flight || 'Thai Airways / Direct'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
              งบประมาณโดยประมาณ
            </div>
            <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#34d399', marginTop: '3px' }}>
              {displayBudget}
            </div>
          </div>
        </div>

        {/* Destinations List */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '10px', fontWeight: 700 }}>
            📍 สถานที่ท่องเที่ยวในแพลนนี้ ({trip.destinations.length} แห่ง)
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {trip.destinations.map((dest, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  background: 'var(--bg-surface-raised)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-pill)',
                }}
              >
                <MapPin size={13} color="var(--vermilion)" />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{dest}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Notes */}
        {trip.custom_notes && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '6px', fontWeight: 700 }}>
              📝 บันทึกและคำแนะนำจากผู้สร้าง
            </div>
            <div
              style={{
                padding: '14px 18px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-hairline)',
                fontSize: '13.5px',
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
              }}
            >
              {trip.custom_notes}
            </div>
          </div>
        )}

        {/* Read-only Notice / Action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-hairline)' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
            ✨ เผยแพร่เมื่อ: {new Date(trip.created_at).toLocaleDateString('th-TH')}
          </span>

          <button onClick={onClose} className="btn-editorial-secondary" style={{ padding: '8px 24px', borderRadius: 'var(--radius-pill)' }}>
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
