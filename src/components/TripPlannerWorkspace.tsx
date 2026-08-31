'use client';

import React, { useState } from 'react';
import { Attraction, FlightOption, HotelOption, Currency, CommunityTripPlan } from '@/types/travel';
import { ATTRACTIONS_DATA, FLIGHT_OPTIONS, HOTEL_OPTIONS, JPY_TO_THB_RATE, calculateTransitFromHotel } from '@/data/mockData';
import {
  ArrowLeft,
  MapPin,
  Hotel,
  Plane,
  Check,
  Plus,
  Navigation,
  Train,
  ExternalLink,
  Save,
  Search,
  Map,
  Sparkles
} from 'lucide-react';
import TripMap from './TripMap';

interface TripPlannerWorkspaceProps {
  tripTitle: string;
  creatorName: string;
  currency: Currency;
  initialPlan?: CommunityTripPlan | null;
  onBackToHome: () => void;
  onSaveTrip: (plan: Partial<CommunityTripPlan>) => Promise<void>;
}

export const TripPlannerWorkspace: React.FC<TripPlannerWorkspaceProps> = ({
  tripTitle,
  creatorName,
  currency,
  initialPlan,
  onBackToHome,
  onSaveTrip,
}) => {
  const [activeSection, setActiveSection] = useState<'attractions' | 'map' | 'hotels' | 'flights'>('hotels');
  
  // Resolve initial spot IDs from plan destinations
  const resolveInitialSpots = (): string[] => {
    if (!initialPlan || !initialPlan.destinations || initialPlan.destinations.length === 0) {
      return ['shibuya-sky', 'fuji-kawaguchiko', 'sensoji-asakusa', 'teamlab-planets', 'kamakura-enoshima'];
    }
    const matchedIds: string[] = [];
    initialPlan.destinations.forEach((destName) => {
      const found = ATTRACTIONS_DATA.find(
        (a) =>
          a.id === destName ||
          a.nameTh.toLowerCase().includes(destName.toLowerCase()) ||
          destName.toLowerCase().includes(a.nameTh.toLowerCase().split('(')[0].trim()) ||
          a.nameEn.toLowerCase().includes(destName.toLowerCase())
      );
      if (found) {
        matchedIds.push(found.id);
      }
    });
    return matchedIds.length > 0 ? matchedIds : ['shibuya-sky', 'fuji-kawaguchiko', 'sensoji-asakusa'];
  };

  const [selectedSpotIds, setSelectedSpotIds] = useState<string[]>(resolveInitialSpots);
  const [selectedHotelId, setSelectedHotelId] = useState<string>(() => {
    if (initialPlan?.selected_hotel_id) return initialPlan.selected_hotel_id;
    if (initialPlan?.hotel_area) {
      const found = HOTEL_OPTIONS.find((h) => h.area.toLowerCase() === initialPlan.hotel_area?.toLowerCase());
      if (found) return found.id;
    }
    return 'hotel-gracery-shinjuku';
  });
  const [selectedFlightId, setSelectedFlightId] = useState<string>(() => {
    if (initialPlan?.selected_flight) {
      const found = FLIGHT_OPTIONS.find((f) => initialPlan.selected_flight?.includes(f.airline) || initialPlan.selected_flight?.includes(f.flightNumber));
      if (found) return found.id;
    }
    return 'airasia-xj600';
  });
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [attractionFilter, setAttractionFilter] = useState<'all' | 'tokyo' | 'nearby'>('all');
  const [hotelAreaFilter, setHotelAreaFilter] = useState<string>('all');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const selectedHotel = HOTEL_OPTIONS.find((h) => h.id === selectedHotelId) || HOTEL_OPTIONS[0];
  const selectedFlight = FLIGHT_OPTIONS.find((f) => f.id === selectedFlightId) || FLIGHT_OPTIONS[0];

  const formatPrice = (thb: number) => {
    if (currency === 'THB') return `฿${thb.toLocaleString()} บาท`;
    return `¥${Math.round(thb / JPY_TO_THB_RATE).toLocaleString()} เยน`;
  };

  const toggleSpot = (id: string) => {
    if (selectedSpotIds.includes(id)) {
      setSelectedSpotIds(selectedSpotIds.filter((s) => s !== id));
    } else {
      setSelectedSpotIds([...selectedSpotIds, id]);
    }
  };

  const filteredAttractions = ATTRACTIONS_DATA.filter((spot) => {
    // Search query matching
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchText = `${spot.nameTh} ${spot.nameEn} ${spot.nameJp} ${spot.area} ${spot.city} ${spot.nearestStation} ${spot.tags.join(' ')}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    // Category Filter
    if (attractionFilter === 'nearby') {
      return (
        spot.isNearTokyo ||
        ['Fuji/Hakone', 'Kamakura', 'Yokohama', 'Nikko', 'Kanagawa', 'Tochigi', 'Yamanashi', 'Saitama'].includes(spot.city) ||
        ['Yamanashi', 'Kanagawa', 'Tochigi', 'Saitama'].includes(spot.area) ||
        spot.tags.includes('Day Trip')
      );
    }
    if (attractionFilter === 'tokyo') {
      return spot.city === 'Tokyo' && !spot.tags.includes('Day Trip') && !spot.isNearTokyo;
    }
    return true;
  });

  const filteredHotels = HOTEL_OPTIONS.filter((h) => {
    if (hotelAreaFilter === 'all') return true;
    return h.area.toLowerCase() === hotelAreaFilter.toLowerCase();
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const selectedSpots = ATTRACTIONS_DATA.filter((a) => selectedSpotIds.includes(a.id)).map((a) => a.nameTh.split('(')[0].trim());
      await onSaveTrip({
        id: initialPlan?.id,
        trip_title: tripTitle,
        creator_name: creatorName,
        target_year: 2027,
        target_month: 11,
        duration_days: 7,
        destinations: selectedSpots,
        selected_flight: `${selectedFlight.airline} (${selectedFlight.flightNumber})`,
        selected_hotel_id: selectedHotel.id,
        hotel_area: selectedHotel.area,
        estimated_budget_thb: selectedFlight.basePriceTHB + (selectedHotel.pricePerNightTHB * 6) + 15000,
        tags: [`7 วัน`, selectedHotel.area, 'Custom Workspace'],
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getGoogleMapsSearchUrl = (query: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Workspace Top Bar */}
      <div
        className="bento-card"
        style={{
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          background: 'linear-gradient(135deg, rgba(255, 101, 132, 0.08) 0%, rgba(56, 189, 248, 0.06) 100%), var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={onBackToHome}
            className="btn-editorial-secondary"
            style={{ padding: '8px 16px', fontSize: '13px' }}
            aria-label="Back to home"
          >
            <ArrowLeft size={16} />
            <span>กลับหน้าหลัก</span>
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <span className="editorial-tag tag-red" style={{ fontSize: '11.5px' }}>
                🎒 @{creatorName}
              </span>
              <span className="editorial-tag tag-cyan" style={{ fontSize: '11.5px' }}>
                📍 {selectedSpotIds.length} สถานที่ในทริป
              </span>
              <span className="editorial-tag tag-green" style={{ fontSize: '11.5px' }}>
                🏨 ฐานที่พัก: {selectedHotel.areaTh.split('(')[0]}
              </span>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
              {tripTitle}
            </h2>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="btn-editorial-primary"
          style={{ padding: '10px 22px', fontSize: '13.5px' }}
          aria-label="Save trip plan to database"
        >
          <Save size={16} />
          <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกแผนทริปลงระบบ'}</span>
        </button>
      </div>

      {/* Navigation Tabs Bar */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          background: 'var(--bg-surface)',
          padding: '8px',
          borderRadius: 'var(--radius-pill)',
          border: '1px solid var(--border-hairline)',
          flexWrap: 'wrap',
        }}
      >
        {[
          { id: 'hotels', label: '1. เลือกที่พักราคาดีที่สุด', icon: <Hotel size={16} />, badge: selectedHotel.area },
          { id: 'flights', label: '2. เที่ยวบินราคาดีที่สุด', icon: <Plane size={16} />, badge: formatPrice(selectedFlight.basePriceTHB) },
          { id: 'attractions', label: '3. สถานที่ท่องเที่ยว & ใกล้โตเกียว', icon: <MapPin size={16} />, badge: `${selectedSpotIds.length}` },
          { id: 'map', label: '4. แผนที่ & ระยะทาง', icon: <Navigation size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13.5px',
              fontWeight: 700,
              fontFamily: 'var(--font-sans)',
              background: activeSection === tab.id ? 'var(--vermilion)' : 'transparent',
              color: activeSection === tab.id ? '#fff' : 'var(--text-secondary)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge && (
              <span
                style={{
                  background: activeSection === tab.id ? 'rgba(255,255,255,0.25)' : 'var(--bg-surface-raised)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '11.5px',
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: ATTRACTIONS & GOOGLE MAPS SEARCH */}
      {/* ========================================================================= */}
      {activeSection === 'attractions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Search & Filter Bar */}
          <div className="bento-card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Map size={20} color="var(--vermilion)" />
                    <span>สถานที่ท่องเที่ยวในโตเกียว และรอบนอก (Day Trips)</span>
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    ค้นหาที่เที่ยว ดูพิกัดบน Google Maps และกด `+ เพิ่มในทริป` เพื่อคำนวณการเดินทางอัตโนมัติ
                  </p>
                </div>

                {/* Filter Pills */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'all', label: '🌟 ทั้งหมด' },
                    { id: 'tokyo', label: '🗼 ในโตเกียว' },
                    { id: 'nearby', label: '🗻 ใกล้โตเกียว (< 2 ชม.)' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setAttractionFilter(f.id as any)}
                      className={`btn-editorial-secondary ${attractionFilter === f.id ? 'active' : ''}`}
                      style={{ padding: '7px 16px', fontSize: '12.5px' }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Google Maps Search Bar */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
                  <Search
                    size={17}
                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }}
                  />
                  <input
                    type="text"
                    placeholder="🔍 ค้นหาที่เที่ยว, ย่าน, สถานีรถไฟ หรือชื่อสถานที่บน Google Maps..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 16px 11px 40px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'var(--bg-surface-raised)',
                      border: '1px solid var(--border-subtle)',
                      color: '#fff',
                      fontSize: '13.5px',
                      outline: 'none',
                    }}
                  />
                </div>

                {searchQuery.trim() && (
                  <a
                    href={getGoogleMapsSearchUrl(`${searchQuery} Tokyo Japan`)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-editorial-secondary"
                    style={{ padding: '9px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <ExternalLink size={14} />
                    <span>ค้นหา &quot;{searchQuery}&quot; บน Google Maps</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Attractions Grid */}
          <div className="grid-cols-2">
            {filteredAttractions.map((spot) => {
              const isSelected = selectedSpotIds.includes(spot.id);
              const transit = calculateTransitFromHotel(selectedHotel.area, spot.area, spot.nameTh);
              const gmapsUrl = getGoogleMapsSearchUrl(`${spot.nameEn} ${spot.nameJp || ''} ${spot.city} Japan`);

              return (
                <div
                  key={spot.id}
                  className="bento-card"
                  style={{
                    padding: '0',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    border: isSelected ? '1.5px solid var(--vermilion)' : '1px solid var(--border-hairline)',
                    background: isSelected ? 'linear-gradient(180deg, rgba(255, 101, 132, 0.05) 0%, var(--bg-surface) 100%)' : 'var(--bg-surface)',
                  }}
                >
                  {/* Photo Header */}
                  <div style={{ position: 'relative', height: '180px', width: '100%' }}>
                    <img
                      src={spot.imageUrl}
                      alt={spot.nameTh}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(12,16,23,0.92) 0%, rgba(12,16,23,0.2) 60%, transparent 100%)' }} />

                    {/* Top Tags */}
                    <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                      <span className="editorial-tag tag-cyan" style={{ fontSize: '11px' }}>
                        📍 {spot.area}
                      </span>
                      {(spot.isNearTokyo || spot.tags.includes('Day Trip')) && (
                        <span className="editorial-tag tag-gold" style={{ fontSize: '11px' }}>
                          🗻 ใกล้โตเกียว
                        </span>
                      )}
                    </div>

                    {/* Must Visit Score */}
                    <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                      <span className="editorial-tag tag-green" style={{ fontSize: '11.5px', fontWeight: 800 }}>
                        ⭐ {spot.mustVisitScore}/100
                      </span>
                    </div>

                    {/* Spot Title inside banner */}
                    <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px' }}>
                      <h4 style={{ fontSize: '17.5px', fontWeight: 800, color: '#fff', lineHeight: '1.3' }}>
                        {spot.nameTh}
                      </h4>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {spot.nameEn} {spot.nameJp && `• ${spot.nameJp}`}
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '12px' }}>
                        {spot.descriptionTh}
                      </p>

                      {/* Transit Info from current Hotel */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 14px',
                          background: 'var(--bg-surface-raised)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '12.5px',
                          border: '1px solid var(--border-hairline)',
                        }}
                      >
                        <Train size={15} color="var(--fuji-cyan)" />
                        <span style={{ color: 'var(--text-primary)' }}>
                          จากที่พัก ({selectedHotel.area}): <strong style={{ color: 'var(--fuji-cyan)' }}>~{transit.minutes} นาที</strong>
                        </span>
                        <span style={{ color: 'var(--text-tertiary)', fontSize: '11.5px' }}>
                          ({transit.trainLine})
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-hairline)', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <a
                          href={gmapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '12px',
                            color: '#38bdf8',
                            textDecoration: 'none',
                            background: 'rgba(56, 189, 248, 0.12)',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-pill)',
                            fontWeight: 600,
                          }}
                        >
                          <MapPin size={12} />
                          <span>ดูบน Google Maps</span>
                          <ExternalLink size={11} />
                        </a>
                      </div>

                      <button
                        onClick={() => toggleSpot(spot.id)}
                        className={isSelected ? 'btn-editorial-primary' : 'btn-editorial-secondary'}
                        style={{
                          padding: '7px 18px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          background: isSelected ? '#10b981' : undefined,
                          boxShadow: isSelected ? '0 4px 14px rgba(16, 185, 129, 0.35)' : undefined,
                        }}
                      >
                        {isSelected ? (
                          <>
                            <Check size={14} />
                            <span>อยู่ในทริปแล้ว</span>
                          </>
                        ) : (
                          <>
                            <Plus size={14} />
                            <span>+ เพิ่มในทริป</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: MAP & TRANSIT MATRIX */}
      {/* ========================================================================= */}
      {activeSection === 'map' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Selected Hotel Banner */}
          <div className="bento-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <span className="editorial-tag tag-cyan" style={{ marginBottom: '8px' }}>
                  🏨 จุดเริ่มต้นการเดินทาง (HOTEL BASE)
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>
                  {selectedHotel.nameTh} ({selectedHotel.areaTh})
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  🚇 สถานีที่ใกล้ที่สุด: {selectedHotel.nearestStation} (เดิน {selectedHotel.walkMinutesToStation} นาที)
                </p>
              </div>

              {/* Area Quick Switcher */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['Shinjuku', 'Ueno', 'Asakusa', 'Shibuya', 'Ginza'].map((area) => {
                  const hotelInArea = HOTEL_OPTIONS.find((h) => h.area === area);
                  return (
                    <button
                      key={area}
                      onClick={() => {
                        if (hotelInArea) setSelectedHotelId(hotelInArea.id);
                      }}
                      className={`btn-editorial-secondary ${selectedHotel.area === area ? 'active' : ''}`}
                      style={{ padding: '6px 14px', fontSize: '12.5px' }}
                    >
                      {area}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Transit Distance Table */}
          <div className="bento-card" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', marginBottom: '14px' }}>
              🗺️ แผนที่ระยะทางและเวลาเดินทางจากที่พักไปยังสถานที่ที่เลือก ({selectedSpotIds.length} แห่ง)
            </h4>

            {/* Interactive Leaflet Map */}
            <TripMap
              hotel={selectedHotel}
              selectedAttractions={ATTRACTIONS_DATA.filter((a) => selectedSpotIds.includes(a.id))}
              allAttractions={ATTRACTIONS_DATA.filter((a) => selectedSpotIds.includes(a.id))}
              selectedSpotIds={selectedSpotIds}
            />

            {/* Distance Legend */}
            <div style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              marginTop: '14px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}>
              <span>🏨 = โรงแรมที่เลือก</span>
              <span style={{ color: '#10b981' }}>● = สถานที่ในทริป</span>
              <span style={{ color: '#ff6584' }}>--- = เส้นทางระยะทาง</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {selectedSpotIds.map((spotId) => {
                const spot = ATTRACTIONS_DATA.find((a) => a.id === spotId);
                if (!spot) return null;
                const transit = calculateTransitFromHotel(selectedHotel.area, spot.area, spot.nameTh);
                const gmapsUrl = getGoogleMapsSearchUrl(`${spot.nameEn} ${spot.nameJp || ''} ${spot.city} Japan`);

                return (
                  <div
                    key={spot.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.4fr 1fr 1.6fr 0.8fr',
                      gap: '14px',
                      alignItems: 'center',
                      padding: '14px 18px',
                      background: 'var(--bg-surface-raised)',
                      border: '1px solid var(--border-hairline)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>📍 {spot.nameTh}</span>
                        <a href={gmapsUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--fuji-cyan)', display: 'inline-flex' }}>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                        {spot.area} • ใกล้ {spot.nearestStation}
                      </div>
                    </div>

                    <div>
                      <span className="editorial-tag tag-red" style={{ fontSize: '12px', fontWeight: 700 }}>
                        ⏱️ ~{transit.minutes} นาที
                      </span>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginTop: '3px' }}>
                        ระยะทาง: ~{transit.distanceKm} กม.
                      </div>
                    </div>

                    <div style={{ fontSize: '12.5px', color: 'var(--fuji-cyan)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Train size={14} />
                      <span>{transit.trainLine}</span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span className="editorial-tag tag-green" style={{ fontSize: '11px' }}>
                        สะดวก {transit.convenienceScore}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: HOTELS & STAYS SELECTOR */}
      {/* ========================================================================= */}
      {activeSection === 'hotels' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Header & Area Filter */}
          <div className="bento-card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
                  โรงแรมและที่พักแนะนำ (ดึงราคาที่ดีที่สุดจาก Agoda / Booking / Trip.com)
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  เลือกย่านที่พักที่เหมาะกับสไตล์การเดินทางของคุณ หรือเลือกโรงแรมราคาคุ้มค่าที่สุด
                </p>
              </div>

              {/* Area Filters */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: 'ทั้งหมด' },
                  { id: 'shinjuku', label: 'ชินจูกุ (ยอดฮิต)' },
                  { id: 'ueno', label: 'อุเอโนะ (นาริตะง่าย)' },
                  { id: 'asakusa', label: 'อาซากุสะ' },
                  { id: 'shibuya', label: 'ชิบูย่า' },
                  { id: 'ginza', label: 'กินซ่า' },
                  { id: 'kawaguchiko', label: 'ฟูจิ/ออนเซ็น' },
                ].map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setHotelAreaFilter(a.id)}
                    className={`btn-editorial-secondary ${hotelAreaFilter === a.id ? 'active' : ''}`}
                    style={{ padding: '6px 14px', fontSize: '12px' }}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hotels Grid */}
          <div className="grid-cols-2">
            {filteredHotels.map((hotel) => {
              const isSelected = selectedHotelId === hotel.id;

              return (
                <div
                  key={hotel.id}
                  className="bento-card"
                  style={{
                    padding: '0',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    border: isSelected ? '2px solid #34d399' : '1px solid var(--border-hairline)',
                    background: isSelected ? 'linear-gradient(180deg, rgba(52, 211, 153, 0.08) 0%, var(--bg-surface) 100%)' : 'var(--bg-surface)',
                  }}
                >
                  <div style={{ position: 'relative', height: '160px', width: '100%' }}>
                    <img
                      src={hotel.imageUrl}
                      alt={hotel.nameTh}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(12,16,23,0.9) 0%, transparent 60%)' }} />

                    {/* Badge */}
                    <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                      <span className="editorial-tag tag-gold" style={{ fontSize: '11px' }}>
                        ⭐ {hotel.tagBadge}
                      </span>
                      <span className="editorial-tag tag-cyan" style={{ fontSize: '11px' }}>
                        {hotel.areaTh.split('(')[0]}
                      </span>
                    </div>

                    {/* Booking Source Deal */}
                    <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                      <span className="editorial-tag tag-green" style={{ fontSize: '11px', fontWeight: 800 }}>
                        {hotel.bookingSource}
                      </span>
                    </div>

                    <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px' }}>
                      <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#fff' }}>
                        {hotel.nameTh}
                      </h4>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {hotel.nameEn}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      {/* Highlights */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                        {hotel.highlights.map((h, i) => (
                          <span
                            key={i}
                            style={{
                              padding: '3px 8px',
                              background: 'var(--bg-surface-raised)',
                              borderRadius: 'var(--radius-xs)',
                              fontSize: '11.5px',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            ✓ {h}
                          </span>
                        ))}
                      </div>

                      <div style={{ fontSize: '12.5px', color: 'var(--text-tertiary)' }}>
                        🚇 {hotel.nearestStation} (เดิน {hotel.walkMinutesToStation} นาที)
                      </div>
                    </div>

                    {/* Price & Select Button */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-hairline)' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>ราคาต่อคืน (รวมภาษี)</div>
                        <div style={{ fontSize: '17px', fontWeight: 800, color: '#34d399' }}>
                          {formatPrice(hotel.pricePerNightTHB)} / คืน
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedHotelId(hotel.id)}
                        className={isSelected ? 'btn-editorial-primary' : 'btn-editorial-secondary'}
                        style={{ padding: '8px 18px', fontSize: '12.5px' }}
                      >
                        {isSelected ? '✓ เลือกโรงแรมนี้' : 'เลือกโรงแรมนี้'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: BEST FLIGHTS AGGREGATOR */}
      {/* ========================================================================= */}
      {activeSection === 'flights' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Header */}
          <div className="bento-card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
                  เปรียบเทียบตั๋วเครื่องบินกรุงเทพฯ - โตเกียว (ดึงราคาที่ดีที่สุด)
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  เปรียบเทียบเที่ยวบิน Full Service (รวมกระเป๋า 30-46kg) และ Low-Cost บินดึกถึงเช้า
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <span className="editorial-tag tag-cyan">
                  ✈️ Haneda (เข้าเมือง 20 นาที)
                </span>
                <span className="editorial-tag tag-gold">
                  🧳 Narita (ไฟลท์เยอะ & โปรแรง)
                </span>
              </div>
            </div>
          </div>

          {/* Flights List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {FLIGHT_OPTIONS.map((flight) => {
              const isSelected = selectedFlightId === flight.id;

              return (
                <div
                  key={flight.id}
                  className="bento-card"
                  style={{
                    padding: '20px',
                    border: isSelected ? '2px solid var(--vermilion)' : '1px solid var(--border-hairline)',
                    background: isSelected ? 'linear-gradient(135deg, rgba(255, 101, 132, 0.08) 0%, var(--bg-surface) 100%)' : 'var(--bg-surface)',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 2fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
                    {/* Airline info */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: flight.logoColor }} />
                        <span style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>{flight.airline}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                        {flight.flightNumber} • {flight.aircraft}
                      </div>
                      <span className="editorial-tag tag-cyan" style={{ fontSize: '10.5px', marginTop: '6px' }}>
                        {flight.flightType}
                      </span>
                    </div>

                    {/* Flight Times */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{flight.departureTime}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{flight.from} (กทม.)</div>
                      </div>

                      <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: '11.5px', color: 'var(--fuji-cyan)', fontWeight: 600 }}>{flight.duration}</div>
                        <div style={{ height: '2px', background: 'var(--border-subtle)', position: 'relative', margin: '4px 0' }}>
                          <span style={{ position: 'absolute', right: '50%', top: '-6px', transform: 'translateX(50%)' }}>✈️</span>
                        </div>
                        <div style={{ fontSize: '11px', color: flight.stops === 0 ? '#10b981' : '#f59e0b' }}>
                          {flight.stops === 0 ? 'บินตรง Direct' : `แวะ 1 จุด (${flight.stopAirport})`}
                        </div>
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{flight.arrivalTime}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{flight.to} (โตเกียว)</div>
                      </div>
                    </div>

                    {/* Baggage & Meal */}
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <div>🧳 กระเป๋า: <strong style={{ color: '#fff' }}>{flight.baggageIncludedKg} kg</strong></div>
                      <div>🍱 อาหาร: <strong style={{ color: '#fff' }}>{flight.mealsIncluded ? 'รวมในตั๋ว' : 'ซื้อเพิ่ม'}</strong></div>
                      <div style={{ color: 'var(--fuji-cyan)', marginTop: '2px' }}>⭐ {flight.rating}/5.0</div>
                    </div>

                    {/* Price & Selection */}
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>ไป-กลับ รวมภาษี</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--vermilion)', marginBottom: '8px' }}>
                        {formatPrice(flight.basePriceTHB)}
                      </div>

                      <button
                        onClick={() => setSelectedFlightId(flight.id)}
                        className={isSelected ? 'btn-editorial-primary' : 'btn-editorial-secondary'}
                        style={{ padding: '6px 16px', fontSize: '12px' }}
                      >
                        {isSelected ? '✓ เลือกไฟลท์นี้' : 'เลือกไฟลท์นี้'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
