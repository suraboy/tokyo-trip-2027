'use client';

import React from 'react';
import { Attraction, Currency } from '@/types/travel';
import { JPY_TO_THB_RATE } from '@/data/mockData';
import { X, Clock, Train, Heart, CheckCircle2, DollarSign, Star } from 'lucide-react';

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
      ? 'FREE ENTRY'
      : currency === 'THB'
      ? `฿${Math.round(attraction.priceJPY * JPY_TO_THB_RATE).toLocaleString()} THB (¥${attraction.priceJPY.toLocaleString()})`
      : `¥${attraction.priceJPY.toLocaleString()} JPY`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header Photo */}
        <div style={{ position: 'relative', height: '260px', overflow: 'hidden' }}>
          <img
            src={attraction.imageUrl}
            alt={attraction.nameEn}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, #0d1118 0%, rgba(13, 17, 24, 0.3) 60%, rgba(0,0,0,0.6) 100%)',
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
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(0, 0, 0, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>

          <div style={{ position: 'absolute', bottom: '16px', left: '20px', right: '20px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <span className="editorial-tag tag-red">{attraction.city}</span>
              <span className="editorial-tag tag-cyan">{attraction.category}</span>
              <span className="editorial-tag tag-gold">
                <Star size={11} fill="#facc15" /> MUST VISIT {attraction.mustVisitScore}/100
              </span>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>
              {attraction.nameTh}
            </h2>
            <p style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
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
              padding: '12px 16px',
              background: 'var(--bg-surface-raised)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-hairline)',
              marginBottom: '20px',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
                [EST. DURATION]
              </div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginTop: '3px' }}>
                {attraction.estimatedTimeHours}H ({attraction.recommendedTimeOfDay})
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
                [ENTRANCE FEE]
              </div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--fuji-cyan)', marginTop: '3px', fontFamily: 'var(--font-mono)' }}>
                {displayPrice}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
                [NEAREST METRO]
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {attraction.nearestStation}
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '6px' }}>
              // PLACE OVERVIEW
            </div>
            <p style={{ fontSize: '13.5px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
              {attraction.descriptionTh}
            </p>
          </div>

          {/* Highlight Callout */}
          <div
            style={{
              padding: '14px 18px',
              background: 'rgba(255, 42, 95, 0.08)',
              borderLeft: '3px solid var(--vermilion)',
              borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
              marginBottom: '20px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#ff4d79', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
              ★ KEY HIGHLIGHT:
            </div>
            <div style={{ fontSize: '13.5px', color: '#fff' }}>
              {attraction.highlightTh}
            </div>
          </div>

          {/* Pro Tips */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '10px' }}>
              // EXPEDITION PROTOCOLS & PRO TIPS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {attraction.tipsTh.map((tip, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={15} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => onToggleWishlist(attraction.id)}
              className={isWishlisted ? 'btn-editorial-secondary' : 'btn-editorial-primary'}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <Heart size={16} fill={isWishlisted ? 'var(--vermilion)' : 'none'} color={isWishlisted ? 'var(--vermilion)' : '#fff'} />
              <span>{isWishlisted ? 'ลบออกจาก WISHLIST' : 'เพิ่มใน WISHLIST ทริปนี้'}</span>
            </button>
            <button onClick={onClose} className="btn-editorial-secondary" style={{ padding: '10px 20px' }}>
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
