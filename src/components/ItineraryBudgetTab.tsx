'use client';

import React, { useState } from 'react';
import { Attraction, FlightOption, Currency, MonthData } from '@/types/travel';
import { JPY_TO_THB_RATE } from '@/data/mockData';
import { 
  DollarSign, 
  MapPin, 
  Receipt, 
  Sliders, 
  Layers, 
  Clock,
  Sparkles,
  ArrowRight,
  TrendingDown
} from 'lucide-react';

interface ItineraryBudgetTabProps {
  wishlistAttractions: Attraction[];
  selectedFlight: FlightOption | undefined;
  selectedMonth: MonthData;
  currency: Currency;
  tripDurationDays: number;
  setTripDurationDays: (days: number) => void;
}

export const ItineraryBudgetTab: React.FC<ItineraryBudgetTabProps> = ({
  wishlistAttractions,
  selectedFlight,
  selectedMonth,
  currency,
  tripDurationDays,
  setTripDurationDays,
}) => {
  const [hotelCostPerNightTHB, setHotelCostPerNightTHB] = useState<number>(3200);
  const [dailyFoodJPY, setDailyFoodJPY] = useState<number>(4500);
  const [shoppingJPY, setShoppingJPY] = useState<number>(30000);
  const [transitPassJPY, setTransitPassJPY] = useState<number>(10000);

  const flightCostTHB = selectedFlight ? selectedFlight.basePriceTHB : 18500;
  const hotelTotalTHB = hotelCostPerNightTHB * Math.max(1, tripDurationDays - 1);
  const foodTotalTHB = Math.round(dailyFoodJPY * tripDurationDays * JPY_TO_THB_RATE);
  const attractionCostTHB = Math.round(wishlistAttractions.reduce((s, a) => s + a.priceJPY, 0) * JPY_TO_THB_RATE);
  const transitTotalTHB = Math.round(transitPassJPY * JPY_TO_THB_RATE);
  const shoppingTotalTHB = Math.round(shoppingJPY * JPY_TO_THB_RATE);

  const grandTotalTHB = flightCostTHB + hotelTotalTHB + foodTotalTHB + attractionCostTHB + transitTotalTHB + shoppingTotalTHB;
  const grandTotalJPY = Math.round(grandTotalTHB / JPY_TO_THB_RATE);

  const formatCost = (thb: number) => {
    if (currency === 'THB') return `฿${thb.toLocaleString()} THB`;
    return `¥${Math.round(thb / JPY_TO_THB_RATE).toLocaleString()} JPY`;
  };

  const daysArray = Array.from({ length: tripDurationDays }, (_, i) => i + 1);
  const spotsPerDay = 2;
  const getDayAttractions = (dayIndex: number) => {
    const start = (dayIndex - 1) * spotsPerDay;
    return wishlistAttractions.slice(start, start + spotsPerDay);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Ledger Card */}
      <div className="bento-card">
        <div className="bento-card-kanji-bg">予算</div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span className="editorial-tag tag-gold">
                <Receipt size={11} /> EXPEDITION FINANCIAL LEDGER & CALENDAR
              </span>
              <span className="editorial-tag tag-cyan">{selectedMonth.nameTh} // {tripDurationDays} DAYS</span>
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: '8px' }}>
              ประมาณการงบประมาณ & แพลนเส้นทางรายวัน (Budget & Itinerary)
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '720px', lineHeight: '1.6' }}>
              ปรับแต่งงบประมาณตามรูปแบบทริปของคุณ พร้อมคำนวณการกระจายตัวของค่าใช้จ่ายแบบเรียลไทม์
            </p>
          </div>

          <div
            style={{
              background: 'var(--bg-surface-raised)',
              border: '1px solid var(--tokyo-gold)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 24px',
              textAlign: 'right',
              boxShadow: '0 0 20px rgba(234, 179, 8, 0.2)',
            }}
          >
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--tokyo-gold)' }}>
              TOTAL ESTIMATE / PAX
            </div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-mono)' }}>
              {formatCost(grandTotalTHB)}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              PACE: {formatCost(Math.round(grandTotalTHB / tripDurationDays))} / DAY
            </div>
          </div>
        </div>

        {/* Sliders Grid */}
        <div
          className="grid-cols-4"
          style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-hairline)',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>DURATION:</span>
              <strong style={{ color: 'var(--fuji-cyan)' }}>{tripDurationDays} DAYS</strong>
            </div>
            <input
              type="range"
              min={4}
              max={14}
              value={tripDurationDays}
              onChange={(e) => setTripDurationDays(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--fuji-cyan)' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>HOTEL/NIGHT:</span>
              <strong style={{ color: 'var(--vermilion)' }}>฿{hotelCostPerNightTHB.toLocaleString()}</strong>
            </div>
            <input
              type="range"
              min={1500}
              max={8000}
              step={100}
              value={hotelCostPerNightTHB}
              onChange={(e) => setHotelCostPerNightTHB(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--vermilion)' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>FOOD/DAY:</span>
              <strong style={{ color: 'var(--matcha-emerald)' }}>¥{dailyFoodJPY.toLocaleString()}</strong>
            </div>
            <input
              type="range"
              min={2500}
              max={12000}
              step={500}
              value={dailyFoodJPY}
              onChange={(e) => setDailyFoodJPY(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--matcha-emerald)' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>SHOPPING:</span>
              <strong style={{ color: 'var(--tokyo-gold)' }}>฿{shoppingTotalTHB.toLocaleString()}</strong>
            </div>
            <input
              type="range"
              min={5000}
              max={80000}
              step={2000}
              value={shoppingJPY}
              onChange={(e) => setShoppingJPY(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--tokyo-gold)' }}
            />
          </div>
        </div>

        {/* Ledger Breakdown Bar */}
        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', height: '8px', borderRadius: 'var(--radius-xs)', overflow: 'hidden', marginBottom: '12px' }}>
            <div style={{ width: `${(flightCostTHB / grandTotalTHB) * 100}%`, background: 'var(--fuji-cyan)' }} />
            <div style={{ width: `${(hotelTotalTHB / grandTotalTHB) * 100}%`, background: 'var(--vermilion)' }} />
            <div style={{ width: `${(foodTotalTHB / grandTotalTHB) * 100}%`, background: 'var(--matcha-emerald)' }} />
            <div style={{ width: `${(transitTotalTHB / grandTotalTHB) * 100}%`, background: 'var(--lavender)' }} />
            <div style={{ width: `${(attractionCostTHB / grandTotalTHB) * 100}%`, background: '#3b82f6' }} />
            <div style={{ width: `${(shoppingTotalTHB / grandTotalTHB) * 100}%`, background: 'var(--tokyo-gold)' }} />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--fuji-cyan)' }} />
              FLIGHT: {formatCost(flightCostTHB)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--vermilion)' }} />
              HOTEL ({tripDurationDays - 1}N): {formatCost(hotelTotalTHB)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--matcha-emerald)' }} />
              FOOD: {formatCost(foodTotalTHB)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--lavender)' }} />
              TRANSIT: {formatCost(transitTotalTHB)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
              ACTIVITIES: {formatCost(attractionCostTHB)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--tokyo-gold)' }} />
              SHOPPING: {formatCost(shoppingTotalTHB)}
            </span>
          </div>
        </div>
      </div>

      {/* Day-by-Day Outline */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
              โครงสร้างแผนการเดินทางรายวัน ({tripDurationDays} Days Route Outline)
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              จัดกลุ่มสถานที่จาก Wishlist ลงในแต่ละวันแบบอัตโนมัติ
            </p>
          </div>
          <span className="editorial-tag tag-cyan">{wishlistAttractions.length} PLACES IN WISHLIST</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {daysArray.map((dayNum) => {
            const daySpots = getDayAttractions(dayNum);

            return (
              <div
                key={dayNum}
                className="bento-card"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '220px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-xs)',
                      background: 'var(--bg-surface-raised)',
                      border: '1px solid var(--vermilion)',
                      color: 'var(--vermilion)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      fontSize: '15px',
                    }}
                  >
                    D{String(dayNum).padStart(2, '0')}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>
                      {dayNum === 1
                        ? 'Day 1: เดินทางถึงโตเกียว & เช็คอินที่พัก'
                        : dayNum === tripDurationDays
                        ? `Day ${dayNum}: ช้อปปิ้งส่งท้าย & เดินทางไปสนามบิน`
                        : `Day ${dayNum}: สำรวจไฮไลท์เมือง & อาหาร`}
                    </h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {daySpots.length > 0
                        ? `มี ${daySpots.length} จุดหมายหลัก`
                        : 'เวลาอิสระสำหรับเดินเล่นและคาเฟ่'}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flex: 1, flexWrap: 'wrap' }}>
                  {daySpots.length > 0 ? (
                    daySpots.map((spot) => (
                      <div
                        key={spot.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          background: 'var(--bg-surface-raised)',
                          border: '1px solid var(--border-hairline)',
                          borderRadius: 'var(--radius-xs)',
                        }}
                      >
                        <MapPin size={13} color="var(--fuji-cyan)" />
                        <span style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>{spot.nameTh.split('(')[0]}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>({spot.area})</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                      เพิ่มสถานที่จากหน้า Attractions เพื่อจัดลงในวันนี้
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '13.5px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--matcha-emerald)' }}>
                  ≈ {formatCost(Math.round(grandTotalTHB / tripDurationDays))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
