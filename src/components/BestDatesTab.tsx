'use client';

import React, { useState } from 'react';
import { MonthData } from '@/types/travel';
import { MONTHS_DATA } from '@/data/mockData';
import { 
  Sun, 
  CloudRain, 
  Users, 
  DollarSign, 
  Check, 
  Award, 
  Sparkles, 
  Thermometer,
  Calendar,
  ArrowRight
} from 'lucide-react';
import InteractiveFlightCalendar from './InteractiveFlightCalendar';

interface BestDatesTabProps {
  selectedMonth: MonthData;
  onSelectMonth: (month: MonthData) => void;
}

type FilterGoal = 'all' | 'sakura' | 'autumn' | 'weather_value' | 'winter' | 'budget';

export const BestDatesTab: React.FC<BestDatesTabProps> = ({
  selectedMonth,
  onSelectMonth,
}) => {
  const [viewMode, setViewMode] = useState<'calendar' | 'matrix'>('calendar');
  const [filterGoal, setFilterGoal] = useState<FilterGoal>('all');
  const [selectedRange, setSelectedRange] = useState<{ start: string; end: string }>({
    start: '2027-11-10',
    end: '2027-11-16',
  });

  const filteredMonths = MONTHS_DATA.filter((m) => {
    if (filterGoal === 'sakura') return m.month === 3 || m.month === 4 || m.month === 2;
    if (filterGoal === 'autumn') return m.month === 10 || m.month === 11;
    if (filterGoal === 'weather_value') return m.month === 5 || m.month === 10 || m.month === 11;
    if (filterGoal === 'winter') return m.month === 12 || m.month === 1 || m.month === 2;
    if (filterGoal === 'budget') return m.priceLevel <= 2;
    return true;
  });

  const getScoreTagClass = (score: number) => {
    if (score >= 94) return 'tag-green';
    if (score >= 88) return 'tag-cyan';
    if (score >= 80) return 'tag-gold';
    return 'tag-purple';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Editorial Header Card */}
      <div className="bento-card">
        <div className="bento-card-kanji-bg">季節</div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span className="editorial-tag tag-red">
                <Sparkles size={11} /> 12-MONTH CLIMATE & SEASONALITY MATRIX
              </span>
              <span className="editorial-tag tag-cyan">TOKYO & KANTO REGION</span>
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: '8px' }}>
              หาวันและเดือนที่ดีที่สุดสำหรับเที่ยวญี่ปุ่น (Best Dates Finder)
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '720px', lineHeight: '1.6' }}>
              วิเคราะห์ดัชนีสภาพอากาศ อุณหภูมิเฉลี่ย ปริมาณน้ำฝน ความหนาแน่นของนักท่องเที่ยว และช่วงเวลาซากุระบาน/ใบไม้เปลี่ยนสี
            </p>
          </div>

          {/* Current Selection Callout */}
          <div
            style={{
              background: 'var(--bg-surface-raised)',
              border: '1px solid var(--vermilion)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 20px',
              textAlign: 'right',
              boxShadow: '0 0 20px var(--vermilion-glow)',
            }}
          >
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--vermilion)' }}>
              CURRENT TARGET MONTH
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>
              {selectedMonth.nameTh} ({selectedMonth.nameEn})
            </div>
            <div style={{ fontSize: '12px', color: 'var(--fuji-cyan)', fontFamily: 'var(--font-mono)' }}>
              SCORE: {selectedMonth.overallScore} / 100
            </div>
          </div>
        </div>

        {/* Top 3 Benchmark Windows */}
        <div
          className="grid-cols-3"
          style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-hairline)',
            gap: '14px',
          }}
        >
          {/* Top 1: Nov */}
          <div
            onClick={() => onSelectMonth(MONTHS_DATA[10])}
            style={{
              padding: '16px',
              background: selectedMonth.month === 11 ? 'var(--bg-surface-active)' : 'var(--bg-surface-raised)',
              border: selectedMonth.month === 11 ? '1px solid var(--vermilion)' : '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span className="editorial-tag tag-red" style={{ fontSize: '10px' }}>
                <Award size={11} /> อันดับ 1 ยอดนิยม
              </span>
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34d399' }}>97/100</span>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
              พฤศจิกายน (พ.ย.) • ใบไม้เปลี่ยนสี
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
              ใบเมเปิ้ลสีแดงพีคที่ฟูจิ & แปะก๊วยสีทองโตเกียว ฝนน้อยมาก ฟ้าใส 9-17°C
            </p>
          </div>

          {/* Top 2: May */}
          <div
            onClick={() => onSelectMonth(MONTHS_DATA[4])}
            style={{
              padding: '16px',
              background: selectedMonth.month === 5 ? 'var(--bg-surface-active)' : 'var(--bg-surface-raised)',
              border: selectedMonth.month === 5 ? '1px solid var(--fuji-cyan)' : '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span className="editorial-tag tag-cyan" style={{ fontSize: '10px' }}>
                <Award size={11} /> อันดับ 1 ความคุ้มค่า
              </span>
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34d399' }}>95/100</span>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
              พฤษภาคม (พ.ค.) • หลัง Golden Week
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
              หลัง 8 พ.ค. คนน้อย ตั๋ว/โรงแรมถูกลงมาก อากาศสบาย 15-24°C ดอกชิบะซากุระบาน
            </p>
          </div>

          {/* Top 3: March */}
          <div
            onClick={() => onSelectMonth(MONTHS_DATA[2])}
            style={{
              padding: '16px',
              background: selectedMonth.month === 3 ? 'var(--bg-surface-active)' : 'var(--bg-surface-raised)',
              border: selectedMonth.month === 3 ? '1px solid var(--vermilion)' : '1px solid var(--border-hairline)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span className="editorial-tag tag-red" style={{ fontSize: '10px' }}>
                <Award size={11} /> อันดับ 1 ซากุระ
              </span>
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34d399' }}>92/100</span>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
              ปลายมีนาคม (มี.ค.) • ซากุระแรกแย้ม
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.45' }}>
              ช่วง 22-31 มี.ค. ซากุระเริ่มบานสะพรั่งทั่วโตเกียว อากาศเย็นสดชื่น 6-15°C
            </p>
          </div>
        </div>
      </div>

      {/* View Mode Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', background: 'var(--bg-surface-raised)', padding: '4px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-hairline)' }}>
          <button
            onClick={() => setViewMode('calendar')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: viewMode === 'calendar' ? 'var(--vermilion)' : 'transparent',
              color: viewMode === 'calendar' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            <Calendar size={15} />
            <span>📅 ปฏิทินรายวัน (ราคาตั๋วบินแยกวัน)</span>
          </button>

          <button
            onClick={() => setViewMode('matrix')}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--radius-pill)',
              border: 'none',
              background: viewMode === 'matrix' ? 'var(--vermilion)' : 'transparent',
              color: viewMode === 'matrix' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '13px',
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

        {viewMode === 'calendar' && (
          <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
            คลิกเลือกช่วงวันเดินทางเพื่อประมาณการราคาตั๋วบิน
          </div>
        )}
      </div>

      {/* VIEW 1: CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <InteractiveFlightCalendar
          selectedMonthIndex={selectedMonth.month - 1}
          onSelectMonthIndex={(idx) => onSelectMonth(MONTHS_DATA[idx])}
          selectedRange={selectedRange}
          onSelectRange={(range) => setSelectedRange(range)}
        />
      )}

      {/* VIEW 2: MONTH MATRIX VIEW */}
      {viewMode === 'matrix' && (
        <>
          {/* Goal Filter Strip */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'ทั้งหมด 12 เดือน' },
              { id: 'weather_value', label: '🌟 อากาศดีเลิศ & คุ้มค่า (พ.ค. / ต.ค. / พ.ย.)' },
              { id: 'sakura', label: '🌸 เทศกาลซากุระ (ก.พ. / มี.ค. / เม.ย.)' },
              { id: 'autumn', label: '🍁 ใบไม้เปลี่ยนสี (ต.ค. / พ.ย.)' },
              { id: 'winter', label: '❄️ วิวฟูจิคม & ไฟประดับ (ธ.ค. / ม.ค. / ก.พ.)' },
              { id: 'budget', label: '💰 ประหยัดงบ (Low Cost)' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterGoal(f.id as FilterGoal)}
                className={`btn-editorial-secondary ${filterGoal === f.id ? 'active' : ''}`}
                style={{
                  padding: '8px 16px',
                  fontSize: '12.5px',
                  fontFamily: 'var(--font-mono)',
                  background: filterGoal === f.id ? 'var(--vermilion)' : 'var(--bg-surface)',
                  color: filterGoal === f.id ? '#fff' : 'var(--text-secondary)',
                  border: '1px solid var(--border-hairline)',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* 12 Months Cards Grid */}
          <div className="grid-cols-3">
        {filteredMonths.map((m) => {
          const isSelected = selectedMonth.month === m.month;

          return (
            <div
              key={m.month}
              className="bento-card"
              style={{
                borderColor: isSelected ? 'var(--vermilion)' : 'var(--border-hairline)',
                background: isSelected ? 'var(--bg-surface-active)' : 'var(--grad-dark-bento)',
                boxShadow: isSelected ? '0 0 25px var(--vermilion-glow)' : 'var(--shadow-bento)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
                      MONTH // {String(m.month).padStart(2, '0')}
                    </span>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>
                      {m.nameTh} <span style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontWeight: 400 }}>({m.nameEn})</span>
                    </h3>
                  </div>

                  <span className={`editorial-tag ${getScoreTagClass(m.overallScore)}`} style={{ fontSize: '12px' }}>
                    {m.overallScore}/100
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: '#ff6b8b', fontWeight: 600, marginBottom: '14px' }}>
                  {m.seasonTh}
                </div>

                {/* Metrics */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                    gap: '8px',
                    padding: '10px 12px',
                    background: 'var(--bg-surface-raised)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '14px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff' }}>
                    <Thermometer size={13} color="var(--fuji-cyan)" />
                    <span>{m.avgTempC.min}° - {m.avgTempC.max}°C</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                    <CloudRain size={13} color="#60a5fa" />
                    <span>ฝน {m.rainyDays} วัน</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                    <Users size={13} color="#f59e0b" />
                    <span>คนแน่น: Lv.{m.crowdLevel}/5</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                    <DollarSign size={13} color="#34d399" />
                    <span>ราคา: Lv.{m.priceLevel}/5</span>
                  </div>
                </div>

                {/* Event Alert */}
                {m.sakuraBloom && (
                  <div style={{ padding: '6px 10px', background: 'rgba(255, 42, 95, 0.1)', borderRadius: 'var(--radius-xs)', fontSize: '11.5px', color: '#ff4d79', marginBottom: '10px' }}>
                    🌸 ซากุระ: {m.sakuraBloom}
                  </div>
                )}
                {m.autumnMomiji && (
                  <div style={{ padding: '6px 10px', background: 'rgba(234, 179, 8, 0.1)', borderRadius: 'var(--radius-xs)', fontSize: '11.5px', color: '#facc15', marginBottom: '10px' }}>
                    🍁 ใบไม้เปลี่ยนสี: {m.autumnMomiji}
                  </div>
                )}

                {/* Highlights */}
                <div style={{ marginBottom: '14px' }}>
                  <ul style={{ paddingLeft: '16px', fontSize: '12.5px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {m.highlights.slice(0, 3).map((h, idx) => (
                      <li key={idx}>{h}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectMonth(m)}
                className={isSelected ? 'btn-editorial-primary' : 'btn-editorial-secondary'}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {isSelected ? (
                  <>
                    <Check size={14} /> ล็อกเดือนนี้แล้ว
                  </>
                ) : (
                  'เลือกเดือนนี้'
                )}
              </button>
            </div>
          );
        })}
      </div>
        </>
      )}
    </div>
  );
};
