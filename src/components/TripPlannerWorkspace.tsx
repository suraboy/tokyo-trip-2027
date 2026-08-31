'use client';

import React, { useState } from 'react';
import { Attraction, FlightOption, HotelOption, Currency, CommunityTripPlan, MonthData } from '@/types/travel';
import { ATTRACTIONS_DATA, FLIGHT_OPTIONS, HOTEL_OPTIONS, MONTHS_DATA, JPY_TO_THB_RATE, calculateTransitFromHotel } from '@/data/mockData';
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
  Sparkles,
  Calendar,
  CalendarDays,
  ArrowRight,
  Award,
  DollarSign,
  Thermometer,
  Sun,
  CloudRain,
  Users
} from 'lucide-react';
import TripMap from './TripMap';
import InteractiveFlightCalendar from './InteractiveFlightCalendar';
import {
  getGoogleFlightsUrl,
  getSkyscannerFlightUrl,
  getTripComFlightUrl,
  getAgodaFlightUrl,
  getAgodaHotelSearchUrl,
  getBookingComHotelSearchUrl,
  getTripComHotelSearchUrl,
  getExpediaHotelSearchUrl,
  getGoogleHotelsSearchUrl,
} from '@/utils/bookingLinks';

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
  // Step workflow sequence: dates -> flights -> hotels -> attractions -> map
  const [activeSection, setActiveSection] = useState<'dates' | 'flights' | 'hotels' | 'attractions' | 'map'>('dates');
  const [datesViewMode, setDatesViewMode] = useState<'calendar' | 'matrix'>('calendar');
  
  // Selected Month & Dates
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(() => {
    if (initialPlan?.target_month) return initialPlan.target_month - 1;
    return 10; // Default November (index 10)
  });
  const [selectedDateRange, setSelectedDateRange] = useState<{ start: string; end: string }>({
    start: '2027-11-10',
    end: '2027-11-16',
  });
  const [durationDays, setDurationDays] = useState<number>(() => initialPlan?.duration_days || 7);

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
  const [hotelSearchQuery, setHotelSearchQuery] = useState<string>('');
  const [hotelSortBy, setHotelSortBy] = useState<'cheapest' | 'rating' | 'walk'>('cheapest');
  const [expandedComparisonId, setExpandedComparisonId] = useState<string | null>(null);
  const [attractionFilter, setAttractionFilter] = useState<'all' | 'tokyo' | 'nearby'>('all');
  const [hotelAreaFilter, setHotelAreaFilter] = useState<string>('all');
  const [dateGoalFilter, setDateGoalFilter] = useState<'all' | 'autumn' | 'sakura' | 'budget' | 'winter'>('all');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const selectedMonth = MONTHS_DATA[selectedMonthIndex] || MONTHS_DATA[10];
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

  const filteredMonths = MONTHS_DATA.filter((m) => {
    if (dateGoalFilter === 'sakura') return m.month === 3 || m.month === 4;
    if (dateGoalFilter === 'autumn') return m.month === 10 || m.month === 11;
    if (dateGoalFilter === 'winter') return m.month === 12 || m.month === 1 || m.month === 2;
    if (dateGoalFilter === 'budget') return m.priceLevel <= 2;
    return true;
  });

  const filteredAttractions = ATTRACTIONS_DATA.filter((spot) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchText = `${spot.nameTh} ${spot.nameEn} ${spot.nameJp} ${spot.area} ${spot.city} ${spot.nearestStation} ${spot.tags.join(' ')}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }

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
    if (hotelAreaFilter !== 'all' && h.area.toLowerCase() !== hotelAreaFilter.toLowerCase()) {
      return false;
    }
    if (hotelSearchQuery.trim()) {
      const q = hotelSearchQuery.toLowerCase().trim();
      const matchText = `${h.nameTh} ${h.nameEn} ${h.area} ${h.areaTh} ${h.nearestStation} ${h.highlights.join(' ')} ${h.tagBadge} ${h.bestSource || ''} ${h.bookingSource || ''}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  }).sort((a, b) => {
    if (hotelSortBy === 'cheapest') {
      return (a.lowestPriceTHB || a.pricePerNightTHB) - (b.lowestPriceTHB || b.pricePerNightTHB);
    }
    if (hotelSortBy === 'rating') {
      return b.ratingScore - a.ratingScore;
    }
    if (hotelSortBy === 'walk') {
      return a.walkMinutesToStation - b.walkMinutesToStation;
    }
    return 0;
  });

  const stayNights = Math.max(1, durationDays - 1);

  const handleSelectFlightAndProceed = async (flightId: string) => {
    setSelectedFlightId(flightId);
    const chosenFlight = FLIGHT_OPTIONS.find((f) => f.id === flightId) || selectedFlight;
    setIsSaving(true);
    try {
      const selectedSpots = ATTRACTIONS_DATA.filter((a) => selectedSpotIds.includes(a.id)).map((a) => a.nameTh.split('(')[0].trim());
      await onSaveTrip({
        id: initialPlan?.id,
        trip_title: tripTitle,
        creator_name: creatorName,
        target_year: 2027,
        target_month: selectedMonth.month,
        duration_days: durationDays,
        destinations: selectedSpots,
        selected_flight: `${chosenFlight.airline} (${chosenFlight.flightNumber})`,
        selected_hotel_id: selectedHotel.id,
        hotel_area: selectedHotel.area,
        estimated_budget_thb: chosenFlight.basePriceTHB + (selectedHotel.pricePerNightTHB * stayNights) + 15000,
        tags: [`${durationDays} วัน`, selectedMonth.nameTh, selectedHotel.area, 'Custom Workspace'],
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
      setActiveSection('hotels');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const selectedSpots = ATTRACTIONS_DATA.filter((a) => selectedSpotIds.includes(a.id)).map((a) => a.nameTh.split('(')[0].trim());
      await onSaveTrip({
        id: initialPlan?.id,
        trip_title: tripTitle,
        creator_name: creatorName,
        target_year: 2027,
        target_month: selectedMonth.month,
        duration_days: durationDays,
        destinations: selectedSpots,
        selected_flight: `${selectedFlight.airline} (${selectedFlight.flightNumber})`,
        selected_hotel_id: selectedHotel.id,
        hotel_area: selectedHotel.area,
        estimated_budget_thb: selectedFlight.basePriceTHB + (selectedHotel.pricePerNightTHB * stayNights) + 15000,
        tags: [`${durationDays} วัน`, selectedMonth.nameTh, selectedHotel.area, 'Custom Workspace'],
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
              <span className="editorial-tag tag-gold" style={{ fontSize: '11.5px' }}>
                📅 {selectedMonth.nameTh} 2027 ({durationDays} วัน)
              </span>
              <span className="editorial-tag tag-cyan" style={{ fontSize: '11.5px' }}>
                ✈️ {selectedFlight.airlineCode} • {formatPrice(selectedFlight.basePriceTHB)}
              </span>
              <span className="editorial-tag tag-green" style={{ fontSize: '11.5px' }}>
                🏨 {selectedHotel.areaTh.split('(')[0]}
              </span>
              <span className="editorial-tag tag-purple" style={{ fontSize: '11.5px' }}>
                📍 {selectedSpotIds.length} จุดเช็คอิน
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

      {/* Navigation Tabs Bar - Sequential Workflow Order */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          background: 'var(--bg-surface)',
          padding: '8px',
          borderRadius: 'var(--radius-pill)',
          border: '1px solid var(--border-hairline)',
          flexWrap: 'wrap',
        }}
      >
        {[
          { id: 'dates', label: '1. ปฏิทินเลือกวัน & ตั๋วบิน', icon: <Calendar size={16} />, badge: selectedMonth.nameTh },
          { id: 'flights', label: '2. เที่ยวบินราคาดีที่สุด', icon: <Plane size={16} />, badge: formatPrice(selectedFlight.basePriceTHB) },
          { id: 'hotels', label: '3. เลือกที่พักราคาดีที่สุด', icon: <Hotel size={16} />, badge: selectedHotel.area },
          { id: 'attractions', label: '4. สถานที่ท่องเที่ยว & ใกล้โตเกียว', icon: <MapPin size={16} />, badge: `${selectedSpotIds.length}` },
          { id: 'map', label: '5. แผนที่ & ระยะทาง', icon: <Navigation size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
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
                  fontSize: '11px',
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: CALENDAR & BEST DATES WITH INTERACTIVE FLIGHT PRICE CALENDAR */}
      {/* ========================================================================= */}
      {activeSection === 'dates' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header & View Mode Switcher */}
          <div className="bento-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span className="editorial-tag tag-red">
                    <Sparkles size={11} /> 12-MONTH FLIGHT & SEASONALITY MATRIX
                  </span>
                  <span className="editorial-tag tag-gold">ปี 2027 (TOKYO & KANTO)</span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>
                  1. ปฏิทินเลือกวันเดินทาง & เช็คราคาตั๋วเครื่องบินตลอดปี 2027
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '780px' }}>
                  เลือกวันเดินทางบนปฏิทินจริง พร้อมแสดงราคาตั๋วบินรายวัน (ตั๋ววันธรรมดาโปรคุ้มสุด vs สุดสัปดาห์/วันหยุด)
                </p>
              </div>

              {/* View Switcher: Calendar Grid vs 12-Month Matrix */}
              <div style={{ display: 'flex', background: 'var(--bg-surface-raised)', padding: '4px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-hairline)' }}>
                <button
                  onClick={() => setDatesViewMode('calendar')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-pill)',
                    border: 'none',
                    background: datesViewMode === 'calendar' ? 'var(--vermilion)' : 'transparent',
                    color: datesViewMode === 'calendar' ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Calendar size={14} />
                  <span>📅 ปฏิทินรายวัน</span>
                </button>

                <button
                  onClick={() => setDatesViewMode('matrix')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-pill)',
                    border: 'none',
                    background: datesViewMode === 'matrix' ? 'var(--vermilion)' : 'transparent',
                    color: datesViewMode === 'matrix' ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>📊 ภาพรวม 12 เดือน</span>
                </button>
              </div>
            </div>

            {/* Quick Preset Windows */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-hairline)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: '10px' }}>
                🌟 ช่วงเวลายอดนิยมแนะนำ (กดเพื่อเลือกทันที):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                {[
                  { monthIdx: 10, start: '2027-11-10', end: '2027-11-16', label: '🍂 10-16 พ.ย. 2027', title: 'ใบไม้เปลี่ยนสีพีค (Momiji)', tag: 'อันดับ 1 ยอดนิยม', tagColor: 'tag-red', price: '฿12,500+' },
                  { monthIdx: 2, start: '2027-03-24', end: '2027-03-30', label: '🌸 24-30 มี.ค. 2027', title: 'ซากุระบานสะพรั่ง (Hanami)', tag: 'ซากุระพีค', tagColor: 'tag-purple', price: '฿13,200+' },
                  { monthIdx: 3, start: '2027-04-10', end: '2027-04-16', label: '🏖️ 10-16 เม.ย. 2027', title: 'วันหยุดยาวสงกรานต์', tag: 'หยุดยาวไทย', tagColor: 'tag-gold', price: '฿14,500+' },
                  { monthIdx: 4, start: '2027-05-10', end: '2027-05-16', label: '🌿 10-16 พ.ค. 2027', title: 'ปลายฤดูใบไม้ผลิ ฟ้าใส', tag: 'คุ้มค่าที่สุด', tagColor: 'tag-green', price: '฿9,500+' },
                  { monthIdx: 5, start: '2027-06-12', end: '2027-06-18', label: '💰 12-18 มิ.ย. 2027', title: 'ตั๋วถูกที่สุดแห่งปี', tag: 'ประหยัดสุด', tagColor: 'tag-cyan', price: '฿8,900+' },
                ].map((preset, pIdx) => {
                  const isCur = selectedMonthIndex === preset.monthIdx;
                  return (
                    <div
                      key={pIdx}
                      onClick={() => {
                        setSelectedMonthIndex(preset.monthIdx);
                        setSelectedDateRange({ start: preset.start, end: preset.end });
                        setDurationDays(7);
                      }}
                      style={{
                        padding: '12px 14px',
                        background: isCur ? 'rgba(255, 101, 132, 0.12)' : 'var(--bg-surface-raised)',
                        border: isCur ? '1.5px solid var(--vermilion)' : '1px solid var(--border-hairline)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span className={`editorial-tag ${preset.tagColor}`} style={{ fontSize: '10px' }}>
                          {preset.tag}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#34d399' }}>
                          {preset.price}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>{preset.label}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{preset.title}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* VIEW 1: INTERACTIVE DAILY FLIGHT CALENDAR */}
          {datesViewMode === 'calendar' && (
            <InteractiveFlightCalendar
              selectedMonthIndex={selectedMonthIndex}
              onSelectMonthIndex={(idx) => setSelectedMonthIndex(idx)}
              selectedRange={selectedDateRange}
              onSelectRange={(range, days) => {
                setSelectedDateRange(range);
                setDurationDays(days);
              }}
              currency={currency}
            />
          )}

          {/* VIEW 2: 12 MONTHS MATRIX GRID */}
          {datesViewMode === 'matrix' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Filter pills */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: '🌟 ดูทั้ง 12 เดือน' },
                  { id: 'autumn', label: '🍁 ใบไม้เปลี่ยนสี (ต.ค. - พ.ย.)' },
                  { id: 'sakura', label: '🌸 ซากุระ (มี.ค. - เม.ย.)' },
                  { id: 'budget', label: '💰 ตั๋วบินราคาประหยัด (< ฿10,000)' },
                  { id: 'winter', label: '❄️ ฤดูหนาว & ฟูจิชัด (ธ.ค. - ก.พ.)' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setDateGoalFilter(f.id as any)}
                    className={`btn-editorial-secondary ${dateGoalFilter === f.id ? 'active' : ''}`}
                    style={{ padding: '6px 14px', fontSize: '12px' }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                {filteredMonths.map((m) => {
                  const mIdx = m.month - 1;
                  const isSelected = selectedMonthIndex === mIdx;

                  return (
                    <div
                      key={m.month}
                      onClick={() => {
                        setSelectedMonthIndex(mIdx);
                        setDatesViewMode('calendar');
                      }}
                      className="bento-card"
                      style={{
                        padding: '18px',
                        cursor: 'pointer',
                        border: isSelected ? '2px solid var(--vermilion)' : '1px solid var(--border-hairline)',
                        background: isSelected
                          ? 'linear-gradient(135deg, rgba(255, 101, 132, 0.12) 0%, var(--bg-surface) 100%)'
                          : 'var(--bg-surface)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px',
                        position: 'relative',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>
                              {m.nameTh}
                            </span>
                            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                              ({m.nameEn})
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-pill)',
                              background: m.overallScore >= 90 ? 'rgba(52, 211, 153, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                              color: m.overallScore >= 90 ? '#34d399' : '#38bdf8',
                            }}
                          >
                            ⭐ {m.overallScore}/100
                          </span>
                        </div>

                        <div style={{ fontSize: '11.5px', color: 'var(--sakura-pink)', fontWeight: 700, marginBottom: '8px' }}>
                          {m.seasonTh}
                        </div>

                        {/* Flight Price Indicator */}
                        <div
                          style={{
                            background: 'rgba(52, 211, 153, 0.1)',
                            border: '1px solid rgba(52, 211, 153, 0.3)',
                            borderRadius: '6px',
                            padding: '6px 10px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '10px',
                          }}
                        >
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>✈️ ตั๋วบินไป-กลับ:</span>
                          <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#34d399' }}>
                            {formatPrice(m.flightPriceRangeTHB?.min || 9800)} - {formatPrice(m.flightPriceRangeTHB?.max || 18500)}
                          </span>
                        </div>

                        {/* Climate Stats */}
                        <div style={{ display: 'flex', gap: '12px', fontSize: '11.5px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                          <span>🌡️ {m.avgTempC.min}°C - {m.avgTempC.max}°C</span>
                          <span>🌧️ ฝน {m.rainyDays} วัน</span>
                        </div>

                        {/* Highlights */}
                        <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
                          • {m.highlights[0]}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-hairline)' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                          {isSelected ? '✓ เลือกเดือนนี้อยู่' : 'คลิกเพื่อเปิดปฏิทิน'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMonthIndex(mIdx);
                            setDatesViewMode('calendar');
                          }}
                          className={isSelected ? 'btn-editorial-primary' : 'btn-editorial-secondary'}
                          style={{ padding: '5px 12px', fontSize: '11.5px' }}
                        >
                          {isSelected ? 'เปิดปฏิทิน ➔' : 'เลือกเดือนนี้'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Next Step Bar */}
          <div
            className="bento-card"
            style={{
              padding: '18px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
              background: 'linear-gradient(90deg, rgba(255, 101, 132, 0.1) 0%, rgba(56, 189, 248, 0.08) 100%), var(--bg-surface)',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                วันเดินทางที่เลือก: <strong style={{ color: '#fff' }}>{selectedDateRange.start} ถึง {selectedDateRange.end} ({durationDays} วัน)</strong>
              </div>
              <div style={{ fontSize: '12px', color: '#34d399', marginTop: '2px' }}>
                ประมาณการตั๋วบินไป-กลับ: {formatPrice(selectedMonth.flightPriceRangeTHB?.min || 9800)} - {formatPrice(selectedMonth.flightPriceRangeTHB?.max || 18500)}
              </div>
            </div>

            <button
              onClick={() => setActiveSection('flights')}
              className="btn-editorial-primary"
              style={{ padding: '10px 24px', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span>ยืนยันวันเดินทาง ➔ ถัดไป: เลือกเที่ยวบิน (Step 2)</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: BEST FLIGHTS AGGREGATOR */}
      {/* ========================================================================= */}
      {activeSection === 'flights' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Header */}
          <div className="bento-card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span className="editorial-tag tag-gold">📅 เดินทางช่วง {selectedMonth.nameTh} 2027</span>
                  <span className="editorial-tag tag-cyan">✈️ BKK / DMK ➔ TOKYO</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
                  2. เปรียบเทียบเที่ยวบินกรุงเทพฯ - โตเกียว (ดึงราคาที่ดีที่สุด)
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
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>ไป-กลับ รวมภาษี</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--vermilion)' }}>
                        {formatPrice(flight.basePriceTHB)}
                      </div>

                      <button
                        onClick={() => handleSelectFlightAndProceed(flight.id)}
                        className={isSelected ? 'btn-editorial-primary' : 'btn-editorial-secondary'}
                        style={{ padding: '8px 18px', fontSize: '12.5px' }}
                      >
                        {isSelected ? '✓ เลือกแล้ว ➔ ไปเลือกโรงแรม' : 'เลือกไฟลท์นี้ ➔ ไปเลือกโรงแรม'}
                      </button>
                    </div>
                  </div>

                  {/* Direct Booking Channels Bar */}
                  <div
                    style={{
                      marginTop: '16px',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--border-hairline)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <Plane size={13} color="var(--vermilion)" />
                      <span style={{ fontWeight: 700 }}>ช่องทางจองตั๋วไฟลท์นี้:</span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {flight.officialWebsiteUrl && (
                        <a
                          href={flight.officialWebsiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-editorial-secondary"
                          style={{
                            padding: '4px 10px',
                            fontSize: '11px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'rgba(255, 101, 132, 0.12)',
                            color: 'var(--sakura-pink)',
                            border: '1px solid rgba(255, 101, 132, 0.3)',
                          }}
                          title={`จองตรงบนเว็บไซต์ทางการ ${flight.airline}`}
                        >
                          <span>🌐 เว็บทางการ ({flight.airlineCode})</span>
                          <ExternalLink size={10} />
                        </a>
                      )}

                      <a
                        href={getGoogleFlightsUrl('BKK', flight.to, selectedDateRange.start, selectedDateRange.end)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-editorial-secondary"
                        style={{
                          padding: '4px 10px',
                          fontSize: '11px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#38bdf8',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                        }}
                        title="เช็คเที่ยวบินจริงบน Google Flights"
                      >
                        <span>✈️ Google Flights</span>
                        <ExternalLink size={10} />
                      </a>

                      <a
                        href={getSkyscannerFlightUrl(selectedDateRange.start, selectedDateRange.end)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-editorial-secondary"
                        style={{
                          padding: '4px 10px',
                          fontSize: '11px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#f59e0b',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                        }}
                        title="เช็คราคาบน Skyscanner"
                      >
                        <span>🔍 Skyscanner</span>
                        <ExternalLink size={10} />
                      </a>

                      <a
                        href={getTripComFlightUrl(selectedDateRange.start, selectedDateRange.end)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-editorial-secondary"
                        style={{
                          padding: '4px 10px',
                          fontSize: '11px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#34d399',
                          border: '1px solid rgba(52, 211, 153, 0.3)',
                        }}
                        title="เช็คโปรไฟลท์บน Trip.com"
                      >
                        <span>🏷️ Trip.com</span>
                        <ExternalLink size={10} />
                      </a>

                      <a
                        href={getAgodaFlightUrl(selectedDateRange.start, selectedDateRange.end)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-editorial-secondary"
                        style={{
                          padding: '4px 10px',
                          fontSize: '11px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#c084fc',
                          border: '1px solid rgba(168, 85, 247, 0.3)',
                        }}
                        title="เช็คราคาตั๋วบินบน Agoda Flights"
                      >
                        <span>🏨 Agoda</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Next Step Bar */}
          <div
            className="bento-card"
            style={{
              padding: '18px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
              background: 'linear-gradient(90deg, rgba(255, 101, 132, 0.1) 0%, rgba(56, 189, 248, 0.08) 100%), var(--bg-surface)',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                เที่ยวบินที่เลือก: <strong style={{ color: '#fff' }}>{selectedFlight.airline} ({selectedFlight.flightNumber})</strong>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--vermilion)', marginTop: '2px' }}>
                ราคาตั๋วไป-กลับ: {formatPrice(selectedFlight.basePriceTHB)} (บินลง {selectedFlight.to})
              </div>
            </div>

            <button
              onClick={() => handleSelectFlightAndProceed(selectedFlightId)}
              className="btn-editorial-primary"
              style={{ padding: '10px 24px', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span>บันทึกเที่ยวบินนี้ ➔ ถัดไป: เลือกโรงแรม (Step 3)</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: HOTELS & STAYS SELECTOR WITH MULTI-SITE PRICE COMPARISON */}
      {/* ========================================================================= */}
      {activeSection === 'hotels' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Flight Dates & Stays Context Banner */}
          <div
            className="bento-card"
            style={{
              padding: '16px 22px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(52, 211, 153, 0.1) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '11.5px', color: 'var(--fuji-cyan)', fontWeight: 700 }}>
                  📅 วันที่เข้าพักอิงจากเที่ยวบินที่เลือก ({selectedFlight.airline})
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                  Check-in: <span style={{ color: '#38bdf8' }}>{selectedDateRange.start}</span> ➔ Check-out: <span style={{ color: '#38bdf8' }}>{selectedDateRange.end}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span className="editorial-tag tag-gold" style={{ fontSize: '11.5px' }}>
                  🌙 พัก {stayNights} คืน ({durationDays} วัน)
                </span>
                <span className="editorial-tag tag-cyan" style={{ fontSize: '11.5px' }}>
                  ✈️ {selectedFlight.airlineCode} • ลง {selectedFlight.to}
                </span>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: '#34d399', fontWeight: 700 }}>
              ✓ ลิงก์จอง Agoda / Booking ด้านล่างใส่วัน Check-in/Out ให้อัตโนมัติ
            </div>
          </div>

          {/* Header, Search & Filter Bar */}
          <div className="bento-card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Hotel size={20} color="var(--vermilion)" />
                    <span>3. โรงแรม & ที่พักแนะนำ (เปรียบเทียบราคาถูกที่สุดจาก Agoda / Booking / Trip.com)</span>
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    ค้นหาโรงแรมตามชื่อ ย่าน หรือสถานีรถไฟ พร้อมเทียบราคาเรียลไทม์จากทุกแพลตฟอร์มชั้นนำ
                  </p>
                </div>

                {/* Sort selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>เรียงตาม:</span>
                  {[
                    { id: 'cheapest', label: '🏷️ ราคาถูกที่สุด' },
                    { id: 'rating', label: '⭐ รีวิวสูงสุด' },
                    { id: 'walk', label: '🚶 ใกล้สถานีรถไฟ' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setHotelSortBy(s.id as any)}
                      className={`btn-editorial-secondary ${hotelSortBy === s.id ? 'active' : ''}`}
                      style={{ padding: '5px 12px', fontSize: '12px' }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search input */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div
                  style={{
                    position: 'relative',
                    flex: 1,
                  }}
                >
                  <Search
                    size={16}
                    color="var(--text-tertiary)"
                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="text"
                    value={hotelSearchQuery}
                    onChange={(e) => setHotelSearchQuery(e.target.value)}
                    placeholder="🔍 ค้นหาโรงแรม เช่น Shinjuku, Onsen, Gracery, Ueno, ริชมอนด์, ติดสถานี..."
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 40px',
                      borderRadius: 'var(--radius-pill)',
                      border: '1px solid var(--border-hairline)',
                      background: 'var(--bg-surface-raised)',
                      color: '#fff',
                      fontSize: '13.5px',
                      outline: 'none',
                    }}
                  />
                  {hotelSearchQuery && (
                    <button
                      onClick={() => setHotelSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: '#fff',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  พบ <strong style={{ color: '#fff' }}>{filteredHotels.length}</strong> โรงแรม
                </div>
              </div>

              {/* Area Filters */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: 'ทั้งหมด' },
                  { id: 'shinjuku', label: 'ชินจูกุ (ยอดฮิต)' },
                  { id: 'ueno', label: 'อุเอโนะ (ไปสนามบินง่าย)' },
                  { id: 'asakusa', label: 'อาซากุสะ' },
                  { id: 'shibuya', label: 'ชิบูย่า' },
                  { id: 'ginza', label: 'กินซ่า' },
                  { id: 'akihabara', label: 'อากิฮาบาระ' },
                  { id: 'ikebukuro', label: 'อิเคบุคุโระ' },
                  { id: 'roppongi', label: 'รปปงหงิ' },
                  { id: 'kawaguchiko', label: 'ฟูจิ/ออนเซ็น' },
                ].map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setHotelAreaFilter(a.id)}
                    className={`btn-editorial-secondary ${hotelAreaFilter === a.id ? 'active' : ''}`}
                    style={{ padding: '5px 12px', fontSize: '12px' }}
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
              const isComparisonExpanded = expandedComparisonId === hotel.id;

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
                  <div style={{ position: 'relative', height: '170px', width: '100%' }}>
                    <img
                      src={hotel.imageUrl}
                      alt={hotel.nameTh}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(12,16,23,0.92) 0%, transparent 60%)' }} />

                    {/* Badges */}
                    <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <span className="editorial-tag tag-gold" style={{ fontSize: '11px' }}>
                        ⭐ {hotel.tagBadge}
                      </span>
                      <span className="editorial-tag tag-cyan" style={{ fontSize: '11px' }}>
                        {hotel.areaTh.split('(')[0]}
                      </span>
                    </div>

                    {/* Best Price Aggregator Badge */}
                    <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                      <span
                        className="editorial-tag tag-green"
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          boxShadow: '0 0 12px rgba(52, 211, 153, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span>🏷️ {hotel.bestSource || hotel.bookingSource}</span>
                      </span>
                    </div>

                    <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                        <span style={{ background: '#f59e0b', color: '#000', padding: '1px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                          ⭐ {hotel.ratingScore} / 10
                        </span>
                        <span style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.8)' }}>
                          โรงแรม {hotel.starRating} ดาว
                        </span>
                      </div>
                      <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                        {hotel.nameTh}
                      </h4>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {hotel.nameEn}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      {/* Highlights */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
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

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                        <div>🚇 {hotel.nearestStation} (เดิน {hotel.walkMinutesToStation} นาที)</div>
                        <a
                          href={getGoogleMapsSearchUrl(`${hotel.nameEn} ${hotel.area} Tokyo`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: 'var(--sakura-pink)',
                            textDecoration: 'none',
                            fontWeight: 600,
                          }}
                        >
                          <ExternalLink size={12} />
                          <span>Google Maps</span>
                        </a>
                      </div>
                    </div>

                    {/* Price Comparison Breakdown Box */}
                    {hotel.priceComparison && hotel.priceComparison.length > 0 && (
                      <div
                        style={{
                          background: 'var(--bg-surface-raised)',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          border: '1px solid var(--border-hairline)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            📊 เทียบราคาจากเวบไซต์ชั้นนำ (รวมภาษี)
                          </span>
                          <button
                            onClick={() => setExpandedComparisonId(isComparisonExpanded ? null : hotel.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--sakura-pink)',
                              fontSize: '11px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              padding: '0',
                            }}
                          >
                            {isComparisonExpanded ? 'ย่อรายละเอียด ▴' : 'ดูทั้งหมด ▾'}
                          </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {hotel.priceComparison.slice(0, isComparisonExpanded ? undefined : 2).map((quote, qIdx) => (
                            <div
                              key={qIdx}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                background: quote.isLowest ? 'rgba(52, 211, 153, 0.12)' : 'transparent',
                                border: quote.isLowest ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid transparent',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '12px', fontWeight: quote.isLowest ? 800 : 600, color: quote.isLowest ? '#34d399' : '#fff' }}>
                                  {quote.source}
                                </span>
                                {quote.isLowest && (
                                  <span style={{ fontSize: '10px', background: '#34d399', color: '#000', padding: '1px 5px', borderRadius: '3px', fontWeight: 800 }}>
                                    🏆 ถูกที่สุด
                                  </span>
                                )}
                                {quote.offerText && (
                                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                                    ({quote.offerText})
                                  </span>
                                )}
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '12.5px', fontWeight: 800, color: quote.isLowest ? '#34d399' : '#fff' }}>
                                  {formatPrice(quote.priceTHB)}
                                </span>
                                <a
                                  href={
                                    quote.source.toLowerCase().includes('agoda')
                                      ? getAgodaHotelSearchUrl(hotel.nameEn, selectedDateRange.start, selectedDateRange.end)
                                      : quote.source.toLowerCase().includes('booking')
                                      ? getBookingComHotelSearchUrl(hotel.nameEn, selectedDateRange.start, selectedDateRange.end)
                                      : quote.source.toLowerCase().includes('trip')
                                      ? getTripComHotelSearchUrl(hotel.nameEn, selectedDateRange.start, selectedDateRange.end)
                                      : quote.source.toLowerCase().includes('expedia')
                                      ? getExpediaHotelSearchUrl(hotel.nameEn, selectedDateRange.start, selectedDateRange.end)
                                      : getGoogleHotelsSearchUrl(hotel.nameEn, selectedDateRange.start, selectedDateRange.end)
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    fontSize: '11px',
                                    color: quote.isLowest ? '#34d399' : 'var(--text-secondary)',
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '2px',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    background: 'rgba(255,255,255,0.05)',
                                    fontWeight: 700,
                                  }}
                                >
                                  <span>เช็คราคาจริง</span>
                                  <ExternalLink size={10} />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lowest Price & Select Button */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-hairline)' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                          ราคาต่ำสุดจาก {hotel.bestSource ? hotel.bestSource.split('(')[0].trim() : 'Agoda'}
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#34d399' }}>
                          {formatPrice(hotel.lowestPriceTHB || hotel.pricePerNightTHB)} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-secondary)' }}>/ คืน</span>
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '1px' }}>
                          รวม {stayNights} คืน: <strong style={{ color: '#fff' }}>{formatPrice((hotel.lowestPriceTHB || hotel.pricePerNightTHB) * stayNights)}</strong>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedHotelId(hotel.id)}
                        className={isSelected ? 'btn-editorial-primary' : 'btn-editorial-secondary'}
                        style={{ padding: '8px 18px', fontSize: '12.5px' }}
                      >
                        {isSelected ? '✓ เลือกโรงแรมนี้แล้ว' : 'เลือกโรงแรมนี้'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Next Step Bar */}
          <div
            className="bento-card"
            style={{
              padding: '18px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
              background: 'linear-gradient(90deg, rgba(52, 211, 153, 0.1) 0%, rgba(56, 189, 248, 0.08) 100%), var(--bg-surface)',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                ฐานที่พักที่เลือก: <strong style={{ color: '#fff' }}>{selectedHotel.nameTh} ({selectedHotel.areaTh.split('(')[0]})</strong>
              </div>
              <div style={{ fontSize: '12px', color: '#34d399', marginTop: '2px' }}>
                ราคาต่อคืน: {formatPrice(selectedHotel.lowestPriceTHB || selectedHotel.pricePerNightTHB)} / คืน
              </div>
            </div>

            <button
              onClick={() => setActiveSection('attractions')}
              className="btn-editorial-primary"
              style={{ padding: '10px 24px', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span>ยืนยันโรงแรมนี้ ➔ ถัดไป: ปักหมุดที่เที่ยว (Step 4)</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: ATTRACTIONS & GOOGLE MAPS SEARCH */}
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
                    <span>4. สถานที่ท่องเที่ยวในโตเกียว และรอบนอก (Day Trips)</span>
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

              {/* Search input with live counter */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div
                  style={{
                    position: 'relative',
                    flex: 1,
                  }}
                >
                  <Search
                    size={16}
                    color="var(--text-tertiary)"
                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="🔍 ค้นหาสถานที่ เช่น ชิบูย่า, ฟูจิ, วัดเซ็นโซจิ, teamLab, คามาคุระ, ช้อปปิ้ง..."
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 40px',
                      borderRadius: 'var(--radius-pill)',
                      border: '1px solid var(--border-hairline)',
                      background: 'var(--bg-surface-raised)',
                      color: '#fff',
                      fontSize: '13.5px',
                      outline: 'none',
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: '#fff',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                  พบ <strong style={{ color: '#fff' }}>{filteredAttractions.length}</strong> แห่ง
                </div>
              </div>
            </div>
          </div>

          {/* Attractions Grid */}
          <div className="grid-cols-3">
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
                    border: isSelected ? '2px solid var(--vermilion)' : '1px solid var(--border-hairline)',
                    background: isSelected ? 'linear-gradient(180deg, rgba(255, 101, 132, 0.08) 0%, var(--bg-surface) 100%)' : 'var(--bg-surface)',
                  }}
                >
                  <div style={{ position: 'relative', height: '160px', width: '100%' }}>
                    <img
                      src={spot.imageUrl}
                      alt={spot.nameTh}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(12,16,23,0.9) 0%, transparent 60%)' }} />

                    {/* Tag / Category Badge */}
                    <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
                      <span className="editorial-tag tag-red" style={{ fontSize: '10.5px' }}>
                        {spot.city}
                      </span>
                      {spot.isNearTokyo && (
                        <span className="editorial-tag tag-cyan" style={{ fontSize: '10.5px' }}>
                          🗻 Day Trip
                        </span>
                      )}
                    </div>

                    {/* Google Maps External Link Button */}
                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                      <a
                        href={gmapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="เปิดดูตำแหน่งบน Google Maps"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: 'rgba(12, 16, 23, 0.85)',
                          backdropFilter: 'blur(8px)',
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-pill)',
                          color: '#38bdf8',
                          fontSize: '11px',
                          textDecoration: 'none',
                          fontWeight: 700,
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                        }}
                      >
                        <ExternalLink size={12} />
                        <span>Google Maps</span>
                      </a>
                    </div>

                    <div style={{ position: 'absolute', bottom: '10px', left: '14px', right: '14px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                        {spot.nameTh}
                      </h4>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {spot.nameEn}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '8px' }}>
                        {spot.descriptionTh.slice(0, 80)}...
                      </p>

                      {/* Transit from selected hotel */}
                      <div
                        style={{
                          background: 'var(--bg-surface-raised)',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-xs)',
                          border: '1px solid var(--border-hairline)',
                          fontSize: '11.5px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                          <span>⏱️ จาก {selectedHotel.areaTh.split('(')[0]}:</span>
                          <strong style={{ color: 'var(--sakura-pink)' }}>~{transit.minutes} นาที</strong>
                        </div>
                        <div style={{ color: 'var(--fuji-cyan)', fontSize: '11px', marginTop: '2px' }}>
                          🚆 {transit.trainLine}
                        </div>
                      </div>
                    </div>

                    {/* Toggle Button */}
                    <button
                      onClick={() => toggleSpot(spot.id)}
                      className={isSelected ? 'btn-editorial-primary' : 'btn-editorial-secondary'}
                      style={{ width: '100%', padding: '7px 12px', fontSize: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
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
              );
            })}
          </div>

          {/* Bottom Next Step Bar */}
          <div
            className="bento-card"
            style={{
              padding: '18px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
              background: 'linear-gradient(90deg, rgba(255, 101, 132, 0.1) 0%, rgba(56, 189, 248, 0.08) 100%), var(--bg-surface)',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                สถานที่ในทริปทั้งหมด: <strong style={{ color: '#fff' }}>{selectedSpotIds.length} แห่ง</strong>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--fuji-cyan)', marginTop: '2px' }}>
                คำนวณเส้นทางจากโรงแรม {selectedHotel.nameTh} เรียบร้อย
              </div>
            </div>

            <button
              onClick={() => setActiveSection('map')}
              className="btn-editorial-primary"
              style={{ padding: '10px 24px', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span>ดูแผนที่ & เส้นทางระยะทาง (Step 5) ➔</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 5: MAP & DISTANCES (GOOGLE MAPS & LEAFLET VISUALIZATION) */}
      {/* ========================================================================= */}
      {activeSection === 'map' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Header */}
          <div className="bento-card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Navigation size={20} color="var(--vermilion)" />
                  <span>5. แผนที่ระยะทางและเวลาเดินทางจริงในโตเกียว</span>
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  คำนวณระยะห่างระหว่างที่พัก ({selectedHotel.nameTh}) และสถานที่ท่องเที่ยวทั้งหมด {selectedSpotIds.length} แห่ง
                </p>
              </div>

              {/* Quick Area Switcher */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['Shinjuku', 'Ueno', 'Asakusa', 'Shibuya', 'Ginza', 'Kawaguchiko'].map((area) => {
                  const isCurArea = selectedHotel.area.toLowerCase() === area.toLowerCase();
                  return (
                    <button
                      key={area}
                      onClick={() => {
                        const matchH = HOTEL_OPTIONS.find((h) => h.area.toLowerCase() === area.toLowerCase());
                        if (matchH) setSelectedHotelId(matchH.id);
                      }}
                      className={`btn-editorial-secondary ${isCurArea ? 'active' : ''}`}
                      style={{ padding: '5px 12px', fontSize: '12px' }}
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
              🗺️ แผนที่พิกัดจริงและระยะทางจากที่พักไปยังสถานที่ที่เลือก ({selectedSpotIds.length} แห่ง)
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
              <span>🏨 = โรงแรมที่เลือก ({selectedHotel.nameTh})</span>
              <span style={{ color: '#10b981' }}>● = สถานที่ในทริป</span>
              <span style={{ color: '#ff6584' }}>--- = เส้นทางระยะทาง</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
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
    </div>
  );
};
