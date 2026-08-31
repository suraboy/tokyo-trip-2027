'use client';

import React, { useState, useMemo } from 'react';
import { MonthData, Currency } from '@/types/travel';
import { MONTHS_DATA, JPY_TO_THB_RATE } from '@/data/mockData';
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
}

// Special events & season milestones across 2026-2028
const SPECIAL_EVENTS: Record<string, { label: string; tagColor: string; type: 'sakura' | 'autumn' | 'holiday' | 'festival' }> = {
  // 2026 Autumn / Winter
  '2026-10-31': { label: '🎃 ฮาโลวีนชิบูย่า', tagColor: '#f97316', type: 'festival' },
  '2026-11-15': { label: '🍁 Momiji Tokyo พีค', tagColor: '#ef4444', type: 'autumn' },
  '2026-11-20': { label: '🍂 แปะก๊วยสีทอง', tagColor: '#eab308', type: 'autumn' },
  '2026-12-25': { label: '🎄 คริสต์มาส', tagColor: '#38bdf8', type: 'festival' },
  '2026-12-31': { label: '🎆 เค้าท์ดาวน์ปีใหม่', tagColor: '#ec4899', type: 'holiday' },

  // 2027 Full Year
  '2027-01-01': { label: '🎍 วันปีใหม่', tagColor: '#ef4444', type: 'holiday' },
  '2027-02-14': { label: '💝 วาเลนไทน์', tagColor: '#ec4899', type: 'festival' },
  '2027-03-24': { label: '🌸 ซากุระเริ่มบาน', tagColor: '#f472b6', type: 'sakura' },
  '2027-03-28': { label: '🌸 ซากุระ Full Bloom', tagColor: '#ec4899', type: 'sakura' },
  '2027-04-12': { label: '🇹🇭 หยุดสงกรานต์', tagColor: '#f59e0b', type: 'holiday' },
  '2027-04-13': { label: '🇹🇭 สงกรานต์', tagColor: '#f59e0b', type: 'holiday' },
  '2027-04-14': { label: '🇹🇭 สงกรานต์', tagColor: '#f59e0b', type: 'holiday' },
  '2027-04-29': { label: '🎌 Showa Day', tagColor: '#a855f7', type: 'holiday' },
  '2027-05-03': { label: '🎌 Golden Week', tagColor: '#a855f7', type: 'holiday' },
  '2027-05-04': { label: '🎌 Greenery Day', tagColor: '#a855f7', type: 'holiday' },
  '2027-05-05': { label: '🎌 Children Day', tagColor: '#a855f7', type: 'holiday' },
  '2027-07-24': { label: '🎆 พลุสุมิดะ', tagColor: '#38bdf8', type: 'festival' },
  '2027-08-13': { label: '🎌 เทศกาลโอบ้ง', tagColor: '#f59e0b', type: 'holiday' },
  '2027-10-31': { label: '🎃 ฮาโลวีนชิบูย่า', tagColor: '#f97316', type: 'festival' },
  '2027-11-12': { label: '🍁 ใบไม้แดงฟูจิพีค', tagColor: '#ef4444', type: 'autumn' },
  '2027-11-15': { label: '🍁 Momiji Tokyo พีค', tagColor: '#ef4444', type: 'autumn' },
  '2027-11-20': { label: '🍂 แปะก๊วยสีทอง', tagColor: '#eab308', type: 'autumn' },
  '2027-12-24': { label: '🎄 คริสต์มาสอีฟ', tagColor: '#38bdf8', type: 'festival' },
  '2027-12-25': { label: '🎄 คริสต์มาส', tagColor: '#38bdf8', type: 'festival' },
  '2027-12-31': { label: '🎆 เค้าท์ดาวน์ปีใหม่', tagColor: '#ec4899', type: 'holiday' },

  // 2028 Start
  '2028-01-01': { label: '🎍 วันปีใหม่ 2028', tagColor: '#ef4444', type: 'holiday' },
  '2028-03-25': { label: '🌸 ซากุระ 2028', tagColor: '#f472b6', type: 'sakura' },
  '2028-04-13': { label: '🇹🇭 สงกรานต์ 2028', tagColor: '#f59e0b', type: 'holiday' },
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
}) => {
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

  // Auto-sync viewing month with selected range start date or prop
  React.useEffect(() => {
    if (selectedRange?.start) {
      const parts = selectedRange.start.split('-');
      if (parts.length >= 2) {
        const yr = parseInt(parts[0], 10);
        const mo = parseInt(parts[1], 10);
        if (!isNaN(yr) && !isNaN(mo)) {
          setViewYear(yr);
          setViewMonth(mo);
          return;
        }
      }
    }
    if (selectedMonthIndex !== undefined) {
      setViewMonth(selectedMonthIndex + 1);
    }
  }, [selectedRange?.start, selectedMonthIndex]);

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

  // Generate calendar days for viewYear & viewMonth
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
    const firstDayOfWeek = new Date(viewYear, viewMonth - 1, 1).getDay();

    const days: Array<{
      dateStr: string;
      day: number;
      dayOfWeek: number;
      isCurrentMonth: boolean;
      isPast: boolean;
      isToday: boolean;
      roundTripPrice: number;
      oneWayPrice: number;
      priceTier: 'low' | 'mid' | 'high' | 'peak';
      specialEvent?: { label: string; tagColor: string; type: string };
    } | null> = [];

    // Empty padding slots before 1st of month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    // Days in viewing month
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
        isCurrentMonth: true,
        isPast,
        isToday,
        roundTripPrice: roundTripPriceTHB,
        oneWayPrice: oneWayPriceTHB,
        priceTier: tier,
        specialEvent,
      });
    }

    return days;
  }, [viewYear, viewMonth, todayStr]);

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

  const daysOfWeek = ['อา. Sun', 'จ. Mon', 'อ. Tue', 'พ. Wed', 'พฤ. Thu', 'ศ. Fri', 'ส. Sat'];

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
                  {currentMonthData.nameTh} {viewYear} ({currentMonthData.nameEn} {viewYear})
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
                  ✈️ แสดงราคาตั๋วบินไป-กลับ (Round-Trip)
                </span>
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--sakura-pink)', fontWeight: 600, marginTop: '2px' }}>
                {currentMonthData.seasonTh} • 🌡️ {currentMonthData.avgTempC.min}°C - {currentMonthData.avgTempC.max}°C • 🌧️ ฝน {currentMonthData.rainyDays} วัน
              </div>
            </div>
          </div>

          {/* Month Stepper Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {selectedRangeMonthInfo && !selectedRangeMonthInfo.isCurrentView && (
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
                title="กระโดดไปดูเดือนที่เลือกวันเดินทางไว้"
              >
                <span>🎯 ดูไฮไลท์เดือนที่เลือก ({selectedRangeMonthInfo.monthNameTh.slice(0, 3)} {String(selectedRangeMonthInfo.year).slice(2)})</span>
              </button>
            )}

            <button
              onClick={handlePrevMonth}
              className="btn-editorial-secondary"
              style={{ padding: '8px 14px', fontSize: '13px' }}
              aria-label="Previous Month"
            >
              <ChevronLeft size={16} />
              <span>เดือนก่อน</span>
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
              title="กลับมาเดือนปัจจุบัน"
            >
              <span>📍 เดือนนี้</span>
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
              title="กระโดดไปช่วงยอดนิยม พ.ย. 2027"
            >
              <span>🍁 พ.ย. 2027</span>
            </button>

            <button
              onClick={handleNextMonth}
              className="btn-editorial-secondary"
              style={{ padding: '8px 14px', fontSize: '13px' }}
              aria-label="Next Month"
            >
              <span>เดือนถัดไป</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* 1-Year (16-Months Rolling) Quick Jumper Strip */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 700, marginBottom: '6px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
            <span>📆 แถบเลือกเดือน 1 ปีเต็มจากวันนี้ (กดเปลี่ยนเดือนได้ทันที):</span>
            <span style={{ color: 'var(--sakura-pink)' }}>
              {selectedRange?.start && selectedRange?.end && (
                <span>📍 ทริปที่เลือก: {selectedRange.start} ถึง {selectedRange.end}</span>
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
              const hasSelectedTrip = selectedRangeMonthInfo?.year === rm.year && selectedRangeMonthInfo?.month === rm.month;

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
                  <span>{rm.monthData.nameTh.slice(0, 3)} {String(rm.year).slice(2)}</span>
                  {hasSelectedTrip && <span style={{ fontSize: '10px' }} title="เดือนนี้มีวันที่ล็อคไว้">🎯</span>}
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
                เลือกวันเริ่มต้น <strong>{selectingStart}</strong> แล้ว ➔ <strong>กรุณาคลิกเลือก "วันเดินทางกลับ" ในปฏิทิน</strong> เพื่อจบทริป
              </span>
            </div>
            <button
              onClick={() => setSelectingStart(null)}
              className="btn-editorial-secondary"
              style={{ padding: '4px 10px', fontSize: '11px' }}
            >
              ยกเลิก
            </button>
          </div>
        ) : selectedRangeMonthInfo && !selectedRangeMonthInfo.isCurrentView ? (
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
                คุณกำลังดูเดือน <strong>{currentMonthData.nameTh} {viewYear}</strong> • วันที่เลือกล็อคไว้คือ <strong>{selectedRange?.start} ถึง {selectedRange?.end} ({selectedRangeMonthInfo.monthNameTh} {selectedRangeMonthInfo.year})</strong>
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
              กระโดดไปดูไฮไลท์ {selectedRangeMonthInfo.monthNameTh} ➔
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
            <span style={{ fontWeight: 700, color: '#fff' }}>🏷️ ดัชนีราคาตั๋วเครื่องบินไป-กลับ (Round-Trip รวมภาษี):</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }} />
              <span>โปรคุ้มสุด (&lt; ฿10,000)</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#38bdf8' }} />
              <span>ราคาปกติ (฿10k-13.5k)</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
              <span>วันหยุด/สุดสัปดาห์ (฿13.5k-16.5k)</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
              <span>ช่วงพีค/เทศกาล (&gt; ฿17,000)</span>
            </span>
          </div>

          <div style={{ color: 'var(--text-tertiary)' }}>
            💡 คลิกเลือกวันเริ่มต้น แล้วคลิกเลือกวันเดินทางกลับ
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
                <span>ไฮไลท์ช่วงวันที่เลือก:</span>
              </span>
              <span style={{ background: '#e11d48', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontWeight: 900, fontSize: '13px', boxShadow: '0 2px 8px rgba(225, 29, 72, 0.5)' }}>
                🛫 บินไป: {selectedRange.start}
              </span>
              <span style={{ color: 'var(--text-tertiary)', fontWeight: 800 }}>➔</span>
              <span style={{ background: '#0284c7', color: '#fff', padding: '3px 10px', borderRadius: '6px', fontWeight: 900, fontSize: '13px', boxShadow: '0 2px 8px rgba(2, 132, 199, 0.5)' }}>
                🛬 บินกลับ: {selectedRange.end}
              </span>
              <span style={{ background: 'rgba(255,255,255,0.1)', color: '#38bdf8', padding: '3px 8px', borderRadius: '6px', fontWeight: 800, fontSize: '12px' }}>
                ⏱️ รวม {Math.ceil(Math.abs(new Date(selectedRange.end).getTime() - new Date(selectedRange.start).getTime()) / (1000 * 60 * 60 * 24)) + 1} วัน
              </span>
            </div>

            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              💡 คลิกวันใหม่ในตารางเพื่อเปลี่ยนช่วงวัน
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
              {calendarDays.map((dayItem, idx) => {
                if (!dayItem) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      style={{
                        height: '84px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.01)',
                      }}
                    />
                  );
                }

                const { dateStr, day, dayOfWeek, isPast, isToday, roundTripPrice, priceTier, specialEvent } = dayItem;
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
                let cellBorder = '1px solid var(--border-hairline)';
                let cellBg = 'var(--bg-surface-raised)';
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
                      opacity: isPast ? 0.35 : 1,
                      position: 'relative',
                      border: cellBorder,
                      background: cellBg,
                      boxShadow: cellShadow,
                      transform: cellTransform,
                      zIndex: cellZIndex,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {/* Top Row: Date number + Badges */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: 800,
                          color: isStart || isEnd || inRange ? '#fff' : isWeekend ? '#f472b6' : '#fff',
                          textShadow: isStart || isEnd || inRange ? '0 1px 3px rgba(0,0,0,0.6)' : 'none',
                        }}
                      >
                        {day}
                      </span>

                      {isToday && !isStart && !isEnd && !inRange && (
                        <span style={{ fontSize: '9px', background: '#38bdf8', color: '#000', padding: '1px 4px', borderRadius: '3px', fontWeight: 800 }}>
                          วันนี้
                        </span>
                      )}
                      {isStart && (
                        <span style={{ fontSize: '9px', background: '#fff', color: '#d50000', padding: '2px 6px', borderRadius: '4px', fontWeight: 900, boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                          🛫 วันไป
                        </span>
                      )}
                      {isEnd && !isStart && (
                        <span style={{ fontSize: '9px', background: '#fff', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontWeight: 900, boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                          🛬 วันกลับ
                        </span>
                      )}
                      {inRange && tripInfo && (
                        <span style={{ fontSize: '8.5px', background: '#ff4d6d', color: '#fff', padding: '1px 5px', borderRadius: '3px', fontWeight: 900 }}>
                          ✨ วันที่ {tripInfo.dayIdx}/{tripInfo.totalDays}
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
                        {specialEvent.label}
                      </div>
                    )}

                    {isPast && (
                      <div style={{ fontSize: '9.5px', color: 'var(--text-tertiary)' }}>
                        ผ่านไปแล้ว
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
                          ไป-กลับ
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
                    <Check size={13} /> ล็อควันเดินทางแล้ว
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>
                    {selectedRange.start} ถึง {selectedRange.end}
                  </span>
                </div>

                {rangeFlightEstimate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>ราคาตั๋วบินไป-กลับประมาณการ:</span>
                    <strong style={{ color: '#34d399', fontSize: '16px', fontWeight: 800 }}>
                      {formatPrice(rangeFlightEstimate.totalRoundTrip)}
                    </strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      (ขาไป {formatPrice(rangeFlightEstimate.departPrice)} + ขากลับ {formatPrice(rangeFlightEstimate.returnPrice)})
                    </span>
                  </div>
                )}
              </div>

              <div style={{ fontSize: '12px', color: 'var(--fuji-cyan)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} />
                <span>ระยะเวลาทริป: <strong>{Math.ceil(Math.abs(new Date(selectedRange.end).getTime() - new Date(selectedRange.start).getTime()) / (1000 * 60 * 60 * 24)) + 1} วัน</strong></span>
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
                <span>ดึงราคาจริง & จองตั๋วปลายทาง:</span>
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
                <span>🌐 เช็คสดบน Google Flights</span>
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
                <span>🔍 เปรียบเทียบบน Skyscanner</span>
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
