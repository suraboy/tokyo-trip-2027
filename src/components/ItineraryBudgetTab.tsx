'use client';

import React, { useState } from 'react';
import { Attraction, FlightOption, Currency, MonthData } from '@/types/travel';
import { JPY_TO_THB_RATE } from '@/data/mockData';
import { 
  DollarSign, 
  Calendar, 
  MapPin, 
  Sparkles, 
  Sliders, 
  Layers, 
  Utensils, 
  Hotel, 
  Plane, 
  ShoppingBag, 
  Compass, 
  Clock,
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
  // Budget State
  const [hotelCostPerNightTHB, setHotelCostPerNightTHB] = useState<number>(3200);
  const [dailyFoodJPY, setDailyFoodJPY] = useState<number>(4500);
  const [shoppingJPY, setShoppingJPY] = useState<number>(30000);
  const [transitPassJPY, setTransitPassJPY] = useState<number>(10000);

  const flightCostTHB = selectedFlight ? selectedFlight.basePriceTHB : 18500;
  const hotelTotalTHB = hotelCostPerNightTHB * Math.max(1, tripDurationDays - 1);
  const foodTotalJPY = dailyFoodJPY * tripDurationDays;
  const foodTotalTHB = Math.round(foodTotalJPY * JPY_TO_THB_RATE);
  const attractionCostJPY = wishlistAttractions.reduce((sum, a) => sum + a.priceJPY, 0);
  const attractionCostTHB = Math.round(attractionCostJPY * JPY_TO_THB_RATE);
  const transitTotalTHB = Math.round(transitPassJPY * JPY_TO_THB_RATE);
  const shoppingTotalTHB = Math.round(shoppingJPY * JPY_TO_THB_RATE);

  const grandTotalTHB =
    flightCostTHB + hotelTotalTHB + foodTotalTHB + attractionCostTHB + transitTotalTHB + shoppingTotalTHB;
  const grandTotalJPY = Math.round(grandTotalTHB / JPY_TO_THB_RATE);

  const formatCost = (thb: number) => {
    if (currency === 'THB') {
      return `฿${thb.toLocaleString()} THB`;
    }
    const jpy = Math.round(thb / JPY_TO_THB_RATE);
    return `¥${jpy.toLocaleString()} JPY`;
  };

  // Generate Sample Day-by-Day itinerary using wishlist spots
  const daysArray = Array.from({ length: tripDurationDays }, (_, i) => i + 1);

  // Group wishlist attractions into days
  const spotsPerDay = 2;
  const getDayAttractions = (dayIndex: number) => {
    const start = (dayIndex - 1) * spotsPerDay;
    return wishlistAttractions.slice(start, start + spotsPerDay);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Budget Summary Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-amber">
                <DollarSign size={12} /> Live Budget Estimator 2027
              </span>
              <span className="badge badge-sakura">{selectedMonth.nameTh} ({tripDurationDays} วัน)</span>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
              ประมาณการงบประมาณทริปญี่ปุ่น & แพลนรายวัน
            </h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', maxWidth: '750px', lineHeight: '1.5' }}>
              ปรับแต่งงบประมาณตามสไตล์การเที่ยวของคุณ ไม่ว่าจะเป็นค่าตั๋วเครื่องบิน โรงแรม อาหาร บัตรกิจกรรม และช้อปปิ้ง
            </p>
          </div>

          <div
            style={{
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '16px',
              padding: '16px 24px',
              textAlign: 'right',
            }}
          >
            <div style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 600 }}>งบประมาณรวมโดยประมาณ / คน</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>
              {formatCost(grandTotalTHB)}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              เฉลี่ยวันละ {formatCost(Math.round(grandTotalTHB / tripDurationDays))} / คน
            </div>
          </div>
        </div>

        {/* Sliders & Customization Grid */}
        <div
          style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
          }}
        >
          {/* Trip Duration Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
              <span style={{ color: '#cbd5e1' }}>ระยะเวลาทริป:</span>
              <strong style={{ color: '#38bdf8' }}>{tripDurationDays} วัน</strong>
            </div>
            <input
              type="range"
              min={4}
              max={14}
              value={tripDurationDays}
              onChange={(e) => setTripDurationDays(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-cyan)' }}
            />
          </div>

          {/* Hotel Cost Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
              <span style={{ color: '#cbd5e1' }}>ค่าโรงแรม/คืน:</span>
              <strong style={{ color: '#fb7185' }}>฿{hotelCostPerNightTHB.toLocaleString()}</strong>
            </div>
            <input
              type="range"
              min={1500}
              max={8000}
              step={100}
              value={hotelCostPerNightTHB}
              onChange={(e) => setHotelCostPerNightTHB(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-pink)' }}
            />
          </div>

          {/* Daily Food Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
              <span style={{ color: '#cbd5e1' }}>ค่าอาหาร/วัน:</span>
              <strong style={{ color: '#34d399' }}>¥{dailyFoodJPY.toLocaleString()} (฿{Math.round(dailyFoodJPY * JPY_TO_THB_RATE)})</strong>
            </div>
            <input
              type="range"
              min={2500}
              max={12000}
              step={500}
              value={dailyFoodJPY}
              onChange={(e) => setDailyFoodJPY(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-emerald)' }}
            />
          </div>

          {/* Shopping Budget Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
              <span style={{ color: '#cbd5e1' }}>งบช้อปปิ้ง/ของฝาก:</span>
              <strong style={{ color: '#fbbf24' }}>฿{shoppingTotalTHB.toLocaleString()}</strong>
            </div>
            <input
              type="range"
              min={5000}
              max={80000}
              step={2000}
              value={shoppingJPY}
              onChange={(e) => setShoppingJPY(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-amber)' }}
            />
          </div>
        </div>

        {/* Cost Breakdown Progress Bar */}
        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', height: '10px', borderRadius: '5px', overflow: 'hidden', marginBottom: '10px' }}>
            <div style={{ width: `${(flightCostTHB / grandTotalTHB) * 100}%`, background: 'var(--accent-cyan)' }} title="ตั๋วเครื่องบิน" />
            <div style={{ width: `${(hotelTotalTHB / grandTotalTHB) * 100}%`, background: 'var(--accent-pink)' }} title="โรงแรมที่พัก" />
            <div style={{ width: `${(foodTotalTHB / grandTotalTHB) * 100}%`, background: 'var(--accent-emerald)' }} title="อาหารและเครื่องดื่ม" />
            <div style={{ width: `${(transitTotalTHB / grandTotalTHB) * 100}%`, background: 'var(--accent-purple)' }} title="การเดินทางและพาส" />
            <div style={{ width: `${(attractionCostTHB / grandTotalTHB) * 100}%`, background: '#3b82f6' }} title="บัตรเข้าสถานที่" />
            <div style={{ width: `${(shoppingTotalTHB / grandTotalTHB) * 100}%`, background: 'var(--accent-amber)' }} title="ช้อปปิ้ง" />
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#cbd5e1' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-cyan)' }} />
              ตั๋วเครื่องบิน: {formatCost(flightCostTHB)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#cbd5e1' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-pink)' }} />
              โรงแรม ({tripDurationDays - 1} คืน): {formatCost(hotelTotalTHB)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#cbd5e1' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)' }} />
              อาหาร ({tripDurationDays} วัน): {formatCost(foodTotalTHB)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#cbd5e1' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-purple)' }} />
              การเดินทาง/พาส: {formatCost(transitTotalTHB)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#cbd5e1' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
              บัตรเข้าสถานที่: {formatCost(attractionCostTHB)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#cbd5e1' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-amber)' }} />
              ช้อปปิ้ง/ของฝาก: {formatCost(shoppingTotalTHB)}
            </span>
          </div>
        </div>
      </div>

      {/* Day-by-Day Itinerary Preview */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>
              โครงสร้างแผนการเดินทางรายวัน ({tripDurationDays} Days Route Outline)
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>
              จัดกลุ่มสถานที่จาก Wishlist ลงในแต่ละวันแบบอัตโนมัติเพื่อให้เห็นภาพรวมเส้นทาง
            </p>
          </div>
          <span className="badge badge-cyan">{wishlistAttractions.length} สถานที่ในแผน</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {daysArray.map((dayNum) => {
            const daySpots = getDayAttractions(dayNum);

            return (
              <div
                key={dayNum}
                className="card"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px',
                }}
              >
                {/* Day Badge & Theme */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '220px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'rgba(244, 63, 94, 0.15)',
                      border: '1px solid rgba(244, 63, 94, 0.3)',
                      color: '#fb7185',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '15px',
                    }}
                  >
                    D{dayNum}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>
                      {dayNum === 1
                        ? 'Day 1: เดินทางถึงโตเกียว & เช็คอินที่พัก'
                        : dayNum === tripDurationDays
                        ? `Day ${dayNum}: ช้อปปิ้งส่งท้าย & เดินทางไปสนามบิน`
                        : `Day ${dayNum}: สำรวจไฮไลท์เมือง & อาหาร`}
                    </h4>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {daySpots.length > 0
                        ? `มี ${daySpots.length} จุดหมายหลัก`
                        : 'เวลาว่างสำหรับเดินเล่นคาเฟ่และช้อปปิ้ง'}
                    </span>
                  </div>
                </div>

                {/* Spots in Day */}
                <div style={{ display: 'flex', gap: '10px', flex: 1, flexWrap: 'wrap' }}>
                  {daySpots.length > 0 ? (
                    daySpots.map((spot) => (
                      <div
                        key={spot.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 12px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '8px',
                        }}
                      >
                        <MapPin size={14} color="#38bdf8" />
                        <span style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>{spot.nameTh.split('(')[0]}</span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>({spot.area})</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '12.5px', color: '#64748b', fontStyle: 'italic' }}>
                      เพิ่มสถานที่จากหน้า Attractions เพื่อจัดลงในวันนี้
                    </div>
                  )}
                </div>

                {/* Day Cost estimate */}
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#34d399' }}>
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
