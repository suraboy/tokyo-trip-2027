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
  Info, 
  Flame, 
  CalendarDays,
  Thermometer
} from 'lucide-react';

interface BestDatesTabProps {
  selectedMonth: MonthData;
  onSelectMonth: (month: MonthData) => void;
}

type FilterGoal = 'all' | 'sakura' | 'autumn' | 'weather_value' | 'winter' | 'budget';

export const BestDatesTab: React.FC<BestDatesTabProps> = ({
  selectedMonth,
  onSelectMonth,
}) => {
  const [filterGoal, setFilterGoal] = useState<FilterGoal>('all');

  const filteredMonths = MONTHS_DATA.filter((m) => {
    if (filterGoal === 'sakura') return m.month === 3 || m.month === 4 || m.month === 2;
    if (filterGoal === 'autumn') return m.month === 10 || m.month === 11;
    if (filterGoal === 'weather_value') return m.month === 5 || m.month === 10 || m.month === 11;
    if (filterGoal === 'winter') return m.month === 12 || m.month === 1 || m.month === 2;
    if (filterGoal === 'budget') return m.priceLevel <= 2;
    return true;
  });

  const getScoreColor = (score: number) => {
    if (score >= 93) return '#10b981'; // Emerald
    if (score >= 85) return '#38bdf8'; // Sky blue
    if (score >= 75) return '#fbbf24'; // Amber
    return '#94a3b8';
  };

  const renderDots = (level: number, color: string) => {
    return (
      <div style={{ display: 'flex', gap: '3px' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: i <= level ? color : 'rgba(255, 255, 255, 0.1)',
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Info */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-sakura">
                <Sparkles size={12} /> Smart Seasonality Engine 2027
              </span>
              <span className="badge badge-cyan">โตเกียว & ภูมิภาคคันโต</span>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
              หาวันและเดือนที่ดีที่สุดสำหรับเที่ยวญี่ปุ่น (Best Dates Finder)
            </h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', maxWidth: '750px', lineHeight: '1.5' }}>
              วิเคราะห์สภาพอากาศ อุณหภูมิเฉลี่ย ปริมาณฝน ความหนาแน่นของนักท่องเที่ยว และความคุ้มค่าของราคา เพื่อเลือกช่วงเวลาที่ตรงกับสไตล์การเที่ยวของคุณมากที่สุด
            </p>
          </div>

          <div
            style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: '12px',
              padding: '12px 18px',
              textAlign: 'right',
            }}
          >
            <div style={{ fontSize: '11px', color: '#fb7185' }}>เดือนที่คุณเลือกปัจจุบัน</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff' }}>
              {selectedMonth.nameTh} ({selectedMonth.nameEn})
            </div>
            <div style={{ fontSize: '12px', color: '#38bdf8' }}>
              คะแนนความน่าเที่ยว: {selectedMonth.overallScore} / 100
            </div>
          </div>
        </div>

        {/* Top 3 Recommended Time Windows Callout */}
        <div
          style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '14px',
          }}
        >
          {/* Top 1 */}
          <div
            onClick={() => onSelectMonth(MONTHS_DATA[10])}
            style={{
              padding: '14px',
              background: selectedMonth.month === 11 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              border: selectedMonth.month === 11 ? '1px solid var(--accent-pink)' : '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span className="badge badge-sakura" style={{ fontSize: '11px' }}>
                <Award size={12} /> อันดับ 1 ยอดนิยม
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>Score 97/100</span>
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', margin: '4px 0' }}>
              พฤศจิกายน (พ.ย.) • ใบไม้เปลี่ยนสี
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4' }}>
              ใบเมเปิ้ลสีแดงพีคที่ฟูจิ & ถนนแปะก๊วยสีทองในโตเกียว ฟ้าใส ไร้ฝน อากาศ 9-17°C
            </p>
          </div>

          {/* Top 2 */}
          <div
            onClick={() => onSelectMonth(MONTHS_DATA[4])}
            style={{
              padding: '14px',
              background: selectedMonth.month === 5 ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              border: selectedMonth.month === 5 ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span className="badge badge-cyan" style={{ fontSize: '11px' }}>
                <Award size={12} /> อันดับ 1 ความคุ้มค่า
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>Score 95/100</span>
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', margin: '4px 0' }}>
              พฤษภาคม (พ.ค.) • หลัง Golden Week
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4' }}>
              หลัง 8 พ.ค. คนโล่ง ตั๋วและโรงแรมถูกลงมาก อากาศสบาย 15-24°C ดอกชิบะซากุระบาน
            </p>
          </div>

          {/* Top 3 */}
          <div
            onClick={() => onSelectMonth(MONTHS_DATA[2])}
            style={{
              padding: '14px',
              background: selectedMonth.month === 3 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              border: selectedMonth.month === 3 ? '1px solid var(--accent-pink)' : '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span className="badge badge-sakura" style={{ fontSize: '11px' }}>
                <Award size={12} /> อันดับ 1 ซากุระ
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#10b981' }}>Score 92/100</span>
            </div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#fff', margin: '4px 0' }}>
              ปลายมีนาคม (มี.ค.) • ซากุระแรกแย้ม
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.4' }}>
              ช่วง 22-31 มี.ค. ซากุระเริ่มบานสะพรั่งทั่วโตเกียว อากาศเย็นสดชื่น 6-15°C
            </p>
          </div>
        </div>
      </div>

      {/* Goal Filter Pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'ทั้งหมด (12 เดือน)' },
          { id: 'weather_value', label: '🌟 อากาศดีเลิศ & คุ้มค่า (พ.ค. / ต.ค. / พ.ย.)' },
          { id: 'sakura', label: '🌸 เทศกาลซากุระ (ก.พ. / มี.ค. / เม.ย.)' },
          { id: 'autumn', label: '🍁 ใบไม้เปลี่ยนสี (ต.ค. / พ.ย.)' },
          { id: 'winter', label: '❄️ วิวฟูจิชัด & ดูไฟประดับ (ธ.ค. / ม.ค. / ก.พ.)' },
          { id: 'budget', label: '💰 ทริปประหยัดงบ (Low Cost Period)' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterGoal(f.id as FilterGoal)}
            className={`btn-secondary ${filterGoal === f.id ? 'active' : ''}`}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              borderRadius: '9999px',
              background: filterGoal === f.id ? 'var(--accent-pink)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: filterGoal === f.id ? 'var(--accent-pink)' : 'var(--border-subtle)',
              color: filterGoal === f.id ? '#fff' : 'var(--text-muted)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 12 Months Cards Grid */}
      <div className="grid-12-months">
        {filteredMonths.map((m) => {
          const isSelected = selectedMonth.month === m.month;
          return (
            <div
              key={m.month}
              className="card"
              style={{
                borderColor: isSelected ? 'var(--accent-pink)' : 'rgba(255, 255, 255, 0.1)',
                background: isSelected
                  ? 'linear-gradient(180deg, rgba(244, 63, 94, 0.12) 0%, rgba(15, 23, 42, 0.9) 100%)'
                  : 'var(--gradient-card)',
                boxShadow: isSelected ? '0 0 25px rgba(244, 63, 94, 0.25)' : 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                {/* Month Top Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Month {m.month}
                    </span>
                    <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>
                      {m.nameTh} <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 400 }}>({m.nameEn})</span>
                    </h3>
                  </div>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'rgba(0, 0, 0, 0.4)',
                      border: `2px solid ${getScoreColor(m.overallScore)}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '13px',
                      color: getScoreColor(m.overallScore),
                    }}
                  >
                    {m.overallScore}
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: '#fb7185', fontWeight: 600, marginBottom: '12px' }}>
                  {m.seasonTh}
                </div>

                {/* Weather & Specs */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '8px',
                    padding: '10px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '8px',
                    marginBottom: '14px',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                    <Thermometer size={14} color="#38bdf8" />
                    <span>{m.avgTempC.min}° - {m.avgTempC.max}°C</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                    <CloudRain size={14} color="#60a5fa" />
                    <span>ฝนเฉลี่ย {m.rainyDays} วัน</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                    <Users size={14} color="#f59e0b" />
                    <span>คนแน่น:</span>
                    {renderDots(m.crowdLevel, '#f59e0b')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                    <DollarSign size={14} color="#34d399" />
                    <span>ราคา:</span>
                    {renderDots(m.priceLevel, '#34d399')}
                  </div>
                </div>

                {/* Sakura / Autumn Bloom Callout */}
                {m.sakuraBloom && (
                  <div style={{ padding: '6px 10px', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '6px', fontSize: '11.5px', color: '#fb7185', marginBottom: '10px' }}>
                    🌸 ซากุระ: {m.sakuraBloom}
                  </div>
                )}
                {m.autumnMomiji && (
                  <div style={{ padding: '6px 10px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '6px', fontSize: '11.5px', color: '#fbbf24', marginBottom: '10px' }}>
                    🍁 ใบไม้เปลี่ยนสี: {m.autumnMomiji}
                  </div>
                )}

                {/* Highlights List */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '4px' }}>จุดเด่นประจำเดือน:</div>
                  <ul style={{ paddingLeft: '16px', fontSize: '12.5px', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {m.highlights.map((h, idx) => (
                      <li key={idx}>{h}</li>
                    ))}
                  </ul>
                </div>

                {/* Clothing tip */}
                <div style={{ fontSize: '11.5px', color: '#94a3b8', marginBottom: '16px', fontStyle: 'italic' }}>
                  🧥 การแต่งกาย: {m.clothingAdvice}
                </div>
              </div>

              {/* Select Button */}
              <button
                onClick={() => onSelectMonth(m)}
                className={isSelected ? 'btn-primary' : 'btn-secondary'}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {isSelected ? (
                  <>
                    <Check size={16} /> เลือกเดือนนี้แล้ว
                  </>
                ) : (
                  'เลือกเดือนนี้สำหรับทริป 2027'
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
