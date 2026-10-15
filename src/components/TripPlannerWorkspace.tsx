'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Attraction, FlightOption, HotelOption, Currency, Language, CommunityTripPlan, MonthData } from '@/types/travel';
import { ATTRACTIONS_DATA, FLIGHT_OPTIONS, HOTEL_OPTIONS, MONTHS_DATA, calculateTransitFromHotel } from '@/data/mockData';
import { useJpyThbRate } from '@/hooks/useJpyThbRate';
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

import { useI18n } from '@/utils/i18n';

interface TripPlannerWorkspaceProps {
  tripTitle: string;
  creatorName: string;
  currency: Currency;
  language: Language;
  initialPlan?: CommunityTripPlan | null;
  onBackToHome: () => void;
  onSaveTrip: (plan: Partial<CommunityTripPlan>) => Promise<void>;
}

const hotelBadgeEn: Record<string, string> = {
  'คุ้มค่าที่สุด': 'Best value',
  'ใกล้รถไฟ 1 นาที': '1 min to train',
  'วิวฟูจิสวย': 'Great Fuji view',
  'ช้อปปิ้งสะดวก': 'Great for shopping',
  'พรีเมียม': 'Premium',
  'ยอดนิยม': 'Popular',
};

export const TripPlannerWorkspace: React.FC<TripPlannerWorkspaceProps> = ({
  tripTitle,
  creatorName,
  currency,
  language,
  initialPlan,
  onBackToHome,
  onSaveTrip,
}) => {
  const JPY_TO_THB_RATE = useJpyThbRate();
  const t = useI18n(language);
  const tx = (th: string, en: string) => (language === 'th' ? th : en);
  // Step workflow sequence: dates -> flights -> hotels -> attractions -> map
  const [activeSection, setActiveSection] = useState<'dates' | 'flights' | 'hotels' | 'attractions' | 'map'>('dates');
  const [datesViewMode, setDatesViewMode] = useState<'calendar' | 'matrix'>('calendar');
  
  // Selected Month & Dates
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(() => {
    if (initialPlan?.target_month) return initialPlan.target_month - 1;
    return 10; // Default November (index 10)
  });
  // Restore saved dates; old plans without dates fall back to the 10th of their target month
  const [selectedDateRange, setSelectedDateRange] = useState<{ start: string; end: string }>(() => {
    if (initialPlan?.travel_start_date && initialPlan?.travel_end_date) {
      return { start: initialPlan.travel_start_date, end: initialPlan.travel_end_date };
    }
    if (initialPlan?.target_month) {
      const y = initialPlan.target_year || 2027;
      const m = initialPlan.target_month;
      const days = Math.max(1, initialPlan.duration_days || 7);
      const pad = (n: number) => String(n).padStart(2, '0');
      const end = new Date(Date.UTC(y, m - 1, 10 + days - 1));
      return {
        start: `${y}-${pad(m)}-10`,
        end: `${end.getUTCFullYear()}-${pad(end.getUTCMonth() + 1)}-${pad(end.getUTCDate())}`,
      };
    }
    return { start: '2027-11-10', end: '2027-11-16' };
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
  const [customSpots, setCustomSpots] = useState<Attraction[]>([]);
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

  const allAttractions: Attraction[] = useMemo(() => {
    return [...customSpots, ...ATTRACTIONS_DATA];
  }, [customSpots]);

  const handleAddCustomSpotFromGoogleMaps = (query: string) => {
    if (!query.trim()) return;
    const cleanName = query.trim();
    const id = `custom-spot-${Date.now()}`;
    const newSpot: Attraction = {
      id,
      nameEn: cleanName,
      nameJp: cleanName,
      nameTh: cleanName,
      city: 'Tokyo',
      area: 'Google Maps Place',
      category: 'Culture & Shrine',
      descriptionTh: tx(`สถานที่นำเข้าจาก Google Maps: ${cleanName}`, `Place imported from Google Maps: ${cleanName}`),
      highlightTh: tx(`ค้นพบและปักหมุดตรงจาก Google Maps`, `Found and pinned directly from Google Maps`),
      estimatedTimeHours: 2,
      recommendedTimeOfDay: 'Anytime',
      priceJPY: 0,
      nearestStation: 'Google Maps Location',
      walkingMinutes: 5,
      crowdRating: 3,
      mustVisitScore: 90,
      imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80',
      tipsTh: [tx('ตรวจสอบเวลาเปิด-ปิดและเส้นทางสดบน Google Maps ก่อนออกเดินทาง', 'Check opening hours and live routes on Google Maps before you go')],
      tags: ['Google Maps Live', 'Custom Spot', 'User Added'],
      lat: 35.6762,
      lng: 139.6503,
    };

    setCustomSpots((prev) => [newSpot, ...prev]);
    if (!selectedSpotIds.includes(id)) {
      setSelectedSpotIds((prev) => [...prev, id]);
    }
  };

  const selectedMonth = MONTHS_DATA[selectedMonthIndex] || MONTHS_DATA[10];
  const [pickedHotel, setPickedHotel] = useState<HotelOption | null>(null);
  const selectedHotel =
    HOTEL_OPTIONS.find((h) => h.id === selectedHotelId) ||
    (pickedHotel && pickedHotel.id === selectedHotelId ? pickedHotel : null) ||
    HOTEL_OPTIONS[0];

  // Saved plan points at an OSM hotel -> fetch it once by id
  useEffect(() => {
    if (!selectedHotelId.startsWith('osm-') || pickedHotel?.id === selectedHotelId) return;
    fetch(`/api/hotels?id=${encodeURIComponent(selectedHotelId)}`)
      .then((r) => r.json())
      .then((d) => d.success && d.hotel && setPickedHotel(d.hotel))
      .catch(() => {});
  }, [selectedHotelId, pickedHotel?.id]);
  const selectedFlight = FLIGHT_OPTIONS.find((f) => f.id === selectedFlightId) || FLIGHT_OPTIONS[0];

  const formatPrice = (thb: number) => {
    if (currency === 'THB') return `฿${thb.toLocaleString()} ${tx('บาท', 'THB')}`;
    return `¥${Math.round(thb / JPY_TO_THB_RATE).toLocaleString()} ${tx('เยน', 'JPY')}`;
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

  const filteredAttractions = allAttractions.filter((spot: Attraction) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchText = `${spot.nameTh} ${spot.nameEn} ${spot.nameJp || ''} ${spot.area} ${spot.city} ${spot.nearestStation} ${spot.tags.join(' ')}`.toLowerCase();
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

  // ---- Hotels: keyset-paginated fetch from /api/hotels (search + area + sort run server-side) ----
  const HOTEL_PAGE_SIZE = 12;
  const [filteredHotels, setFilteredHotels] = useState<HotelOption[]>([]);
  const [hotelNextCursor, setHotelNextCursor] = useState<string | null>(null);
  const [hotelTotal, setHotelTotal] = useState<number>(0);
  const [hotelsLoading, setHotelsLoading] = useState<boolean>(true);
  const [hotelsLoadingMore, setHotelsLoadingMore] = useState<boolean>(false);
  const [debouncedHotelQuery, setDebouncedHotelQuery] = useState<string>('');
  const [hotelOsmStatus, setHotelOsmStatus] = useState<'ready' | 'loading' | 'error'>('ready');
  // callback-ref state: re-attaches the observer whenever the sentinel mounts (e.g. switching to Step 3)
  const [hotelSentinelEl, setHotelSentinelEl] = useState<HTMLDivElement | null>(null);
  const hotelAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedHotelQuery(hotelSearchQuery), 250);
    return () => clearTimeout(id);
  }, [hotelSearchQuery]);

  const fetchHotelPage = useCallback(
    async (cursor: string | null) => {
      hotelAbortRef.current?.abort();
      const ctrl = new AbortController();
      hotelAbortRef.current = ctrl;
      const params = new URLSearchParams({
        q: debouncedHotelQuery,
        area: hotelAreaFilter,
        sort: hotelSortBy,
        limit: String(HOTEL_PAGE_SIZE),
      });
      if (cursor) params.set('cursor', cursor);
      if (cursor) setHotelsLoadingMore(true);
      else setHotelsLoading(true);
      try {
        const res = await fetch(`/api/hotels?${params.toString()}`, { signal: ctrl.signal });
        const data = await res.json();
        if (!data.success) return;
        setFilteredHotels((prev) => (cursor ? [...prev, ...data.items] : data.items));
        setHotelNextCursor(data.nextCursor);
        if (!cursor) setHotelTotal(data.total ?? data.items.length);
        setHotelOsmStatus(data.osmStatus ?? 'ready');
      } catch (e) {
        if ((e as Error).name !== 'AbortError') console.error('Hotel fetch failed', e);
      } finally {
        if (hotelAbortRef.current === ctrl) {
          setHotelsLoading(false);
          setHotelsLoadingMore(false);
        }
      }
    },
    [debouncedHotelQuery, hotelAreaFilter, hotelSortBy]
  );

  // First page whenever search / area / sort changes
  useEffect(() => {
    fetchHotelPage(null);
    return () => hotelAbortRef.current?.abort();
  }, [fetchHotelPage]);

  // OSM list is being fetched by the server for the first time -> re-check first page every 5 s
  useEffect(() => {
    if (hotelOsmStatus !== 'loading') return;
    const id = setTimeout(() => fetchHotelPage(null), 5000);
    return () => clearTimeout(id);
  }, [hotelOsmStatus, fetchHotelPage]);

  // Infinite scroll: load next keyset page when sentinel enters viewport
  useEffect(() => {
    const el = hotelSentinelEl;
    if (!el || !hotelNextCursor) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hotelsLoading && !hotelsLoadingMore) fetchHotelPage(hotelNextCursor);
      },
      { rootMargin: '300px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hotelSentinelEl, hotelNextCursor, hotelsLoading, hotelsLoadingMore, fetchHotelPage]);

  const stayNights = Math.max(1, durationDays - 1);

  const handleSelectFlightAndProceed = async (flightId: string) => {
    setSelectedFlightId(flightId);
    const chosenFlight = FLIGHT_OPTIONS.find((f) => f.id === flightId) || selectedFlight;
    setIsSaving(true);
    try {
      const selectedSpots = allAttractions.filter((a: Attraction) => selectedSpotIds.includes(a.id)).map((a: Attraction) => a.nameTh.split('(')[0].trim());
      await onSaveTrip({
        id: initialPlan?.id,
        trip_title: tripTitle,
        creator_name: creatorName,
        target_year: Number(selectedDateRange.start.slice(0, 4)) || 2027,
        target_month: Number(selectedDateRange.start.slice(5, 7)) || selectedMonth.month,
        travel_start_date: selectedDateRange.start,
        travel_end_date: selectedDateRange.end,
        duration_days: durationDays,
        destinations: selectedSpots,
        selected_flight: `${chosenFlight.airline} (${chosenFlight.flightNumber})`,
        selected_hotel_id: selectedHotel.id,
        hotel_area: selectedHotel.area,
        estimated_budget_thb: chosenFlight.basePriceTHB + ((selectedHotel.pricePerNightTHB || 3000) * stayNights) + 15000,
        tags: [`${durationDays} วัน`, selectedMonth.nameTh, selectedHotel.area, 'Custom Workspace'],
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
      setActiveSection('hotels');
    }
  };

  const handleSelectHotelAndProceed = async (hotelId: string) => {
    const chosenHotel = HOTEL_OPTIONS.find((h) => h.id === hotelId) || filteredHotels.find((h) => h.id === hotelId) || selectedHotel;
    if (chosenHotel.source === 'osm') setPickedHotel(chosenHotel);
    setSelectedHotelId(hotelId);
    setIsSaving(true);
    try {
      const selectedSpots = allAttractions.filter((a: Attraction) => selectedSpotIds.includes(a.id)).map((a: Attraction) => a.nameTh.split('(')[0].trim());
      await onSaveTrip({
        id: initialPlan?.id,
        trip_title: tripTitle,
        creator_name: creatorName,
        target_year: Number(selectedDateRange.start.slice(0, 4)) || 2027,
        target_month: Number(selectedDateRange.start.slice(5, 7)) || selectedMonth.month,
        travel_start_date: selectedDateRange.start,
        travel_end_date: selectedDateRange.end,
        duration_days: durationDays,
        destinations: selectedSpots,
        selected_flight: `${selectedFlight.airline} (${selectedFlight.flightNumber})`,
        selected_hotel_id: chosenHotel.id,
        hotel_area: chosenHotel.area,
        estimated_budget_thb: selectedFlight.basePriceTHB + ((chosenHotel.lowestPriceTHB || chosenHotel.pricePerNightTHB || 3000) * stayNights) + 15000,
        tags: [`${durationDays} วัน`, selectedMonth.nameTh, chosenHotel.area, 'Custom Workspace'],
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
      setActiveSection('attractions');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const selectedSpots = allAttractions.filter((a: Attraction) => selectedSpotIds.includes(a.id)).map((a: Attraction) => a.nameTh.split('(')[0].trim());
      await onSaveTrip({
        id: initialPlan?.id,
        trip_title: tripTitle,
        creator_name: creatorName,
        target_year: Number(selectedDateRange.start.slice(0, 4)) || 2027,
        target_month: Number(selectedDateRange.start.slice(5, 7)) || selectedMonth.month,
        travel_start_date: selectedDateRange.start,
        travel_end_date: selectedDateRange.end,
        duration_days: durationDays,
        destinations: selectedSpots,
        selected_flight: `${selectedFlight.airline} (${selectedFlight.flightNumber})`,
        selected_hotel_id: selectedHotel.id,
        hotel_area: selectedHotel.area,
        estimated_budget_thb: selectedFlight.basePriceTHB + ((selectedHotel.pricePerNightTHB || 3000) * stayNights) + 15000,
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
            <span>{t.backHomeBtn}</span>
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <span className="editorial-tag tag-red" style={{ fontSize: '11.5px' }}>
                🎒 @{creatorName}
              </span>
              <span className="editorial-tag tag-gold" style={{ fontSize: '11.5px' }}>
                📅 {language === 'th' ? selectedMonth.nameTh : selectedMonth.nameEn} 2027 ({durationDays} {t.daysUnit})
              </span>
              <span className="editorial-tag tag-cyan" style={{ fontSize: '11.5px' }}>
                ✈️ {selectedFlight.airlineCode} • {formatPrice(selectedFlight.basePriceTHB)}
              </span>
              <span className="editorial-tag tag-green" style={{ fontSize: '11.5px' }}>
                🏨 {language === 'th' ? selectedHotel.areaTh.split('(')[0] : selectedHotel.area}
              </span>
              <span className="editorial-tag tag-purple" style={{ fontSize: '11.5px' }}>
                📍 {t.spotsChecked(selectedSpotIds.length)}
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
          <span>{isSaving ? t.savingBtn : t.savePlanBtn}</span>
        </button>
      </div>

      {/* Navigation Tabs Bar - Sequential Workflow Order */}
      <div
        className="step-nav-bar"
        style={{
          background: 'var(--bg-surface)',
          padding: '8px',
          borderRadius: 'var(--radius-pill)',
          border: '1px solid var(--border-hairline)',
        }}
      >
        {[
          { id: 'dates', label: t.step1Title, icon: <Calendar size={16} />, badge: language === 'th' ? selectedMonth.nameTh : selectedMonth.nameEn },
          { id: 'flights', label: t.step2Title, icon: <Plane size={16} />, badge: formatPrice(selectedFlight.basePriceTHB) },
          { id: 'hotels', label: t.step3Title, icon: <Hotel size={16} />, badge: selectedHotel.area },
          { id: 'attractions', label: t.step4Title, icon: <MapPin size={16} />, badge: `${selectedSpotIds.length}` },
          { id: 'map', label: t.step5Title, icon: <Navigation size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className="step-nav-item"
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
                  <span className="editorial-tag tag-gold">{tx('ปี 2027 (TOKYO & KANTO)', 'YEAR 2027 (TOKYO & KANTO)')}</span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>
                  {tx('1. ปฏิทินเลือกวันเดินทาง & เช็คราคาตั๋วเครื่องบินตลอดปี 2027', '1. Pick Travel Dates & Check Flight Prices All Through 2027')}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '780px' }}>
                  {tx('เลือกวันเดินทางบนปฏิทินจริง พร้อมแสดงราคาตั๋วบินรายวัน (ตั๋ววันธรรมดาโปรคุ้มสุด vs สุดสัปดาห์/วันหยุด)', 'Choose travel dates on a real calendar with daily flight prices (weekday deals are cheapest vs weekends/holidays)')}
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
                  <span>{tx('📅 ปฏิทินรายวัน', '📅 Daily Calendar')}</span>
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
                  <span>{tx('📊 ภาพรวม 12 เดือน', '📊 12-Month Overview')}</span>
                </button>
              </div>
            </div>

            {/* Quick Preset Windows */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-hairline)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: '10px' }}>
                {tx('🌟 ช่วงเวลายอดนิยมแนะนำ (กดเพื่อเลือกทันที):', '🌟 Popular recommended windows (click to select):')}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                {[
                  { monthIdx: 10, start: '2027-11-10', end: '2027-11-16', label: tx('🍂 10-16 พ.ย. 2027', '🍂 Nov 10-16, 2027'), title: tx('ใบไม้เปลี่ยนสีพีค (Momiji)', 'Peak autumn leaves (Momiji)'), tag: tx('อันดับ 1 ยอดนิยม', '#1 most popular'), tagColor: 'tag-red', price: '฿12,500+' },
                  { monthIdx: 2, start: '2027-03-24', end: '2027-03-30', label: tx('🌸 24-30 มี.ค. 2027', '🌸 Mar 24-30, 2027'), title: tx('ซากุระบานสะพรั่ง (Hanami)', 'Cherry blossoms in full bloom (Hanami)'), tag: tx('ซากุระพีค', 'Peak sakura'), tagColor: 'tag-purple', price: '฿13,200+' },
                  { monthIdx: 3, start: '2027-04-10', end: '2027-04-16', label: tx('🏖️ 10-16 เม.ย. 2027', '🏖️ Apr 10-16, 2027'), title: tx('วันหยุดยาวสงกรานต์', 'Songkran long holiday'), tag: tx('หยุดยาวไทย', 'Thai long weekend'), tagColor: 'tag-gold', price: '฿14,500+' },
                  { monthIdx: 4, start: '2027-05-10', end: '2027-05-16', label: tx('🌿 10-16 พ.ค. 2027', '🌿 May 10-16, 2027'), title: tx('ปลายฤดูใบไม้ผลิ ฟ้าใส', 'Late spring, clear skies'), tag: tx('คุ้มค่าที่สุด', 'Best value'), tagColor: 'tag-green', price: '฿9,500+' },
                  { monthIdx: 5, start: '2027-06-12', end: '2027-06-18', label: tx('💰 12-18 มิ.ย. 2027', '💰 Jun 12-18, 2027'), title: tx('ตั๋วถูกที่สุดแห่งปี', 'Cheapest flights of the year'), tag: tx('ประหยัดสุด', 'Cheapest'), tagColor: 'tag-cyan', price: '฿8,900+' },
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
                // keep month (header, prices, saved target_month) in sync with the picked start date
                const mIdx = Number(range.start.slice(5, 7)) - 1;
                if (mIdx >= 0 && mIdx < 12) setSelectedMonthIndex(mIdx);
              }}
              currency={currency}
              language={language}
            />
          )}

          {/* VIEW 2: 12 MONTHS MATRIX GRID */}
          {datesViewMode === 'matrix' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Filter pills */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: tx('🌟 ดูทั้ง 12 เดือน', '🌟 All 12 months') },
                  { id: 'autumn', label: tx('🍁 ใบไม้เปลี่ยนสี (ต.ค. - พ.ย.)', '🍁 Autumn leaves (Oct - Nov)') },
                  { id: 'sakura', label: tx('🌸 ซากุระ (มี.ค. - เม.ย.)', '🌸 Sakura (Mar - Apr)') },
                  { id: 'budget', label: tx('💰 ตั๋วบินราคาประหยัด (< ฿10,000)', '💰 Budget flights (< ฿10,000)') },
                  { id: 'winter', label: tx('❄️ ฤดูหนาว & ฟูจิชัด (ธ.ค. - ก.พ.)', '❄️ Winter & clear Fuji (Dec - Feb)') },
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
                              {language === 'th' ? m.nameTh : m.nameEn}
                            </span>
                            {language === 'th' && (
                              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                                ({m.nameEn})
                              </span>
                            )}
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
                          {language === 'th' ? m.seasonTh : m.seasonEn}
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
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{tx('✈️ ตั๋วบินไป-กลับ:', '✈️ Round-trip flight:')}</span>
                          <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#34d399' }}>
                            {formatPrice(m.flightPriceRangeTHB?.min || 9800)} - {formatPrice(m.flightPriceRangeTHB?.max || 18500)}
                          </span>
                        </div>

                        {/* Climate Stats */}
                        <div style={{ display: 'flex', gap: '12px', fontSize: '11.5px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                          <span>🌡️ {m.avgTempC.min}°C - {m.avgTempC.max}°C</span>
                          <span>🌧️ {tx(`ฝน ${m.rainyDays} วัน`, `${m.rainyDays} rainy days`)}</span>
                        </div>

                        {/* Highlights */}
                        <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
                          • {language === 'th' ? m.highlights[0] : (m.highlightsEn?.[0] ?? m.highlights[0])}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-hairline)' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                          {isSelected ? tx('✓ เลือกเดือนนี้อยู่', '✓ Currently selected') : tx('คลิกเพื่อเปิดปฏิทิน', 'Click to open calendar')}
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
                          {isSelected ? tx('เปิดปฏิทิน ➔', 'Open calendar ➔') : tx('เลือกเดือนนี้', 'Select this month')}
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
                {tx('วันเดินทางที่เลือก:', 'Selected travel dates:')} <strong style={{ color: '#fff' }}>{selectedDateRange.start} {tx('ถึง', 'to')} {selectedDateRange.end} ({durationDays} {t.daysUnit})</strong>
              </div>
              <div style={{ fontSize: '12px', color: '#34d399', marginTop: '2px' }}>
                {tx('ประมาณการตั๋วบินไป-กลับ:', 'Estimated round-trip flight:')} {formatPrice(selectedMonth.flightPriceRangeTHB?.min || 9800)} - {formatPrice(selectedMonth.flightPriceRangeTHB?.max || 18500)}
              </div>
            </div>

            <button
              onClick={() => setActiveSection('flights')}
              className="btn-editorial-primary"
              style={{ padding: '10px 24px', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span>{tx('ยืนยันวันเดินทาง ➔ ถัดไป: เลือกเที่ยวบิน (Step 2)', 'Confirm dates ➔ Next: Choose flights (Step 2)')}</span>
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
                  <span className="editorial-tag tag-gold">📅 {tx(`เดินทางช่วง ${selectedMonth.nameTh} 2027`, `Travelling in ${selectedMonth.nameEn} 2027`)}</span>
                  <span className="editorial-tag tag-cyan">✈️ BKK / DMK ➔ TOKYO</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
                  {tx('2. เปรียบเทียบเที่ยวบินกรุงเทพฯ - โตเกียว (ดึงราคาที่ดีที่สุด)', '2. Compare Bangkok - Tokyo Flights (Best Prices)')}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {tx('เปรียบเทียบเที่ยวบิน Full Service (รวมกระเป๋า 30-46kg) และ Low-Cost บินดึกถึงเช้า', 'Compare Full Service (30-46kg baggage included) and overnight Low-Cost flights')}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <span className="editorial-tag tag-cyan">
                  {tx('✈️ Haneda (เข้าเมือง 20 นาที)', '✈️ Haneda (20 min to city)')}
                </span>
                <span className="editorial-tag tag-gold">
                  {tx('🧳 Narita (ไฟลท์เยอะ & โปรแรง)', '🧳 Narita (more flights & big deals)')}
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
                  <div className="responsive-flight-card">
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
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{flight.from} ({tx('กทม.', 'Bangkok')})</div>
                      </div>

                      <div style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontSize: '11.5px', color: 'var(--fuji-cyan)', fontWeight: 600 }}>{flight.duration}</div>
                        <div style={{ height: '2px', background: 'var(--border-subtle)', position: 'relative', margin: '4px 0' }}>
                          <span style={{ position: 'absolute', right: '50%', top: '-6px', transform: 'translateX(50%)' }}>✈️</span>
                        </div>
                        <div style={{ fontSize: '11px', color: flight.stops === 0 ? '#10b981' : '#f59e0b' }}>
                          {flight.stops === 0 ? tx('บินตรง Direct', 'Direct') : tx(`แวะ 1 จุด (${flight.stopAirport})`, `1 stop (${flight.stopAirport})`)}
                        </div>
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>{flight.arrivalTime}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{flight.to} ({tx('โตเกียว', 'Tokyo')})</div>
                      </div>
                    </div>

                    {/* Baggage & Meal */}
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <div>{tx('🧳 กระเป๋า:', '🧳 Baggage:')} <strong style={{ color: '#fff' }}>{flight.baggageIncludedKg} kg</strong></div>
                      <div>{tx('🍱 อาหาร:', '🍱 Meal:')} <strong style={{ color: '#fff' }}>{flight.mealsIncluded ? tx('รวมในตั๋ว', 'Included') : tx('ซื้อเพิ่ม', 'Extra cost')}</strong></div>
                      <div style={{ color: 'var(--fuji-cyan)', marginTop: '2px' }}>⭐ {flight.rating}/5.0</div>
                    </div>

                    {/* Price & Selection */}
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{tx('ไป-กลับ รวมภาษี', 'Round-trip incl. taxes')}</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--vermilion)' }}>
                        {formatPrice(flight.basePriceTHB)}
                      </div>

                      <button
                        onClick={() => handleSelectFlightAndProceed(flight.id)}
                        className={isSelected ? 'btn-editorial-primary' : 'btn-editorial-secondary'}
                        style={{ padding: '8px 18px', fontSize: '12.5px' }}
                      >
                        {isSelected ? tx('✓ เลือกแล้ว ➔ ไปเลือกโรงแรม', '✓ Selected ➔ Choose hotel') : tx('เลือกไฟลท์นี้ ➔ ไปเลือกโรงแรม', 'Select this flight ➔ Choose hotel')}
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
                      <span style={{ fontWeight: 700 }}>{tx('ช่องทางจองตั๋วไฟลท์นี้:', 'Where to book this flight:')}</span>
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
                          title={tx(`จองตรงบนเว็บไซต์ทางการ ${flight.airline}`, `Book direct on the official ${flight.airline} website`)}
                        >
                          <span>{tx('🌐 เว็บทางการ', '🌐 Official site')} ({flight.airlineCode})</span>
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
                        title={tx('เช็คเที่ยวบินจริงบน Google Flights', 'Check real flights on Google Flights')}
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
                        title={tx('เช็คราคาบน Skyscanner', 'Check prices on Skyscanner')}
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
                        title={tx('เช็คโปรไฟลท์บน Trip.com', 'Check flight deals on Trip.com')}
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
                        title={tx('เช็คราคาตั๋วบินบน Agoda Flights', 'Check flight prices on Agoda Flights')}
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
                {tx('เที่ยวบินที่เลือก:', 'Selected flight:')} <strong style={{ color: '#fff' }}>{selectedFlight.airline} ({selectedFlight.flightNumber})</strong>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--vermilion)', marginTop: '2px' }}>
                {tx('ราคาตั๋วไป-กลับ:', 'Round-trip fare:')} {formatPrice(selectedFlight.basePriceTHB)} {tx(`(บินลง ${selectedFlight.to})`, `(landing at ${selectedFlight.to})`)}
              </div>
            </div>

            <button
              onClick={() => handleSelectFlightAndProceed(selectedFlightId)}
              className="btn-editorial-primary"
              style={{ padding: '10px 24px', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span>{tx('บันทึกเที่ยวบินนี้ ➔ ถัดไป: เลือกโรงแรม (Step 3)', 'Save this flight ➔ Next: Choose hotel (Step 3)')}</span>
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
                  {tx(`📅 วันที่เข้าพักอิงจากเที่ยวบินที่เลือก (${selectedFlight.airline})`, `📅 Stay dates based on your selected flight (${selectedFlight.airline})`)}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                  Check-in: <span style={{ color: '#38bdf8' }}>{selectedDateRange.start}</span> ➔ Check-out: <span style={{ color: '#38bdf8' }}>{selectedDateRange.end}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span className="editorial-tag tag-gold" style={{ fontSize: '11.5px' }}>
                  {tx(`🌙 พัก ${stayNights} คืน (${durationDays} วัน)`, `🌙 ${stayNights} nights (${durationDays} days)`)}
                </span>
                <span className="editorial-tag tag-cyan" style={{ fontSize: '11.5px' }}>
                  ✈️ {selectedFlight.airlineCode} • {tx('ลง', 'landing')} {selectedFlight.to}
                </span>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: '#34d399', fontWeight: 700 }}>
              {tx('✓ ลิงก์จอง Agoda / Booking ด้านล่างใส่วัน Check-in/Out ให้อัตโนมัติ', '✓ The Agoda / Booking links below pre-fill your check-in/out dates')}
            </div>
          </div>

          {/* Header, Search & Filter Bar */}
          <div className="bento-card" style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Hotel size={20} color="var(--vermilion)" />
                    <span>{tx('3. โรงแรม & ที่พักแนะนำ (เปรียบเทียบราคาถูกที่สุดจาก Agoda / Booking / Trip.com)', '3. Recommended Hotels & Stays (cheapest price compared across Agoda / Booking / Trip.com)')}</span>
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {tx('ค้นหาโรงแรมตามชื่อ ย่าน หรือสถานีรถไฟ พร้อมเทียบราคาเรียลไทม์จากทุกแพลตฟอร์มชั้นนำ', 'Search hotels by name, area or train station, with real-time price comparison across all major platforms')}
                  </p>
                </div>

                {/* Sort selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{tx('เรียงตาม:', 'Sort by:')}</span>
                  {[
                    { id: 'cheapest', label: tx('🏷️ ราคาถูกที่สุด', '🏷️ Lowest price') },
                    { id: 'rating', label: tx('⭐ รีวิวสูงสุด', '⭐ Top rated') },
                    { id: 'walk', label: tx('🚶 ใกล้สถานีรถไฟ', '🚶 Closest to station') },
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
                    placeholder={tx('🔍 ค้นหาโรงแรม เช่น Shinjuku, Onsen, Gracery, Ueno, ริชมอนด์, ติดสถานี...', '🔍 Search hotels e.g. Shinjuku, Onsen, Gracery, Ueno, Richmond, near station...')}
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
                  {tx('พบ', 'Found')} <strong style={{ color: '#fff' }}>{hotelTotal.toLocaleString()}</strong> {tx('โรงแรม', hotelTotal === 1 ? 'hotel' : 'hotels')}
                  {hotelOsmStatus === 'loading' && <span style={{ marginLeft: '6px', color: 'var(--sakura-pink)' }}>{tx('· กำลังดึงโรงแรมทั้งโตเกียว...', '· Fetching all Tokyo hotels...')}</span>}
                </div>
              </div>

              {/* Area Filters */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: tx('ทั้งหมด', 'All') },
                  { id: 'shinjuku', label: tx('ชินจูกุ (ยอดฮิต)', 'Shinjuku (popular)') },
                  { id: 'ueno', label: tx('อุเอโนะ (ไปสนามบินง่าย)', 'Ueno (easy airport access)') },
                  { id: 'asakusa', label: tx('อาซากุสะ', 'Asakusa') },
                  { id: 'shibuya', label: tx('ชิบูย่า', 'Shibuya') },
                  { id: 'ginza', label: tx('กินซ่า', 'Ginza') },
                  { id: 'akihabara', label: tx('อากิฮาบาระ', 'Akihabara') },
                  { id: 'ikebukuro', label: tx('อิเคบุคุโระ', 'Ikebukuro') },
                  { id: 'roppongi', label: tx('รปปงหงิ', 'Roppongi') },
                  { id: 'koto', label: tx('โคโตะ (โอจิมะ)', 'Koto (Ojima)') },
                  { id: 'kawaguchiko', label: tx('ฟูจิ/ออนเซ็น', 'Fuji / Onsen') },
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
                      alt={language === 'th' ? hotel.nameTh : hotel.nameEn}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      loading="lazy"
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(12,16,23,0.92) 0%, transparent 60%)' }} />

                    {/* Badges */}
                    <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <span className="editorial-tag tag-gold" style={{ fontSize: '11px' }}>
                        {hotel.source === 'osm'
                          ? (hotel.osmKind === 'hostel' ? tx('🛏️ โฮสเทล', '🛏️ Hostel') : hotel.osmKind === 'guest_house' ? tx('🏠 เกสต์เฮาส์', '🏠 Guest house') : tx('🏨 โรงแรม', '🏨 Hotel'))
                          : <>⭐ {language === 'th' ? hotel.tagBadge : hotelBadgeEn[hotel.tagBadge] || hotel.tagBadge}</>}
                      </span>
                      <span className="editorial-tag tag-cyan" style={{ fontSize: '11px' }}>
                        {language === 'th' ? hotel.areaTh.split('(')[0] : hotel.area}
                      </span>
                    </div>

                    {/* Best Price Aggregator Badge */}
                    <div style={{ position: 'absolute', top: '12px', right: '12px', display: hotel.source === 'osm' ? 'none' : undefined }}>
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
                        <span>🏷️ {language === 'th' ? (hotel.bestSource || hotel.bookingSource) : (hotel.bestSource || hotel.bookingSource).split('(')[0].trim()}</span>
                      </span>
                    </div>

                    <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                        {hotel.ratingScore > 0 && (
                          <span style={{ background: '#f59e0b', color: '#000', padding: '1px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                            ⭐ {hotel.ratingScore} / 10
                          </span>
                        )}
                        {hotel.starRating > 0 && (
                          <span style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.8)' }}>
                            {tx(`โรงแรม ${hotel.starRating} ดาว`, `${hotel.starRating}-star hotel`)}
                          </span>
                        )}
                        {hotel.source === 'osm' && (
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>{tx('ข้อมูลจาก OpenStreetMap', 'OpenStreetMap listing')}</span>
                        )}
                      </div>
                      <h4 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                        {language === 'th' ? hotel.nameTh : hotel.nameEn}
                      </h4>
                      {language === 'th' && (
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {hotel.nameEn}
                        </div>
                      )}
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
                        <div>🚇 {hotel.nearestStation} {tx(`(เดิน ${hotel.walkMinutesToStation} นาที)`, `(${hotel.walkMinutesToStation} min walk)`)}</div>
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
                            {tx('📊 เทียบราคาจากเวบไซต์ชั้นนำ (รวมภาษี)', '📊 Price comparison from top sites (incl. tax)')}
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
                            {isComparisonExpanded ? tx('ย่อรายละเอียด ▴', 'Show less ▴') : tx('ดูทั้งหมด ▾', 'Show all ▾')}
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
                                    {tx('🏆 ถูกที่สุด', '🏆 Lowest')}
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
                                  <span>{tx('เช็คราคาจริง', 'Check live price')}</span>
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
                      {hotel.source === 'osm' || !(hotel.lowestPriceTHB || hotel.pricePerNightTHB) ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{tx('ยังไม่มีราคา เช็กราคาจริง:', 'No price yet. Check live price:')}</div>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            <a href={getAgodaHotelSearchUrl(hotel.nameEn, selectedDateRange.start, selectedDateRange.end)} target="_blank" rel="noopener noreferrer" className="btn-editorial-secondary" style={{ padding: '3px 10px', fontSize: '11.5px' }}>Agoda ↗</a>
                            <a href={getBookingComHotelSearchUrl(hotel.nameEn, selectedDateRange.start, selectedDateRange.end)} target="_blank" rel="noopener noreferrer" className="btn-editorial-secondary" style={{ padding: '3px 10px', fontSize: '11.5px' }}>Booking ↗</a>
                          </div>
                        </div>
                      ) : (
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                          {tx('ราคาต่ำสุดจาก', 'Lowest price from')} {hotel.bestSource ? hotel.bestSource.split('(')[0].trim() : 'Agoda'}
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#34d399' }}>
                          {formatPrice(hotel.lowestPriceTHB || hotel.pricePerNightTHB)} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-secondary)' }}>/ {tx('คืน', 'night')}</span>
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '1px' }}>
                          {tx(`รวม ${stayNights} คืน:`, `Total ${stayNights} nights:`)} <strong style={{ color: '#fff' }}>{formatPrice((hotel.lowestPriceTHB || hotel.pricePerNightTHB) * stayNights)}</strong>
                        </div>
                      </div>
                      )}

                      <button
                        onClick={() => handleSelectHotelAndProceed(hotel.id)}
                        className={isSelected ? 'btn-editorial-primary' : 'btn-editorial-secondary'}
                        style={{ padding: '8px 18px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <span>{isSelected ? tx('✓ เลือกแล้ว ➔ ถัดไป', '✓ Selected ➔ Next') : tx('เลือกโรงแรมนี้ ➔ ถัดไป', 'Select this hotel ➔ Next')}</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Keyset pagination: sentinel + loading state */}
          {hotelsLoading && filteredHotels.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)', fontSize: '13px' }}>
              {tx('กำลังโหลดโรงแรม...', 'Loading hotels...')}
            </div>
          )}
          {hotelNextCursor && (
            <div ref={setHotelSentinelEl} style={{ textAlign: 'center', padding: '16px' }}>
              <button
                onClick={() => !hotelsLoadingMore && fetchHotelPage(hotelNextCursor)}
                disabled={hotelsLoadingMore}
                className="btn-editorial-secondary"
                style={{ padding: '8px 20px', fontSize: '13px' }}
              >
                {hotelsLoadingMore
                  ? tx('กำลังโหลดเพิ่ม...', 'Loading more...')
                  : tx(`โหลดเพิ่ม (แสดง ${filteredHotels.length.toLocaleString()} / ${hotelTotal.toLocaleString()})`, `Load more (${filteredHotels.length.toLocaleString()} / ${hotelTotal.toLocaleString()})`)}
              </button>
            </div>
          )}

          {/* Not in our curated list -> search the real hotel on partner sites */}
          {!hotelsLoading && (
            <div className="bento-card" style={{ padding: '16px 20px', marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: 700 }}>
                {filteredHotels.length === 0
                  ? tx(`ไม่พบ "${hotelSearchQuery}" ในรายการแนะนำ ลองค้นต่อที่:`, `No "${hotelSearchQuery}" in our curated list. Search on:`)
                  : tx('ไม่เจอโรงแรมที่ต้องการ? ค้นต่อที่:', "Can't find your hotel? Search on:")}
              </span>
              {[
                { name: 'Agoda', url: `https://www.agoda.com/search?text=${encodeURIComponent((hotelSearchQuery || 'Tokyo') + ' Tokyo')}` },
                { name: 'Booking.com', url: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent((hotelSearchQuery || 'Tokyo') + ' Tokyo')}` },
                { name: 'Google Maps', url: `https://www.google.com/maps/search/${encodeURIComponent((hotelSearchQuery || 'hotel') + ' Tokyo')}` },
              ].map((l) => (
                <a key={l.name} href={l.url} target="_blank" rel="noopener noreferrer" className="btn-editorial-secondary" style={{ padding: '5px 12px', fontSize: '12px' }}>
                  {l.name} ↗
                </a>
              ))}
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
              background: 'linear-gradient(90deg, rgba(52, 211, 153, 0.1) 0%, rgba(56, 189, 248, 0.08) 100%), var(--bg-surface)',
            }}
          >
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {tx('ฐานที่พักที่เลือก:', 'Selected stay:')} <strong style={{ color: '#fff' }}>{language === 'th' ? `${selectedHotel.nameTh} (${selectedHotel.areaTh.split('(')[0]})` : `${selectedHotel.nameEn} (${selectedHotel.area})`}</strong>
              </div>
              <div style={{ fontSize: '12px', color: '#34d399', marginTop: '2px' }}>
                {tx('ราคาต่อคืน:', 'Price per night:')} {(selectedHotel.lowestPriceTHB || selectedHotel.pricePerNightTHB) ? `${formatPrice(selectedHotel.lowestPriceTHB || selectedHotel.pricePerNightTHB)} / ${tx('คืน', 'night')}` : tx('เช็กราคาบน Agoda/Booking', 'check on Agoda/Booking')}
              </div>
            </div>

            <button
              onClick={() => handleSelectHotelAndProceed(selectedHotel.id)}
              className="btn-editorial-primary"
              style={{ padding: '10px 24px', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span>{tx('ยืนยันโรงแรมนี้ ➔ ถัดไป: ปักหมุดที่เที่ยว (Step 4)', 'Confirm this hotel ➔ Next: Pin attractions (Step 4)')}</span>
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
                    <span>{tx('4. สถานที่ท่องเที่ยวในโตเกียว และรอบนอก (Day Trips)', '4. Attractions in Tokyo & Surroundings (Day Trips)')}</span>
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {tx('ค้นหาที่เที่ยว ดูพิกัดบน Google Maps และกด `+ เพิ่มในทริป` เพื่อคำนวณการเดินทางอัตโนมัติ', 'Search attractions, view them on Google Maps and tap `+ Add to trip` to calculate travel automatically')}
                  </p>
                </div>

                {/* Filter Pills */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { id: 'all', label: tx('🌟 ทั้งหมด', '🌟 All') },
                    { id: 'tokyo', label: tx('🗼 ในโตเกียว', '🗼 In Tokyo') },
                    { id: 'nearby', label: tx('🗻 ใกล้โตเกียว (< 2 ชม.)', '🗻 Near Tokyo (< 2 hrs)') },
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
                    placeholder={tx('🔍 ค้นหาสถานที่ เช่น ชิบูย่า, ฟูจิ, วัดเซ็นโซจิ, teamLab, คามาคุระ, ช้อปปิ้ง...', '🔍 Search places e.g. Shibuya, Fuji, Senso-ji, teamLab, Kamakura, shopping...')}
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
                  {tx('พบ', 'Found')} <strong style={{ color: '#fff' }}>{filteredAttractions.length}</strong> {tx('แห่ง', filteredAttractions.length === 1 ? 'place' : 'places')}
                </div>
              </div>

              {/* Google Maps Live Search & Custom Place Adder Strip */}
              {searchQuery.trim().length > 0 && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: 'linear-gradient(90deg, rgba(56, 189, 248, 0.15) 0%, rgba(52, 211, 153, 0.12) 100%)',
                    border: '1.5px solid rgba(56, 189, 248, 0.4)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <span style={{ fontSize: '16px' }}>🗺️</span>
                    <span>
                      {tx('ค้นหาพิกัดสด:', 'Live location search:')} <strong style={{ color: '#fff' }}>"{searchQuery}"</strong> {tx('จาก Google Maps', 'from Google Maps')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <a
                      href={getGoogleMapsSearchUrl(`${searchQuery} Tokyo Japan`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-editorial-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                      title={tx('เปิดหน้าค้นหาบน Google Maps ในแท็บใหม่', 'Open search on Google Maps in a new tab')}
                    >
                      <ExternalLink size={12} />
                      <span>{tx('เปิดดูบน Google Maps', 'View on Google Maps')}</span>
                    </a>

                    <button
                      onClick={() => handleAddCustomSpotFromGoogleMaps(searchQuery)}
                      className="btn-editorial-primary"
                      style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Plus size={14} />
                      <span>{tx('+ ดึงพิกัดเพิ่มเข้าในทริปทันที', '+ Add this location to trip now')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Empty State with Direct Google Maps Integration */}
          {filteredAttractions.length === 0 && (
            <div
              className="bento-card"
              style={{
                padding: '40px 24px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                background: 'linear-gradient(180deg, rgba(255, 101, 132, 0.06) 0%, var(--bg-surface) 100%)',
              }}
            >
              <div style={{ fontSize: '40px' }}>📍</div>
              <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
                {tx(`ไม่พบ "${searchQuery}" ในแคตตาล็อกหลัก 30+ แห่ง`, `"${searchQuery}" not found in our main catalog of 30+ places`)}
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '520px', lineHeight: 1.5 }}>
                {tx('คุณสามารถดึงพิกัดสดจาก Google Maps หรือกดปักหมุดเพิ่มสถานที่นี้เข้าสู่ทริปโตเกียวของคุณได้ทันที!', 'You can pull live coordinates from Google Maps or pin this place into your Tokyo trip right away!')}
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <a
                  href={getGoogleMapsSearchUrl(`${searchQuery} Tokyo Japan`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-editorial-secondary"
                  style={{ padding: '10px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                >
                  <ExternalLink size={14} />
                  <span>{tx('🔍 ดูตำแหน่งและรีวิวบน Google Maps', '🔍 View location & reviews on Google Maps')}</span>
                </a>
                <button
                  onClick={() => handleAddCustomSpotFromGoogleMaps(searchQuery)}
                  className="btn-editorial-primary"
                  style={{ padding: '10px 22px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={16} />
                  <span>{tx(`➕ ดึงและเพิ่ม "${searchQuery}" เข้าทริปทันที`, `➕ Add "${searchQuery}" to trip now`)}</span>
                </button>
              </div>
            </div>
          )}

          {/* Attractions Grid */}
          <div className="grid-cols-3">
            {filteredAttractions.map((spot: Attraction) => {
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
                      alt={language === 'th' ? spot.nameTh : spot.nameEn}
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
                        title={tx('เปิดดูตำแหน่งบน Google Maps', 'View location on Google Maps')}
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
                        {language === 'th' ? spot.nameTh : spot.nameEn}
                      </h4>
                      {language === 'th' && (
                        <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {spot.nameEn}
                        </div>
                      )}
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
                          <span>{tx(`⏱️ จาก ${selectedHotel.areaTh.split('(')[0]}:`, `⏱️ From ${selectedHotel.area}:`)}</span>
                          <strong style={{ color: 'var(--sakura-pink)' }}>~{transit.minutes} {tx('นาที', 'min')}</strong>
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
                          <span>{tx('อยู่ในทริปแล้ว', 'In trip')}</span>
                        </>
                      ) : (
                        <>
                          <Plus size={14} />
                          <span>{tx('+ เพิ่มในทริป', '+ Add to trip')}</span>
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
                {tx('สถานที่ในทริปทั้งหมด:', 'Total places in trip:')} <strong style={{ color: '#fff' }}>{selectedSpotIds.length} {tx('แห่ง', selectedSpotIds.length === 1 ? 'place' : 'places')}</strong>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--fuji-cyan)', marginTop: '2px' }}>
                {tx(`คำนวณเส้นทางจากโรงแรม ${selectedHotel.nameTh} เรียบร้อย`, `Routes calculated from ${selectedHotel.nameEn}`)}
              </div>
            </div>

            <button
              onClick={() => setActiveSection('map')}
              className="btn-editorial-primary"
              style={{ padding: '10px 24px', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <span>{tx('ดูแผนที่ & เส้นทางระยะทาง (Step 5) ➔', 'View map & distances (Step 5) ➔')}</span>
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
                  <span>{tx('5. แผนที่ระยะทางและเวลาเดินทางจริงในโตเกียว', '5. Map, Distances & Real Travel Times in Tokyo')}</span>
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {tx(`คำนวณระยะห่างระหว่างที่พัก (${selectedHotel.nameTh}) และสถานที่ท่องเที่ยวทั้งหมด ${selectedSpotIds.length} แห่ง`, `Distances between your hotel (${selectedHotel.nameEn}) and all ${selectedSpotIds.length} selected places`)}
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
              {tx(`🗺️ แผนที่พิกัดจริงและระยะทางจากที่พักไปยังสถานที่ที่เลือก (${selectedSpotIds.length} แห่ง)`, `🗺️ Live map and distances from your hotel to selected places (${selectedSpotIds.length})`)}
            </h4>

            {/* Interactive Leaflet Map */}
            <TripMap
              hotel={selectedHotel}
              selectedAttractions={allAttractions.filter((a: Attraction) => selectedSpotIds.includes(a.id))}
              allAttractions={allAttractions}
              selectedSpotIds={selectedSpotIds}
              flight={selectedFlight}
              language={language}
            />

            {/* Distance Legend */}
            <div style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              marginTop: '14px',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              alignItems: 'center',
            }}>
              <span style={{ color: '#8b5cf6', fontWeight: 700 }}>
                🛫 = {language === 'th' ? `จุดเริ่มต้นทริป (${selectedFlight.to === 'HND' ? 'สนามบินฮาเนดะ HND' : 'สนามบินนาริตะ NRT'})` : `Trip Start (${selectedFlight.to === 'HND' ? 'Haneda HND' : 'Narita NRT'})`}
              </span>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                --- = {language === 'th' ? 'ขาที่ 0: เส้นทางเข้าเมืองสู่ที่พัก' : 'Leg 0: Airport to Hotel Transfer'}
              </span>
              <span style={{ color: '#ff3366', fontWeight: 700 }}>
                🏨 = {language === 'th' ? `ฐานที่พัก (${selectedHotel.nameTh})` : `Hotel Base (${selectedHotel.nameEn})`}
              </span>
              <span style={{ color: '#10b981', fontWeight: 700 }}>
                ● = {language === 'th' ? 'สถานที่ในทริป' : 'Trip Spots'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
              {/* Leg 0: Airport to Hotel Comprehensive Transfer Module */}
              <div
                style={{
                  padding: '20px 22px',
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(56, 189, 248, 0.1) 100%), var(--bg-surface-raised)',
                  border: '1.5px solid rgba(139, 92, 246, 0.4)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 6px 20px rgba(139, 92, 246, 0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                {/* Header Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px' }}>🛫</span>
                      <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#fff' }}>
                        {tx(`ขาเริ่มต้นทริป: การเดินทางจาก ${selectedFlight.to === 'HND' ? 'สนามบินฮาเนดะ (HND)' : 'สนามบินนาริตะ (NRT)'} ➔ โรงแรม ${selectedHotel.nameTh}`, `Trip start: Getting from ${selectedFlight.to === 'HND' ? 'Haneda Airport (HND)' : 'Narita Airport (NRT)'} ➔ ${selectedHotel.nameEn}`)}
                      </h4>
                      <span className="editorial-tag tag-purple" style={{ fontSize: '11px', fontWeight: 800 }}>
                        LEG 0 • AIRPORT TRANSFER
                      </span>
                    </div>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      {tx('เที่ยวบิน:', 'Flight:')} <strong style={{ color: '#fff' }}>{selectedFlight.airline} ({selectedFlight.flightNumber})</strong> • {tx('ปลายทาง:', 'Destination:')} <strong style={{ color: '#38bdf8' }}>{language === 'th' ? `ย่าน${selectedHotel.areaTh.split('(')[0]} (${selectedHotel.nameTh})` : `${selectedHotel.area} (${selectedHotel.nameEn})`}</strong>
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <a
                      href={getGoogleMapsSearchUrl(`${selectedFlight.to === 'HND' ? 'Haneda Airport' : 'Narita Airport'} to ${selectedHotel.nameEn} Tokyo`)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-editorial-primary"
                      style={{ padding: '7px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                      title={tx('ดูเส้นทางและตารางเวลาสดบน Google Maps', 'See live routes and timetables on Google Maps')}
                    >
                      <ExternalLink size={13} />
                      <span>{tx('เปิดเส้นทางสดบน Google Maps', 'Open live route on Google Maps')}</span>
                    </a>
                  </div>
                </div>

                {/* 3 Travel Modes Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  {/* Mode 1: Express Train */}
                  <div
                    style={{
                      background: 'rgba(12, 16, 23, 0.65)',
                      padding: '14px',
                      borderRadius: '8px',
                      border: '1px solid rgba(56, 189, 248, 0.3)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontWeight: 800, color: '#38bdf8', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{tx('🚄 รถไฟด่วน (เร็วสุด)', '🚄 Express train (fastest)')}</span>
                      </div>
                      <span className="editorial-tag tag-green" style={{ fontSize: '10.5px' }}>
                        {tx('แนะนำ ⭐', 'Recommended ⭐')}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#fff', lineHeight: 1.4 }}>
                      {selectedFlight.to === 'HND' ? (
                        <>
                          • <strong>Tokyo Monorail:</strong> {tx('13 นาทีสู่ Hamamatsucho (¥500) ต่อ Yamanote Line', '13 min to Hamamatsucho (¥500), then Yamanote Line')}<br />
                          • <strong>Keikyu Airport:</strong> {tx('11 นาทีสู่ Shinagawa / ยิงตรงสาย Asakusa Line (¥330)', '11 min to Shinagawa / through service to Asakusa Line (¥330)')}
                        </>
                      ) : selectedHotel.area.toLowerCase() === 'ueno' || selectedHotel.area.toLowerCase() === 'asakusa' ? (
                        <>
                          • <strong>Keisei Skyliner:</strong> {tx('41 นาที ยิงตรงลง Keisei Ueno (¥2,570) เร็วที่สุด!', '41 min direct to Keisei Ueno (¥2,570), the fastest!')}<br />
                          • <strong>Access Express:</strong> {tx('55 นาที ยิงตรงลง Asakusa (¥1,410) ประหยัด', '55 min direct to Asakusa (¥1,410), budget-friendly')}
                        </>
                      ) : (
                        <>
                          • <strong>JR Narita Express (N'EX):</strong> {tx('55-65 นาที ยิงตรง Shinjuku/Shibuya/Tokyo (¥3,250) ไม่ต้องยกกระเป๋าเปลี่ยนขบวน', '55-65 min direct to Shinjuku/Shibuya/Tokyo (¥3,250), no train changes with luggage')}<br />
                          • <strong>Keisei Skyliner:</strong> {tx('36 นาทีลง Nippori ต่อ Yamanote Line (¥2,570)', '36 min to Nippori, then Yamanote Line (¥2,570)')}
                        </>
                      )}
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
                      {tx('⏱️ เวลา:', '⏱️ Time:')} ~{selectedFlight.to === 'HND' ? '20-30' : '41-55'} {tx('นาที', 'min')} • {tx('ค่าตั๋ว:', 'Fare:')} ~{selectedFlight.to === 'HND' ? '¥330-500' : '¥2,570-3,250'}
                    </div>
                  </div>

                  {/* Mode 2: Limousine Bus */}
                  <div
                    style={{
                      background: 'rgba(12, 16, 23, 0.65)',
                      padding: '14px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontWeight: 800, color: '#f59e0b', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>🚌 Airport Limousine Bus</span>
                      </div>
                      <span className="editorial-tag tag-purple" style={{ fontSize: '10.5px' }}>
                        {tx('สัมภาระเยอะ 🧳', 'Lots of luggage 🧳')}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#fff', lineHeight: 1.4 }}>
                      • {tx('รถบัสปรับอากาศ VIP มีที่เก็บกระเป๋าใต้ท้องรถ 2 ใบ/คน', 'Air-conditioned VIP bus with underfloor luggage storage, 2 bags per person')}<br />
                      • {tx('จอดส่งตรงถึงหน้าโรงแรมใหญ่และสถานีหลัก (Shinjuku West, Ginza, Tokyo Stn, Shibuya)', 'Drops off right at major hotels and main stations (Shinjuku West, Ginza, Tokyo Stn, Shibuya)')}<br />
                      • {tx('ไม่ต้องลากกระเป๋าขึ้น-ลงบันไดสถานีรถไฟ', 'No dragging luggage up and down station stairs')}
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
                      {tx('⏱️ เวลา:', '⏱️ Time:')} ~{selectedFlight.to === 'HND' ? '35-45' : '85-100'} {tx('นาที', 'min')} • {tx('ค่าโดยสาร:', 'Fare:')} ~{selectedFlight.to === 'HND' ? '¥1,400' : '¥3,200'}
                    </div>
                  </div>

                  {/* Mode 3: Recommended Pass / IC Card */}
                  <div
                    style={{
                      background: 'rgba(12, 16, 23, 0.65)',
                      padding: '14px',
                      borderRadius: '8px',
                      border: '1px solid rgba(52, 211, 153, 0.3)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontWeight: 800, color: '#34d399', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{tx('🎫 บัตรโดยสาร & พาสแนะนำ', '🎫 Recommended passes & IC cards')}</span>
                      </div>
                      <span className="editorial-tag tag-cyan" style={{ fontSize: '10.5px' }}>
                        MUST HAVE
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#fff', lineHeight: 1.4 }}>
                      • <strong>Welcome Suica / Pasmo Passport:</strong> {tx('แตะขึ้นรถไฟทุกสายในโตเกียวได้ทันที', 'tap on and ride every train line in Tokyo right away')}<br />
                      • <strong>Tokyo Subway 72hr Ticket:</strong> {tx('ขึ้น Tokyo Metro + Toei Subway ไม่จำกัดเที่ยว (¥1,500)', 'unlimited Tokyo Metro + Toei Subway rides (¥1,500)')}<br />
                      • {tx('แนะนำเพิ่ม Suica เข้า Apple Wallet / Google Wallet ก่อนบิน', 'Tip: add Suica to Apple Wallet / Google Wallet before your flight')}
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
                      {tx('💡 แตะผ่านช่องตรวจตั๋วได้รวดเร็ว ไม่ต้องต่อคิวซื้อเหรียญ', '💡 Tap through ticket gates quickly, no queuing to buy tickets')}
                    </div>
                  </div>
                </div>

                {/* Specific Hotel Arrival Recommendation */}
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '6px',
                    background: 'rgba(168, 85, 247, 0.1)',
                    border: '1px solid rgba(168, 85, 247, 0.25)',
                    fontSize: '12.5px',
                    color: '#e9d5ff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span style={{ fontSize: '16px' }}>💡</span>
                  <span>
                    <strong>{language === 'th' ? `คำแนะนำสำหรับ ${selectedHotel.nameTh} (${selectedHotel.areaTh.split('(')[0]}):` : `Tip for ${selectedHotel.nameEn} (${selectedHotel.area}):`}</strong>{' '}
                    {selectedFlight.to === 'HND'
                      ? tx(`นั่ง Tokyo Monorail 13 นาทีลง Hamamatsucho ต่อรถไฟสาย Yamanote Line มายังสถานี ${selectedHotel.nearestStation} เดินต่อเพียง ${selectedHotel.walkMinutesToStation} นาที`, `Take the Tokyo Monorail 13 min to Hamamatsucho, then the Yamanote Line to ${selectedHotel.nearestStation}, and walk just ${selectedHotel.walkMinutesToStation} min.`)
                      : selectedHotel.area.toLowerCase() === 'ueno'
                      ? tx(`นั่ง Keisei Skyliner 41 นาทีรวดเดียวถึง Keisei Ueno Station เดินข้ามถนน 3 นาทีถึงโรงแรมทันที!`, `Take the Keisei Skyliner 41 min straight to Keisei Ueno Station, then a 3-minute walk across the street to the hotel!`)
                      : selectedHotel.area.toLowerCase() === 'shinjuku'
                      ? tx(`นั่ง JR Narita Express (N'EX) ยิงตรงถึง Shinjuku Station ทางออก East Exit แล้วเดิน 5 นาทีเข้าโรงแรม สะดวกสุดไม่ต้องยกกระเป๋าเปลี่ยนสาย`, `Take the JR Narita Express (N'EX) direct to Shinjuku Station East Exit, then walk 5 min to the hotel. Most convenient, no changing trains with luggage.`)
                      : tx(`นั่ง Keisei Skyliner 36 นาทีลงสถานี Nippori แล้วต่อ JR Yamanote Line มายังสถานี ${selectedHotel.nearestStation}`, `Take the Keisei Skyliner 36 min to Nippori Station, then the JR Yamanote Line to ${selectedHotel.nearestStation}.`)}
                  </span>
                </div>
              </div>

              {/* Legs 1..N: Hotel to Attractions */}
              {selectedSpotIds.map((spotId) => {
                const spot = allAttractions.find((a: Attraction) => a.id === spotId);
                if (!spot) return null;
                const transit = calculateTransitFromHotel(selectedHotel.area, spot.area, spot.nameTh);
                const gmapsUrl = getGoogleMapsSearchUrl(`${spot.nameEn} ${spot.nameJp || ''} ${spot.city} Japan`);

                return (
                  <div
                    key={spot.id}
                    className="responsive-transit-row"
                    style={{
                      padding: '14px 18px',
                      background: 'var(--bg-surface-raised)',
                      border: '1px solid var(--border-hairline)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>📍 {language === 'th' ? spot.nameTh : spot.nameEn}</span>
                        <a href={gmapsUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--fuji-cyan)', display: 'inline-flex' }}>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                        {spot.area} • {tx('ใกล้', 'near')} {spot.nearestStation}
                      </div>
                    </div>

                    <div>
                      <span className="editorial-tag tag-red" style={{ fontSize: '12px', fontWeight: 700 }}>
                        ⏱️ ~{transit.minutes} {tx('นาที', 'min')}
                      </span>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginTop: '3px' }}>
                        {tx('ระยะทาง:', 'Distance:')} ~{transit.distanceKm} {tx('กม.', 'km')}
                      </div>
                    </div>

                    <div style={{ fontSize: '12.5px', color: 'var(--fuji-cyan)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Train size={14} />
                      <span>{transit.trainLine}</span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span className="editorial-tag tag-green" style={{ fontSize: '11px' }}>
                        {tx('สะดวก', 'Convenience')} {transit.convenienceScore}%
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
