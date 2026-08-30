'use client';

import React from 'react';
import { Attraction, Currency } from '@/types/travel';
import { JPY_TO_THB_RATE } from '@/data/mockData';
import { X, Clock, Train, Heart, CheckCircle2, DollarSign, Star, Compass } from 'lucide-react';

interface AttractionModalProps {
  attraction: Attraction | null;
  onClose: () => void;
  currency: Currency;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
}

export const AttractionModal: React.FC<AttractionModalProps> = ({
  attraction,
  onClose,
  currency,
  isWishlisted,
  onToggleWishlist,
}) => {
  if (!attraction) return null;

  const displayPrice =
    attraction.priceJPY === 0
      ? 'ฟรี (Free Entry)'
      : currency === 'THB'
      ? `≈ ฿${Math.round(attraction.priceJPY * JPY_TO_THB_RATE).toLocaleString()} THB (${attraction.priceJPY.toLocaleString()} JPY)`
      : `¥${attraction.priceJPY.toLocaleString()} JPY`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Image Header */}
        <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
          <img
            src={attraction.imageUrl}
            alt={attraction.nameEn}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(15, 23, 42, 1) 0%, rgba(15, 23, 42, 0.2) 60%, rgba(0,0,0,0.5) 100%)',
            }}
          />

          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>

          <div style={{ position: 'absolute', bottom: '16px', left: '20px', right: '20px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-sakura">{attraction.city}</span>
              <span className="badge badge-cyan">{attraction.category}</span>
              <span className="badge badge-amber">
                <Star size={12} fill="#fbbf24" /> Must Visit {attraction.mustVisitScore}/100
              </span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
              {attraction.nameTh}
            </h2>
            <p style={{ fontSize: '13px', color: '#cbd5e1' }}>
              {attraction.nameEn} • {attraction.nameJp}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {/* Quick Metrics */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '12px',
              marginBottom: '20px',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> เวลาที่แนะนำ
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                {attraction.estimatedTimeHours} ชั่วโมง ({attraction.recommendedTimeOfDay})
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <DollarSign size={12} /> ค่าเข้าชม
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#38bdf8', marginTop: '4px' }}>
                {displayPrice}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Train size={12} /> สถานีใกล้สุด
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {attraction.nearestStation}
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              รายละเอียดสถานที่
            </h4>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#e2e8f0' }}>
              {attraction.descriptionTh}
            </p>
          </div>

          {/* Highlight */}
          <div
            style={{
              padding: '14px 16px',
              background: 'rgba(244, 63, 94, 0.08)',
              borderLeft: '3px solid var(--accent-pink)',
              borderRadius: '0 8px 8px 0',
              marginBottom: '20px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#fb7185', marginBottom: '4px' }}>
              ✨ จุดเด่นไฮไลท์ที่ไม่ควรพลาด:
            </div>
            <div style={{ fontSize: '13.5px', color: '#fff' }}>
              {attraction.highlightTh}
            </div>
          </div>

          {/* Practical Tips */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              💡 เคล็ดลับการเที่ยว & ข้อควรระวัง (Pro Tips)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {attraction.tipsTh.map((tip, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#cbd5e1' }}>
                  <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
            {attraction.tags.map((tag, idx) => (
              <span key={idx} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', fontSize: '12px', color: '#94a3b8' }}>
                #{tag}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => onToggleWishlist(attraction.id)}
              className={isWishlisted ? 'btn-secondary' : 'btn-primary'}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <Heart size={16} fill={isWishlisted ? '#f43f5e' : 'none'} color={isWishlisted ? '#f43f5e' : '#fff'} />
              <span>{isWishlisted ? 'ลบออกจาก Wishlist' : 'เพิ่มใน Wishlist ทริปนี้'}</span>
            </button>
            <button onClick={onClose} className="btn-secondary" style={{ padding: '10px 20px' }}>
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
