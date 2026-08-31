'use client';

import React from 'react';
import { Currency, Language, CommunityTripPlan } from '@/types/travel';
import { CommunityPlansSection } from '@/components/CommunityPlansSection';
import { useI18n } from '@/utils/i18n';
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
  language: Language;
  communityPlans: CommunityTripPlan[];
  onOpenCreateModal: () => void;
  onSelectTripForDetail: (trip: CommunityTripPlan) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  currency,
  language,
  communityPlans,
  onOpenCreateModal,
  onSelectTripForDetail,
}) => {
  const t = useI18n(language);

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
              <Sparkles size={12} /> {t.heroTag1}
            </span>
            <span className="editorial-tag tag-cyan">
              {t.heroTag2}
            </span>
            <span className="editorial-tag tag-green">
              ✨ {t.heroTag3(communityPlans.length)}
            </span>
          </div>

          <h1 className="hero-title">
            {t.heroTitleLine1} <br />
            <span style={{ color: 'var(--vermilion)' }}>
              {t.heroTitleLine2}
            </span>
          </h1>

          <p className="hero-desc">
            {t.heroDesc}
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={onOpenCreateModal} className="btn-editorial-primary" style={{ padding: '11px 22px', fontSize: '13.5px' }}>
              <Plus size={16} />
              <span>{t.heroCta}</span>
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
        language={language}
      />
    </div>
  );
};
