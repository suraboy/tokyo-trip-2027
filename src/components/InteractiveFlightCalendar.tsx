'use client';

import React, { useState, useMemo } from 'react';
import { MonthData, Currency, Language } from '@/types/travel';
import { MONTHS_DATA } from '@/data/mockData';
import { useJpyThbRate } from '@/hooks/useJpyThbRate';
import { useI18n } from '@/utils/i18n';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles,
  Plane,
  Clock,
  Info,
  Check,
  Award,
  CalendarDays,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { getGoogleFlightsUrl, getSkyscannerFlightUrl, getTripComFlightUrl, getAgodaFlightUrl } from '@/utils/bookingLinks';

interface InteractiveFlightCalendarProps {
  selectedMonthIndex?: number; // 0-11
  onSelectMonthIndex?: (index: number) => void;
  selectedRange: { start: string; end: string };
  onSelectRange: (range: { start: string; end: string }, durationDays: number) => void;
  currency?: Currency;
  language?: Language;
}

// Special events & season milestones across 2026-2028
const SPECIAL_EVENTS: Record<string, { label: string; labelEn: string; tagColor: string; type: 'sakura' | 'autumn' | 'holiday' | 'festival' }> = {
  // 2026 Autumn / Winter
  '2026-10-31': { label: '🎃 ฮาโลวีนชิบูย่า', labelEn: '🎃 Shibuya Halloween', tagColor: '#f97316', type: 'festival' },
  '2026-11-15': { label: '🍁 Momiji Tokyo พีค', labelEn: '🍁 Tokyo Momiji Peak', tagColor: '#ef4444', type: 'autumn' },
  '2026-11-20': { label: '🍂 แปะก๊วยสีทอง', labelEn: '🍂 Golden Ginkgo', tagColor: '#eab308', type: 'autumn' },
  '2026-12-25': { label: '🎄 คริสต์มาส', labelEn: '🎄 Christmas', tagColor: '#38bdf8', type: 'festival' },
  '2026-12-31': { label: '🎆 เค้าท์ดาวน์ปีใหม่', labelEn: '🎆 New Year Countdown', tagColor: '#ec4899', type: 'holiday' },

  // 2027 Full Year
  '2027-01-01': { label: '🎍 วันปีใหม่', labelEn: '🎍 New Year Day', tagColor: '#ef4444', type: 'holiday' },
  '2027-02-14': { label: '💝 วาเลนไทน์', labelEn: '💝 Valentine Day', tagColor: '#ec4899', type: 'festival' },
  '2027-03-24': { label: '🌸 ซากุระเริ่มบาน', labelEn: '🌸 Sakura Starts Blooming', tagColor: '#f472b6', type: 'sakura' },
  '2027-03-28': { label: '🌸 ซากุระ Full Bloom', labelEn: '🌸 Sakura Full Bloom', tagColor: '#ec4899', type: 'sakura' },
  '2027-04-12': { label: '🇹🇭 หยุดสงกรานต์', labelEn: '🇹🇭 Songkran Holiday', tagColor: '#f59e0b', type: 'holiday' },
  '2027-04-13': { label: '🇹🇭 สงกรานต์', labelEn: '🇹🇭 Songkran', tagColor: '#f59e0b', type: 'holiday' },
  '2027-04-14': { label: '🇹🇭 สงกรานต์', labelEn: '🇹🇭 Songkran', tagColor: '#f59e0b', type: 'holiday' },
  '2027-04-29': { label: '🎌 Showa Day', labelEn: '🎌 Showa Day', tagColor: '#a855f7', type: 'holiday' },
  '2027-05-03': { label: '🎌 Golden Week', labelEn: '🎌 Golden Week', tagColor: '#a855f7', type: 'holiday' },
  '2027-05-04': { label: '🎌 Greenery Day', labelEn: '🎌 Greenery Day', tagColor: '#a855f7', type: 'holiday' },
  '2027-05-05': { label: '🎌 Children Day', labelEn: '🎌 Children Day', tagColor: '#a855f7', type: 'holiday' },
  '2027-07-24': { label: '🎆 พลุสุมิดะ', labelEn: '🎆 Sumida Fireworks', tagColor: '#38bdf8', type: 'festival' },
  '2027-08-13': { label: '🎌 เทศกาลโอบ้ง', labelEn: '🎌 Obon Festival', tagColor: '#f59e0b', type: 'holiday' },
  '2027-10-31': { label: '🎃 ฮาโลวีนชิบูย่า', labelEn: '🎃 Shibuya Halloween', tagColor: '#f97316', type: 'festival' },
  '2027-11-12': { label: '🍁 ใบไม้แดงฟูจิพีค', labelEn: '🍁 Fuji Autumn Leaves Peak', tagColor: '#ef4444', type: 'autumn' },
  '2027-11-15': { label: '🍁 Momiji Tokyo พีค', labelEn: '🍁 Tokyo Momiji Peak', tagColor: '#ef4444', type: 'autumn' },
  '2027-11-20': { label: '🍂 แปะก๊วยสีทอง', labelEn: '🍂 Golden Ginkgo', tagColor: '#eab308', type: 'autumn' },
  '2027-12-24': { label: '🎄 คริสต์มาสอีฟ', labelEn: '🎄 Christmas Eve', tagColor: '#38bdf8', type: 'festival' },
  '2027-12-25': { label: '🎄 คริสต์มาส', labelEn: '🎄 Christmas', tagColor: '#38bdf8', type: 'festival' },
  '2027-12-31': { label: '🎆 เค้าท์ดาวน์ปีใหม่', labelEn: '🎆 New Year Countdown', tagColor: '#ec4899', type: 'holiday' },

  // 2028 Start
  '2028-01-01': { label: '🎍 วันปีใหม่ 2028', labelEn: '🎍 New Year 2028', tagColor: '#ef4444', type: 'holiday' },
  '2028-03-25': { label: '🌸 ซากุระ 2028', labelEn: '🌸 Sakura 2028', tagColor: '#f472b6', type: 'sakura' },
  '2028-04-13': { label: '🇹🇭 สงกรานต์ 2028', labelEn: '🇹🇭 Songkran 2028', tagColor: '#f59e0b', type: 'holiday' },
};

