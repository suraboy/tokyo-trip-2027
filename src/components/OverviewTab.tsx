'use client';

import React from 'react';
import { Currency, CommunityTripPlan } from '@/types/travel';
import { CommunityPlansSection } from '@/components/CommunityPlansSection';
import { 
  Sparkles, 
  Plus, 
  MapPin, 
  Calendar, 
  Users, 
  Heart,
  Compass
} from 'lucide-react';

interface OverviewTabProps {
  currency: Currency;
  communityPlans: CommunityTripPlan[];
  onOpenCreateModal: () => void;
  onSelectTripForDetail: (trip: CommunityTripPlan) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  currency,
  communityPlans,
  onOpenCreateModal,
  onSelectTripForDetail,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Cozy Onboarding Hero Banner */}
      <div
        className="bento-card"
        style={{
          padding: '36px 32px',
          background: 'linear-gradient(135deg, rgba(255, 101, 132, 0.08) 0%, rgba(56, 189, 248, 0.06) 100%), var(--bg-surface)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="bento-card-kanji-bg">東京</div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '780px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <span className="editorial-tag tag-red">
              <Sparkles size={12} /> วางแผนเที่ยวญี่ปุ่น 2027
            </span>
            <span className="editorial-tag tag-cyan">
              🗾 โตเกียว • ฟูจิ • คันไซ
            </span>
            <span className="editorial-tag tag-green">
              ✨ มี {communityPlans.length} แพลนในระบบ
            </span>
          </div>

          <h1 className="hero-title">
            สร้างแพลนท่องเที่ยวของคุณง่ายๆ <br />
            <span style={{ color: 'var(--vermilion)' }}>
              และค้นหาแรงบันดาลใจจากเพื่อนๆ ในชุมชน
            </span>
          </h1>

          <p className="hero-desc">
            อยากไปเที่ยวญี่ปุ่นกี่วัน? ไปช่วงซากุระหรือใบไม้เปลี่ยนสี? 
            ปักหมุดสถานที่ที่คุณอยากไป แล้วสร้างแพลนสวยๆ แชร์ให้เพื่อนหรือครอบครัวดูได้ทันที
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={onOpenCreateModal} className="btn-editorial-primary" style={{ padding: '11px 22px', fontSize: '13.5px' }}>
              <Plus size={16} />
              <span>+ เริ่มสร้างแพลนเที่ยวของคุณ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Community Expeditions & User Trip Plans Feed */}
      <CommunityPlansSection
        plans={communityPlans}
        onOpenCreateModal={onOpenCreateModal}
        onSelectTripForDetail={onSelectTripForDetail}
        currency={currency}
      />
    </div>
  );
};
