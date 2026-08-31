'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import type { Attraction, HotelOption, FlightOption } from '@/types/travel';

const TripMapInner = dynamic(() => import('./TripMapInner'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: '100%',
        height: '560px',
        borderRadius: '16px',
        background: 'var(--bg-surface-raised)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)',
        fontSize: '14px',
        gap: '8px',
      }}
    >
      <span style={{ fontSize: '24px' }}>🗺️</span>
      <span>กำลังโหลดแผนที่...</span>
    </div>
  ),
});

interface TripMapProps {
  hotel: HotelOption;
  selectedAttractions: Attraction[];
  allAttractions: Attraction[];
  selectedSpotIds: string[];
  flight?: FlightOption;
}

const TripMap: React.FC<TripMapProps> = (props) => {
  return <TripMapInner {...props} />;
};

export default TripMap;