// Calculate Round-Trip (ไป-กลับ) and One-Way estimated flight price for specific date across 1 year
function getEstimatedDayFlightPrice(year: number, month: number, day: number, dayOfWeek: number): {
  roundTripPriceTHB: number;
  oneWayPriceTHB: number;
  tier: 'low' | 'mid' | 'high' | 'peak';
} {
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const monthData = MONTHS_DATA[month - 1];
  const baseMonthlyMin = monthData?.flightPriceRangeTHB?.min || 9800;

  let multiplier = 1.0;

  // Weekend surcharges (Fri, Sat, Sun departures)
  if (dayOfWeek === 5 || dayOfWeek === 6) {
    multiplier += 0.20; // Friday / Saturday peak
  } else if (dayOfWeek === 0) {
    multiplier += 0.12; // Sunday
  } else if (dayOfWeek === 2 || dayOfWeek === 3) {
    multiplier -= 0.08; // Tuesday / Wednesday discount (Cheapest)
  }

  // Holiday / Special events spike
  if (SPECIAL_EVENTS[dateStr]) {
    multiplier += 0.30;
  }

  // Songkran (April 10-17)
  if (month === 4 && day >= 10 && day <= 17) {
    multiplier += 0.50;
  }
  // Golden week (April 29 - May 6)
  if ((month === 4 && day >= 29) || (month === 5 && day <= 6)) {
    multiplier += 0.38;
  }
  // New Year Countdown (Dec 25 - Jan 3)
  if (month === 12 && day >= 25) {
    multiplier += 0.55;
  }

  const finalRoundTrip = Math.round((baseMonthlyMin * multiplier) / 100) * 100;
  const finalOneWay = Math.round(finalRoundTrip / 2 / 50) * 50;

  let tier: 'low' | 'mid' | 'high' | 'peak' = 'mid';
  if (finalRoundTrip <= 10000) tier = 'low';
  else if (finalRoundTrip <= 13500) tier = 'mid';
  else if (finalRoundTrip <= 16500) tier = 'high';
  else tier = 'peak';

  return { roundTripPriceTHB: finalRoundTrip, oneWayPriceTHB: finalOneWay, tier };
}

