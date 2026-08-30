'use client';

import React, { useState } from 'react';
import { Attraction, Currency } from '@/types/travel';
import { ATTRACTIONS_DATA, JPY_TO_THB_RATE } from '@/data/mockData';
import { 
  MapPin, 
  Search, 
  Heart, 
  Clock, 
  Train, 
  Star, 
  Sparkles, 
  Filter, 
  DollarSign,
  ChevronRight,
  Eye
} from 'lucide-react';

interface AttractionsTabProps {
  wishlistIds: string[];
  onToggleWishlist: (id: string) => void;
  onSelectAttractionForModal: (attraction: Attraction) => void;
  currency: Currency;
}

export const AttractionsTab: React.FC<AttractionsTabProps> = ({
  wishlistIds,
  onToggleWishlist,
  onSelectAttractionForModal,
  currency,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [wishlistOnly, setWishlistOnly] = useState<boolean>(false);

  const categories = [
    { id: 'all', label: 'ทุกหมวดหมู่' },
    { id: 'Nature & View', label: '🏙️ วิวมุมสูง & ธรรมชาติ' },
    { id: 'Culture & Shrine', label: '⛩️ วัด & วัฒนธรรม' },
    { id: 'Anime & Tech', label: '🎮 อนิเมะ & เกม' },
    { id: 'Shopping & Food', label: '🍜 สตรีทฟู้ด & ช้อปปิ้ง' },
    { id: 'Theme Park', label: '🎡 ธีมปาร์คระดับโลก' },
  ];

  const cities = ['all', 'Tokyo', 'Fuji/Hakone', 'Kyoto', 'Osaka', 'Yokohama'];

  const filteredAttractions = ATTRACTIONS_DATA.filter((item) => {
    if (wishlistOnly && !wishlistIds.includes(item.id)) return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedCity !== 'all' && item.city !== selectedCity) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName =
        item.nameEn.toLowerCase().includes(q) ||
        item.nameTh.toLowerCase().includes(q) ||
        item.nameJp.toLowerCase().includes(q) ||
        item.area.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchName) return false;
    }
    return true;
  });

  const formatPrice = (jpy: number) => {
    if (jpy === 0) return 'ฟรี (Free)';
    if (currency === 'THB') {
      return `฿${Math.round(jpy * JPY_TO_THB_RATE).toLocaleString()} THB`;
    }
    return `¥${jpy.toLocaleString()} JPY`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Attractions Header */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-emerald">
                <Sparkles size={12} /> Curated Japan Highlights
              </span>
              <span className="badge badge-sakura">โตเกียว • ฟูจิ • โอซาก้า • เกียวโต</span>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
              ลิสต์สถานที่ท่องเที่ยวญี่ปุ่นยอดนิยม (Japan Attractions Explorer)
            </h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', maxWidth: '750px', lineHeight: '1.5' }}>
              รวบรวมไฮไลท์สำคัญ ข้อมูลสถานีรถไฟที่ใกล้ที่สุด ระยะเวลาที่แนะนำในการเที่ยว และเคล็ดลับเฉพาะสำหรับแต่ละสถานที่ กดปุ่มหัวใจ ❤️ เพื่อบันทึกลงใน Wishlist ของทริปนี้
            </p>
          </div>

          <button
            onClick={() => setWishlistOnly(!wishlistOnly)}
            className={`btn-secondary ${wishlistOnly ? 'active' : ''}`}
            style={{
              padding: '10px 18px',
              borderRadius: '9999px',
              background: wishlistOnly ? 'var(--accent-pink)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: wishlistOnly ? 'var(--accent-pink)' : 'var(--border-subtle)',
              color: wishlistOnly ? '#fff' : 'var(--text-muted)',
            }}
          >
            <Heart size={16} fill={wishlistOnly ? '#fff' : 'none'} />
            <span>Wishlist ของฉัน ({wishlistIds.length} ที่)</span>
          </button>
        </div>

        {/* Search & City Filter Bar */}
        <div
          style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {/* Search Box */}
          <div
            style={{
              flex: 1,
              minWidth: '240px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px' }} />
            <input
              type="text"
              placeholder="ค้นหาชื่อสถานที่, ย่าน (เช่น Shibuya, Asakusa, Fuji, Mario, TeamLab)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '13.5px',
                outline: 'none',
              }}
            />
          </div>

          {/* City Pills */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {cities.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCity(c)}
                className={`btn-secondary ${selectedCity === c ? 'active' : ''}`}
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  borderRadius: '9999px',
                  background: selectedCity === c ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  borderColor: selectedCity === c ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                  color: selectedCity === c ? '#38bdf8' : 'var(--text-muted)',
                }}
              >
                {c === 'all' ? 'ทุกเมือง' : c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px' }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`btn-secondary ${selectedCategory === cat.id ? 'active' : ''}`}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              borderRadius: '9999px',
              background: selectedCategory === cat.id ? 'var(--accent-emerald)' : 'rgba(255, 255, 255, 0.04)',
              borderColor: selectedCategory === cat.id ? 'var(--accent-emerald)' : 'var(--border-subtle)',
              color: selectedCategory === cat.id ? '#000' : 'var(--text-muted)',
              fontWeight: selectedCategory === cat.id ? 700 : 500,
              whiteSpace: 'nowrap',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Attractions Grid */}
      <div className="grid-3">
        {filteredAttractions.map((item) => {
          const isWishlisted = wishlistIds.includes(item.id);

          return (
            <div
              key={item.id}
              className="card"
              style={{
                padding: '0',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
              }}
              onClick={() => onSelectAttractionForModal(item)}
            >
              {/* Photo & Badge Overlays */}
              <div style={{ position: 'relative', height: '190px', width: '100%', overflow: 'hidden' }}>
                <img
                  src={item.imageUrl}
                  alt={item.nameEn}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.1) 60%, rgba(0,0,0,0.4) 100%)',
                  }}
                />

                {/* Top Badges */}
                <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                  <span className="badge badge-sakura" style={{ fontSize: '11px', backdropFilter: 'blur(8px)' }}>
                    {item.city}
                  </span>
                  <span className="badge badge-cyan" style={{ fontSize: '11px', backdropFilter: 'blur(8px)' }}>
                    {item.area}
                  </span>
                </div>

                {/* Wishlist Heart Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWishlist(item.id);
                  }}
                  className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                  style={{ position: 'absolute', top: '12px', right: '12px' }}
                >
                  <Heart size={16} fill={isWishlisted ? '#fff' : 'none'} />
                </button>

                {/* Bottom title in image */}
                <div style={{ position: 'absolute', bottom: '12px', left: '16px', right: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                    <Star size={12} fill="#fbbf24" /> Score {item.mustVisitScore}/100
                  </div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                    {item.nameTh}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '16px 18px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
                    {item.nameEn}
                  </div>

                  <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: '1.45', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.descriptionTh}
                  </p>
                </div>

                <div>
                  {/* Meta Specs */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 10px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      fontSize: '11.5px',
                      color: '#cbd5e1',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} color="#38bdf8" />
                      <span>{item.estimatedTimeHours} ชม.</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Train size={12} color="#34d399" />
                      <span style={{ maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.nearestStation.split(' ')[0]}
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, color: item.priceJPY === 0 ? '#34d399' : '#38bdf8' }}>
                      {formatPrice(item.priceJPY)}
                    </div>
                  </div>

                  {/* View Details Button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      #{item.category}
                    </span>
                    <span style={{ fontSize: '12px', color: '#fb7185', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                      ดูรายละเอียด & Tips <ChevronRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