export const InteractiveFlightCalendar: React.FC<InteractiveFlightCalendarProps> = ({
  selectedMonthIndex = 10,
  onSelectMonthIndex,
  selectedRange,
  onSelectRange,
  currency = 'THB',
  language = 'th',
}) => {
  const JPY_TO_THB_RATE = useJpyThbRate();
  const tr = (th: string, en: string) => (language === 'th' ? th : en);
  const locale = language === 'th' ? 'th-TH' : 'en-US';
  // Today reference
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => {
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [today]);

  // Current viewing Year & Month
  const [viewYear, setViewYear] = useState<number>(2027);
  const [viewMonth, setViewMonth] = useState<number>(selectedMonthIndex + 1); // 1-12

  // Sync view to trip start ONLY when the trip start date changes.
  // (Old bug: effect also depended on selectedMonthIndex, so every month-pill click
  // re-ran it and snapped the view back to the locked trip month.)
  React.useEffect(() => {
    if (selectedRange?.start) {
      const parts = selectedRange.start.split('-');
      if (parts.length >= 2) {
        const yr = parseInt(parts[0], 10);
        const mo = parseInt(parts[1], 10);
        if (!isNaN(yr) && !isNaN(mo)) {
          setViewYear(yr);
          setViewMonth(mo);
        }
      }
    }
  }, [selectedRange?.start]);

  // External month-index change from parent: only follow if differs from current view
  const prevMonthIdxRef = React.useRef(selectedMonthIndex);
  React.useEffect(() => {
    if (prevMonthIdxRef.current === selectedMonthIndex) return;
    prevMonthIdxRef.current = selectedMonthIndex;
    if (selectedMonthIndex !== undefined) {
      setViewMonth(selectedMonthIndex + 1);
    }
  }, [selectedMonthIndex]);

  // Selected range month meta
  const selectedRangeMonthInfo = useMemo(() => {
    if (!selectedRange?.start) return null;
    const parts = selectedRange.start.split('-');
    if (parts.length >= 2) {
      const yr = parseInt(parts[0], 10);
      const mo = parseInt(parts[1], 10);
      const mData = MONTHS_DATA[mo - 1];
      return {
        year: yr,
        month: mo,
        monthNameTh: mData ? mData.nameTh : '',
        monthNameEn: mData ? mData.nameEn : '',
        isCurrentView: yr === viewYear && mo === viewMonth,
      };
    }
    return null;
  }, [selectedRange, viewYear, viewMonth]);

  // Set of months that intersect with the selected trip range
  const selectedTripMonths = useMemo(() => {
    if (!selectedRange?.start || !selectedRange?.end) return new Set<string>();
    const set = new Set<string>();
    const startParts = selectedRange.start.split('-');
    const endParts = selectedRange.end.split('-');
    const startY = parseInt(startParts[0], 10);
    const startM = parseInt(startParts[1], 10);
    const endY = parseInt(endParts[0], 10);
    const endM = parseInt(endParts[1], 10);
    const sVal = startY * 12 + (startM - 1);
    const eVal = endY * 12 + (endM - 1);
    for (let v = sVal; v <= eVal; v++) {
      const y = Math.floor(v / 12);
      const m = (v % 12) + 1;
      set.add(`${y}-${m}`);
    }
    return set;
  }, [selectedRange]);

  // 1-Year (16-Months Rolling) List starting from current month
  const rollingMonths = useMemo(() => {
    const list: Array<{ year: number; month: number; monthData: MonthData; labelTh: string; labelEn: string }> = [];
    const startYear = today.getFullYear();
    const startMonth = today.getMonth() + 1; // 1-12

    // 16 months forward window
    for (let i = 0; i < 16; i++) {
      let targetM = startMonth + i;
      let targetY = startYear;
      while (targetM > 12) {
        targetM -= 12;
        targetY += 1;
      }
      const mData = MONTHS_DATA[targetM - 1];
      list.push({
        year: targetY,
        month: targetM,
        monthData: mData,
        labelTh: `${mData.nameTh} ${targetY}`,
        labelEn: `${mData.nameEn} ${targetY}`,
      });
    }
    return list;
  }, [today]);

  // Selection interaction state
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [selectingStart, setSelectingStart] = useState<string | null>(null);

  const currentMonthData = MONTHS_DATA[viewMonth - 1] || MONTHS_DATA[10];

  // Generate complete calendar days for viewYear & viewMonth (including previous and next month adjacent days)
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
    const firstDayOfWeek = new Date(viewYear, viewMonth - 1, 1).getDay();

    const days: Array<{
      dateStr: string;
      day: number;
      dayOfWeek: number;
      month: number;
      year: number;
      isCurrentMonth: boolean;
      monthLabel?: string;
      isPast: boolean;
      isToday: boolean;
      roundTripPrice: number;
      oneWayPrice: number;
      priceTier: 'low' | 'mid' | 'high' | 'peak';
      specialEvent?: { label: string; labelEn: string; tagColor: string; type: string };
    }> = [];

    // 1. Previous month trailing days (e.g. Feb 28 on Sunday when viewing March)
    const prevMonth = viewMonth === 1 ? 12 : viewMonth - 1;
    const prevYear = viewMonth === 1 ? viewYear - 1 : viewYear;
    const prevMonthDays = new Date(prevYear, prevMonth, 0).getDate();
    const prevMData = MONTHS_DATA[prevMonth - 1];

    for (let i = 0; i < firstDayOfWeek; i++) {
      const dayNum = prevMonthDays - firstDayOfWeek + 1 + i;
      const dateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayOfWeek = i;
      const { roundTripPriceTHB, oneWayPriceTHB, tier } = getEstimatedDayFlightPrice(prevYear, prevMonth, dayNum, dayOfWeek);
      const specialEvent = SPECIAL_EVENTS[dateStr];
      const isPast = dateStr < todayStr;
      const isToday = dateStr === todayStr;

      days.push({
        dateStr,
        day: dayNum,
        dayOfWeek,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
        monthLabel: prevMData ? (language === 'th' ? prevMData.nameTh.slice(0, 3) : prevMData.nameEn.slice(0, 3)) : '',
        isPast,
        isToday,
        roundTripPrice: roundTripPriceTHB,
        oneWayPrice: oneWayPriceTHB,
        priceTier: tier,
        specialEvent,
      });
    }

    // 2. Days in current viewing month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayOfWeek = (firstDayOfWeek + day - 1) % 7;
      const { roundTripPriceTHB, oneWayPriceTHB, tier } = getEstimatedDayFlightPrice(viewYear, viewMonth, day, dayOfWeek);
      const specialEvent = SPECIAL_EVENTS[dateStr];
      const isPast = dateStr < todayStr;
      const isToday = dateStr === todayStr;

      days.push({
        dateStr,
        day,
        dayOfWeek,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true,
        isPast,
        isToday,
        roundTripPrice: roundTripPriceTHB,
        oneWayPrice: oneWayPriceTHB,
        priceTier: tier,
        specialEvent,
      });
    }

    // 3. Next month leading days (to complete the full week and guarantee at least 35 slots)
    const nextMonth = viewMonth === 12 ? 1 : viewMonth + 1;
    const nextYear = viewMonth === 12 ? viewYear + 1 : viewYear;
    const nextMData = MONTHS_DATA[nextMonth - 1];

    const totalDaysSoFar = days.length;
    const remainder = totalDaysSoFar % 7;
    let neededTrailing = remainder === 0 ? 0 : 7 - remainder;
    if (totalDaysSoFar + neededTrailing < 35) {
      neededTrailing += 7;
    }

    for (let d = 1; d <= neededTrailing; d++) {
      const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeek = (firstDayOfWeek + daysInMonth + d - 1) % 7;
      const { roundTripPriceTHB, oneWayPriceTHB, tier } = getEstimatedDayFlightPrice(nextYear, nextMonth, d, dayOfWeek);
      const specialEvent = SPECIAL_EVENTS[dateStr];
      const isPast = dateStr < todayStr;
      const isToday = dateStr === todayStr;

      days.push({
        dateStr,
        day: d,
        dayOfWeek,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
        monthLabel: nextMData ? (language === 'th' ? nextMData.nameTh.slice(0, 3) : nextMData.nameEn.slice(0, 3)) : '',
        isPast,
        isToday,
        roundTripPrice: roundTripPriceTHB,
        oneWayPrice: oneWayPriceTHB,
        priceTier: tier,
        specialEvent,
      });
    }

    return days;
  }, [viewYear, viewMonth, todayStr, language]);

  // Check if the selected trip range is visible in the current calendar view (including adjacent days)
  const isTripInCurrentView = useMemo(() => {
    if (!selectedRange?.start || !selectedRange?.end) return false;
    if (calendarDays.length === 0) return false;
    const firstVisible = calendarDays[0]?.dateStr;
    const lastVisible = calendarDays[calendarDays.length - 1]?.dateStr;
    if (!firstVisible || !lastVisible) return false;
    return selectedRange.start <= lastVisible && selectedRange.end >= firstVisible;
  }, [selectedRange, calendarDays]);

  const handlePrevMonth = () => {
    let newM = viewMonth - 1;
    let newY = viewYear;
    if (newM < 1) {
      newM = 12;
      newY -= 1;
    }
    setViewMonth(newM);
    setViewYear(newY);
    if (onSelectMonthIndex) onSelectMonthIndex(newM - 1);
  };

  const handleNextMonth = () => {
    let newM = viewMonth + 1;
    let newY = viewYear;
    if (newM > 12) {
      newM = 1;
      newY += 1;
    }
    setViewMonth(newM);
    setViewYear(newY);
    if (onSelectMonthIndex) onSelectMonthIndex(newM - 1);
  };

  const handleDateClick = (dateStr: string, isPast: boolean) => {
    if (isPast) return; // Cannot select past dates

    if (!selectingStart) {
      // First click: set start date
      setSelectingStart(dateStr);
    } else {
      // Second click: finish range
      let start = selectingStart;
      let end = dateStr;

      if (new Date(start) > new Date(end)) {
        [start, end] = [end, start];
      }

      const diffTime = Math.abs(new Date(end).getTime() - new Date(start).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      onSelectRange({ start, end }, diffDays);
      setSelectingStart(null);
    }
  };

  const isRangeStart = (dateStr: string) => {
    if (selectingStart) return selectingStart === dateStr;
    return selectedRange?.start === dateStr;
  };

  const isRangeEnd = (dateStr: string) => {
    if (selectingStart) return false;
    return selectedRange?.end === dateStr;
  };

  const isInRange = (dateStr: string) => {
    if (selectingStart) return false;
    if (!selectedRange?.start || !selectedRange?.end) return false;
    return dateStr > selectedRange.start && dateStr < selectedRange.end;
  };

  const isInHoverRange = (dateStr: string) => {
    if (!selectingStart || !hoverDate) return false;
    const min = selectingStart < hoverDate ? selectingStart : hoverDate;
    const max = selectingStart < hoverDate ? hoverDate : selectingStart;
    return dateStr >= min && dateStr <= max;
  };

  const getTripDayInfo = (dateStr: string) => {
    if (!selectedRange?.start || !selectedRange?.end) return null;
    if (dateStr < selectedRange.start || dateStr > selectedRange.end) return null;
    const startMs = new Date(selectedRange.start).getTime();
    const curMs = new Date(dateStr).getTime();
    const endMs = new Date(selectedRange.end).getTime();
    const dayIdx = Math.round((curMs - startMs) / (1000 * 60 * 60 * 24)) + 1;
    const totalDays = Math.round((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1;
    return { dayIdx, totalDays };
  };

  // Format currency
  const formatPrice = (thb: number) => {
    if (currency === 'THB') return `฿${thb.toLocaleString()}`;
    return `¥${Math.round(thb / JPY_TO_THB_RATE).toLocaleString()}`;
  };

  // Calculate selected range total flight estimate (Round-Trip)
  const rangeFlightEstimate = useMemo(() => {
    if (!selectedRange || !selectedRange.start || !selectedRange.end) return null;
    const sDate = new Date(selectedRange.start);
    const eDate = new Date(selectedRange.end);
    const sPrice = getEstimatedDayFlightPrice(sDate.getFullYear(), sDate.getMonth() + 1, sDate.getDate(), sDate.getDay());
    const ePrice = getEstimatedDayFlightPrice(eDate.getFullYear(), eDate.getMonth() + 1, eDate.getDate(), eDate.getDay());
    const totalRoundTrip = sPrice.oneWayPriceTHB + ePrice.oneWayPriceTHB;
    return {
      departPrice: sPrice.oneWayPriceTHB,
      returnPrice: ePrice.oneWayPriceTHB,
      totalRoundTrip,
    };
  }, [selectedRange]);

  const daysOfWeek = language === 'th'
    ? ['อา. Sun', 'จ. Mon', 'อ. Tue', 'พ. Wed', 'พฤ. Thu', 'ศ. Fri', 'ส. Sat']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Calendar Card Container */}
      <div
        className="bento-card"
        style={{
          padding: '24px',
          background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-surface-raised) 100%)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        {/* Month Selector & Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            marginBottom: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--vermilion) 0%, #ff3366 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 14px var(--vermilion-glow)',
              }}
            >
              <Calendar size={24} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
                  {language === 'th' ? `${currentMonthData.nameTh} ${viewYear} (${currentMonthData.nameEn} ${viewYear})` : `${currentMonthData.nameEn} ${viewYear}`}
                </h3>
                <span
                  style={{
                    background: currentMonthData.overallScore >= 90 ? 'rgba(52, 211, 153, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                    color: currentMonthData.overallScore >= 90 ? '#34d399' : '#38bdf8',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '11.5px',
                    fontWeight: 800,
                  }}
                >
                  ⭐ {currentMonthData.overallScore}/100
                </span>
                <span className="editorial-tag tag-green" style={{ fontSize: '11px', fontWeight: 800 }}>
                  {tr('✈️ แสดงราคาตั๋วบินไป-กลับ (Round-Trip)', '✈️ Showing round-trip flight prices')}
                </span>
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--sakura-pink)', fontWeight: 600, marginTop: '2px' }}>
                {tr(currentMonthData.seasonTh, currentMonthData.seasonEn)} • 🌡️ {currentMonthData.avgTempC.min}°C - {currentMonthData.avgTempC.max}°C • 🌧️ {tr(`ฝน ${currentMonthData.rainyDays} วัน`, `${currentMonthData.rainyDays} rainy days`)}
              </div>
            </div>
          </div>

          {/* Month Stepper Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {selectedRangeMonthInfo && !isTripInCurrentView && (
              <button
                onClick={() => {
                  setViewYear(selectedRangeMonthInfo.year);
                  setViewMonth(selectedRangeMonthInfo.month);
                  if (onSelectMonthIndex) onSelectMonthIndex(selectedRangeMonthInfo.month - 1);
                }}
                className="btn-editorial-primary"
                style={{
                  padding: '7px 14px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 0 14px var(--vermilion-glow)',
                }}
                title={tr('กระโดดไปดูเดือนที่เลือกวันเดินทางไว้', 'Jump to the month of your selected dates')}
              >
                <span>{tr('🎯 ดูไฮไลท์เดือนที่เลือก', '🎯 View selected month')} ({tr(selectedRangeMonthInfo.monthNameTh, selectedRangeMonthInfo.monthNameEn).slice(0, 3)} {String(selectedRangeMonthInfo.year).slice(2)})</span>
              </button>
            )}

            <button
              onClick={handlePrevMonth}
              className="btn-editorial-secondary"
              style={{ padding: '8px 14px', fontSize: '13px' }}
              aria-label="Previous Month"
            >
              <ChevronLeft size={16} />
              <span>{tr('เดือนก่อน', 'Previous')}</span>
            </button>

            {/* Quick jump to Today */}
            <button
              onClick={() => {
                setViewYear(today.getFullYear());
                setViewMonth(today.getMonth() + 1);
                if (onSelectMonthIndex) onSelectMonthIndex(today.getMonth());
              }}
              className="btn-editorial-secondary"
              style={{ padding: '8px 12px', fontSize: '12px' }}
              title={tr('กลับมาเดือนปัจจุบัน', 'Back to the current month')}
            >
              <span>{tr('📍 เดือนนี้', '📍 This month')}</span>
            </button>

            {/* Quick jump to 2027 Autumn peak */}
            <button
              onClick={() => {
                setViewYear(2027);
                setViewMonth(11);
                if (onSelectMonthIndex) onSelectMonthIndex(10);
              }}
              className="btn-editorial-secondary"
              style={{ padding: '8px 12px', fontSize: '12px' }}
              title={tr('กระโดดไปช่วงยอดนิยม พ.ย. 2027', 'Jump to popular season, Nov 2027')}
            >
              <span>{tr('🍁 พ.ย. 2027', '🍁 Nov 2027')}</span>
            </button>

            <button
              onClick={handleNextMonth}
              className="btn-editorial-secondary"
              style={{ padding: '8px 14px', fontSize: '13px' }}
              aria-label="Next Month"
            >
              <span>{tr('เดือนถัดไป', 'Next')}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* 1-Year (16-Months Rolling) Quick Jumper Strip */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 700, marginBottom: '6px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
            <span>{tr('📆 แถบเลือกเดือน 1 ปีเต็มจากวันนี้ (กดเปลี่ยนเดือนได้ทันที):', '📆 Month picker for the next full year (tap to switch instantly):')}</span>
            <span style={{ color: 'var(--sakura-pink)' }}>
              {selectedRange?.start && selectedRange?.end && (
                <span>{tr('📍 ทริปที่เลือก:', '📍 Selected trip:')} {selectedRange.start} {tr('ถึง', 'to')} {selectedRange.end}</span>
              )}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              paddingBottom: '8px',
              borderBottom: '1px solid var(--border-hairline)',
            }}
          >
            {rollingMonths.map((rm, rIdx) => {
              const isCur = viewYear === rm.year && viewMonth === rm.month;
              const hasSelectedTrip = selectedTripMonths.has(`${rm.year}-${rm.month}`);

              return (
                <button
                  key={`${rm.year}-${rm.month}-${rIdx}`}
                  onClick={() => {
                    setViewYear(rm.year);
                    setViewMonth(rm.month);
                    if (onSelectMonthIndex) onSelectMonthIndex(rm.month - 1);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-pill)',
                    border: isCur
                      ? '1.5px solid var(--vermilion)'
                      : hasSelectedTrip
                      ? '1.5px solid #38bdf8'
                      : '1px solid var(--border-hairline)',
                    background: isCur
                      ? 'rgba(255, 101, 132, 0.25)'
                      : hasSelectedTrip
                      ? 'rgba(56, 189, 248, 0.15)'
                      : 'var(--bg-surface-raised)',
                    color: isCur ? '#fff' : hasSelectedTrip ? '#38bdf8' : 'var(--text-secondary)',
                    fontSize: '11.5px',
                    fontWeight: isCur || hasSelectedTrip ? 800 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: hasSelectedTrip ? '0 0 10px rgba(56, 189, 248, 0.25)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{tr(rm.monthData.nameTh, rm.monthData.nameEn).slice(0, 3)} {String(rm.year).slice(2)}</span>
                  {hasSelectedTrip && <span style={{ fontSize: '10px' }} title={tr('เดือนนี้มีวันที่ล็อคไว้', 'Your trip dates are in this month')}>🎯</span>}
                  {rm.monthData.overallScore >= 95 && <span style={{ fontSize: '10px' }}>👑</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Informative Selection Status Banner */}
        {selectingStart ? (
          <div
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.2) 0%, rgba(239, 68, 68, 0.15) 100%)',
              border: '1.5px solid #f59e0b',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              fontSize: '12.5px',
              color: '#fff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>⚡</span>
              <span>
                {language === 'th' ? (<>เลือกวันเริ่มต้น <strong>{selectingStart}</strong> แล้ว ➔ <strong>กรุณาคลิกเลือก "วันเดินทางกลับ" ในปฏิทิน</strong> เพื่อจบทริป</>) : (<>Start date <strong>{selectingStart}</strong> selected ➔ <strong>please click your return date on the calendar</strong> to finish the trip</>)}
              </span>
            </div>
            <button
              onClick={() => setSelectingStart(null)}
              className="btn-editorial-secondary"
              style={{ padding: '4px 10px', fontSize: '11px' }}
            >
              {tr('ยกเลิก', 'Cancel')}
            </button>
          </div>
        ) : selectedRangeMonthInfo && !isTripInCurrentView ? (
          <div
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              background: 'linear-gradient(90deg, rgba(56, 189, 248, 0.15) 0%, rgba(255, 101, 132, 0.12) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              fontSize: '12px',
              color: '#fff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px' }}>📌</span>
              <span>
                {language === 'th' ? (<>คุณกำลังดูเดือน <strong>{currentMonthData.nameTh} {viewYear}</strong> • วันที่เลือกล็อคไว้คือ <strong>{selectedRange?.start} ถึง {selectedRange?.end} ({selectedRangeMonthInfo.monthNameTh} {selectedRangeMonthInfo.year})</strong></>) : (<>You are viewing <strong>{currentMonthData.nameEn} {viewYear}</strong> • Your locked dates are <strong>{selectedRange?.start} to {selectedRange?.end} ({selectedRangeMonthInfo.monthNameEn} {selectedRangeMonthInfo.year})</strong></>)}
              </span>
            </div>
            <button
              onClick={() => {
                setViewYear(selectedRangeMonthInfo.year);
                setViewMonth(selectedRangeMonthInfo.month);
                if (onSelectMonthIndex) onSelectMonthIndex(selectedRangeMonthInfo.month - 1);
              }}
              className="btn-editorial-primary"
              style={{ padding: '4px 12px', fontSize: '11.5px' }}
            >
              {tr('กระโดดไปดูไฮไลท์', 'Jump to highlights:')} {tr(selectedRangeMonthInfo.monthNameTh, selectedRangeMonthInfo.monthNameEn)} ➔
            </button>
          </div>
        ) : null}

        {/* Legend / Price Guide */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
            marginBottom: '14px',
            fontSize: '11.5px',
            color: 'var(--text-secondary)',
          }}
        >
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: '#fff' }}>{tr('🏷️ ดัชนีราคาตั๋วเครื่องบินไป-กลับ (Round-Trip รวมภาษี):', '🏷️ Round-trip flight price index (incl. tax):')}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }} />
              <span>{tr('โปรคุ้มสุด', 'Best deal')} (&lt; ฿10,000)</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} />
              <span>{tr('ราคาปกติ', 'Regular')} (฿10k-13.5k)</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
              <span>{tr('วันหยุด/สุดสัปดาห์', 'Holiday/weekend')} (฿13.5k-16.5k)</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
              <span>{tr('ช่วงพีค/เทศกาล', 'Peak/festival')} (&gt; ฿17,000)</span>
            </span>
          </div>

          <div style={{ color: 'var(--text-tertiary)' }}>
            {tr('💡 คลิกเลือกวันเริ่มต้น แล้วคลิกเลือกวันเดินทางกลับ', '💡 Click a start date, then click a return date')}
          </div>
        </div>

        {/* Active Selected Range Highlight Bar */}
        {selectedRange?.start && selectedRange?.end && (
          <div
            style={{
              padding: '12px 18px',
              borderRadius: '10px',
              background: 'linear-gradient(90deg, rgba(255, 0, 85, 0.25) 0%, rgba(2, 132, 199, 0.25) 100%)',
              border: '2px solid rgba(255, 77, 109, 0.6)',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              boxShadow: '0 4px 16px rgba(255, 0, 85, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '14px', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CalendarDays size={18} color="#ff4d6d" />
                <span>{tr('ไฮไลท์ช่วงวันที่เลือก:', 'Selected dates:')}</span>
              </span>
              <span style={{ background: '#e11d48', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontWeight: 900, fontSize: '13px', boxShadow: '0 2px 8px rgba(225, 29, 72, 0.5)' }}>
                {tr('🛫 บินไป:', '🛫 Depart:')} {selectedRange.start}
              </span>
              <span style={{ color: 'var(--text-tertiary)', fontWeight: 800 }}>➔</span>
              <span style={{ background: '#0284c7', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontWeight: 900, fontSize: '13px', boxShadow: '0 2px 8px rgba(2, 132, 199, 0.5)' }}>
                {tr('🛬 บินกลับ:', '🛬 Return:')} {selectedRange.end}
              </span>
              <span style={{ background: 'rgba(255,255,255,0.1)', color: '#38bdf8', padding: '3px 8px', borderRadius: '6px', fontWeight: 800, fontSize: '12px' }}>
                ⏱️ {tr('รวม', 'Total')} {Math.ceil(Math.abs(new Date(selectedRange.end).getTime() - new Date(selectedRange.start).getTime()) / (1000 * 60 * 60 * 24)) + 1} {tr('วัน', 'days')}
              </span>
            </div>

            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              {tr('💡 คลิกวันใหม่ในตารางเพื่อเปลี่ยนช่วงวัน', '💡 Click new dates on the calendar to change the range')}
            </div>
          </div>
        )}

        {/* Days Calendar Wrapper */}
        {/* Days Calendar Wrapper */}
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', minWidth: 0, paddingBottom: '4px' }}>
          <div style={{ minWidth: '340px' }}>
            {/* Days of Week Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '6px',
                marginBottom: '8px',
              }}
            >
              {daysOfWeek.map((dayName, idx) => (
                <div
                  key={idx}
                  style={{
                    textAlign: 'center',
                    padding: '6px 0',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    color: idx === 0 || idx === 6 ? '#f472b6' : 'var(--text-secondary)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '6px',
                  }}
                >
                  {dayName}
                </div>
              ))}
            </div>

            {/* Days Calendar Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '6px',
              }}
            >
              {calendarDays.map((dayItem) => {
                const { dateStr, day, dayOfWeek, isCurrentMonth, monthLabel, isPast, isToday, roundTripPrice, priceTier, specialEvent } = dayItem;
                const isStart = isRangeStart(dateStr);
                const isEnd = isRangeEnd(dateStr);
                const inRange = isInRange(dateStr);
                const inHover = isInHoverRange(dateStr);
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                const tripInfo = getTripDayInfo(dateStr);

                // Price color
                let priceColor = '#34d399';
                if (priceTier === 'mid') priceColor = '#38bdf8';
                if (priceTier === 'high') priceColor = '#f59e0b';
                if (priceTier === 'peak') priceColor = '#ef4444';

                // Highlighting style determination
                let cellBorder = isCurrentMonth ? '1px solid var(--border-hairline)' : '1px dashed rgba(255, 255, 255, 0.15)';
                let cellBg = isCurrentMonth ? 'var(--bg-surface-raised)' : 'rgba(20, 26, 36, 0.45)';
                let cellShadow = 'none';
                let cellTransform = 'none';
                let cellZIndex = 1;

                if (isStart) {
                  cellBorder = '3px solid #ffffff';
                  cellBg = 'linear-gradient(135deg, #ff0055 0%, #d50000 100%)';
                  cellShadow = '0 0 22px rgba(255, 0, 85, 0.85), 0 4px 14px rgba(0,0,0,0.6)';
                  cellTransform = 'scale(1.03)';
                  cellZIndex = 4;
                } else if (isEnd) {
                  cellBorder = '3px solid #ffffff';
                  cellBg = 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)';
                  cellShadow = '0 0 22px rgba(2, 132, 199, 0.85), 0 4px 14px rgba(0,0,0,0.6)';
                  cellTransform = 'scale(1.03)';
                  cellZIndex = 4;
                } else if (inRange) {
                  cellBorder = '2px solid #ff4d6d';
                  cellBg = 'linear-gradient(180deg, rgba(255, 77, 109, 0.55) 0%, rgba(225, 29, 72, 0.4) 100%)';
                  cellShadow = 'inset 0 0 14px rgba(255, 77, 109, 0.4), 0 0 10px rgba(255, 77, 109, 0.35)';
                  cellZIndex = 2;
                } else if (inHover) {
                  cellBorder = '2px dashed #ff4d6d';
                  cellBg = 'rgba(255, 77, 109, 0.3)';
                  cellShadow = '0 0 12px rgba(255, 77, 109, 0.4)';
                  cellZIndex = 2;
                } else if (isToday) {
                  cellBorder = '1.5px solid #38bdf8';
                  cellBg = 'rgba(56, 189, 248, 0.08)';
                }

                return (
                  <div
                    key={dateStr}
                    onClick={() => handleDateClick(dateStr, isPast)}
                    onMouseEnter={() => !isPast && setHoverDate(dateStr)}
                    onMouseLeave={() => setHoverDate(null)}
                    style={{
                      height: '84px',
                      borderRadius: '10px',
                      padding: '8px 6px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      cursor: isPast ? 'not-allowed' : 'pointer',
                      opacity: isPast ? 0.35 : !isCurrentMonth && !isStart && !isEnd && !inRange && !inHover ? 0.72 : 1,
                      position: 'relative',
                      border: cellBorder,
                      background: cellBg,
                      boxShadow: cellShadow,
                      transform: cellTransform,
                      zIndex: cellZIndex,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {/* Top Row: Date number + Month label + Badges */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                        <span
                          style={{
                            fontSize: '14px',
                            fontWeight: 800,
                            color: isStart || isEnd || inRange ? '#fff' : !isCurrentMonth ? 'var(--text-tertiary)' : isWeekend ? '#f472b6' : '#fff',
                            textShadow: isStart || isEnd || inRange ? '0 1px 3px rgba(0,0,0,0.6)' : 'none',
                          }}
                        >
                          {day}
                        </span>
                        {!isCurrentMonth && monthLabel && (
                          <span
                            style={{
                              fontSize: '9.5px',
                              fontWeight: 700,
                              color: isStart || isEnd || inRange ? 'rgba(255, 255, 255, 0.85)' : 'var(--text-tertiary)',
                              letterSpacing: '-0.2px',
                            }}
                          >
                            {monthLabel}
                          </span>
                        )}
                      </div>

                      {isToday && !isStart && !isEnd && !inRange && (
                        <span style={{ fontSize: '9px', background: '#38bdf8', color: '#000', padding: '1px 4px', borderRadius: '3px', fontWeight: 800 }}>
                          {tr('วันนี้', 'Today')}
                        </span>
                      )}
                      {isStart && (
                        <span style={{ fontSize: '9px', background: '#fff', color: '#d50000', padding: '2px 6px', borderRadius: '4px', fontWeight: 900, boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                          {tr('🛫 วันไป', '🛫 Depart')}
                        </span>
                      )}
                      {isEnd && !isStart && (
                        <span style={{ fontSize: '9px', background: '#fff', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontWeight: 900, boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                          {tr('🛬 วันกลับ', '🛬 Return')}
                        </span>
                      )}
                      {inRange && tripInfo && (
                        <span style={{ fontSize: '8.5px', background: '#ff4d6d', color: '#fff', padding: '1px 5px', borderRadius: '3px', fontWeight: 900 }}>
                          ✨ {tr('วันที่', 'Day')} {tripInfo.dayIdx}/{tripInfo.totalDays}
                        </span>
                      )}
                    </div>

                    {/* Event tag if available */}
                    {specialEvent && !isPast && (
                      <div
                        style={{
                          fontSize: '9.5px',
                          fontWeight: 700,
                          color: isStart || isEnd || inRange ? '#fff' : specialEvent.tagColor,
                          lineHeight: 1.1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {tr(specialEvent.label, specialEvent.labelEn)}
                      </div>
                    )}

                    {isPast && (
                      <div style={{ fontSize: '9.5px', color: 'var(--text-tertiary)' }}>
                        {tr('ผ่านไปแล้ว', 'Past')}
                      </div>
                    )}

                    {/* Bottom Row: Estimated Round-Trip Flight Price */}
                    {!isPast ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            color: isStart || isEnd || inRange ? '#fff' : priceColor,
                            textShadow: isStart || isEnd || inRange ? '0 1px 2px rgba(0,0,0,0.4)' : 'none',
                          }}
                        >
                          {formatPrice(roundTripPrice)}
                        </span>
                        <span style={{ fontSize: '9px', color: isStart || isEnd || inRange ? 'rgba(255,255,255,0.9)' : 'var(--text-tertiary)', fontWeight: 600 }}>
                          {tr('ไป-กลับ', 'RT')}
                        </span>
                      </div>
                    ) : (
                      <div style={{ height: '12px' }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Range Summary Bar with Direct Live Search Links */}
        {selectedRange && selectedRange.start && selectedRange.end && (
          <div
            style={{
              marginTop: '20px',
              padding: '18px 20px',
              background: 'linear-gradient(135deg, rgba(255, 101, 132, 0.12) 0%, rgba(56, 189, 248, 0.08) 100%)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="editorial-tag tag-green" style={{ fontSize: '12px', fontWeight: 800 }}>
                    <Check size={13} /> {tr('ล็อควันเดินทางแล้ว', 'Dates locked')}
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>
                    {selectedRange.start} {tr('ถึง', 'to')} {selectedRange.end}
                  </span>
                </div>

                {rangeFlightEstimate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{tr('ราคาตั๋วบินไป-กลับประมาณการ:', 'Estimated round-trip fare:')}</span>
                    <strong style={{ color: '#34d399', fontSize: '16px', fontWeight: 800 }}>
                      {formatPrice(rangeFlightEstimate.totalRoundTrip)}
                    </strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      ({tr('ขาไป', 'Outbound')} {formatPrice(rangeFlightEstimate.departPrice)} + {tr('ขากลับ', 'Return')} {formatPrice(rangeFlightEstimate.returnPrice)})
                    </span>
                  </div>
                )}
              </div>

              <div style={{ fontSize: '12px', color: 'var(--fuji-cyan)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} />
                <span>{tr('ระยะเวลาทริป:', 'Trip length:')} <strong>{Math.ceil(Math.abs(new Date(selectedRange.end).getTime() - new Date(selectedRange.start).getTime()) / (1000 * 60 * 60 * 24)) + 1} {tr('วัน', 'days')}</strong></span>
              </div>
            </div>

            {/* Direct Live Links Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-hairline)',
              }}
            >
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Plane size={14} color="var(--vermilion)" />
                <span>{tr('ดึงราคาจริง & จองตั๋วปลายทาง:', 'Live prices & book flights:')}</span>
              </span>

              <a
                href={getGoogleFlightsUrl('BKK', 'TYO', selectedRange.start, selectedRange.end)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-editorial-primary"
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{tr('🌐 เช็คสดบน Google Flights', '🌐 Check live on Google Flights')}</span>
                <ExternalLink size={12} />
              </a>

              <a
                href={getSkyscannerFlightUrl(selectedRange.start, selectedRange.end)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-editorial-secondary"
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                }}
              >
                <span>{tr('🔍 เปรียบเทียบบน Skyscanner', '🔍 Compare on Skyscanner')}</span>
                <ExternalLink size={12} />
              </a>

              <a
                href={getTripComFlightUrl(selectedRange.start, selectedRange.end)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-editorial-secondary"
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(52, 211, 153, 0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                }}
              >
                <span>🏷️ Trip.com</span>
                <ExternalLink size={12} />
              </a>

              <a
                href={getAgodaFlightUrl(selectedRange.start, selectedRange.end)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-editorial-secondary"
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(168, 85, 247, 0.15)',
                  color: '#c084fc',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                }}
              >
                <span>🏨 Agoda Flights</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveFlightCalendar;
