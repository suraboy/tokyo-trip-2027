'use client';

import React, { useState } from 'react';
import { TabType, Currency, MonthData, FlightOption, Attraction } from '@/types/travel';
import { MONTHS_DATA, FLIGHT_OPTIONS, ATTRACTIONS_DATA } from '@/data/mockData';
import { Navbar } from '@/components/Navbar';
import { OverviewTab } from '@/components/OverviewTab';
import { BestDatesTab } from '@/components/BestDatesTab';
import { FlightsTab } from '@/components/FlightsTab';
import { AttractionsTab } from '@/components/AttractionsTab';
import { ItineraryBudgetTab } from '@/components/ItineraryBudgetTab';
import { WayfinderRoadmapTab } from '@/components/WayfinderRoadmapTab';
import { AttractionModal } from '@/components/AttractionModal';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [currency, setCurrency] = useState<Currency>('THB');
  const [selectedMonth, setSelectedMonth] = useState<MonthData>(MONTHS_DATA[10]); // Default November (Score 97)
  const [selectedFlight, setSelectedFlight] = useState<FlightOption | undefined>(FLIGHT_OPTIONS[0]); // TG676
  const [wishlistIds, setWishlistIds] = useState<string[]>([
    'shibuya-sky',
    'teamlab-planets',
    'sensoji-asakusa',
    'fuji-kawaguchiko',
    'tsukiji-outer-market',
    'tokyo-disneysea',
  ]);
  const [tripDurationDays, setTripDurationDays] = useState<number>(7);
  const [modalAttraction, setModalAttraction] = useState<Attraction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleToggleWishlist = (id: string) => {
    const spot = ATTRACTIONS_DATA.find((a) => a.id === id);
    const spotName = spot ? spot.nameTh.split('(')[0] : 'สถานที่';

    if (wishlistIds.includes(id)) {
      setWishlistIds(wishlistIds.filter((item) => item !== id));
      showToast(`ลบ "${spotName}" ออกจาก Wishlist แล้ว`);
    } else {
      setWishlistIds([...wishlistIds, id]);
      showToast(`เพิ่ม "${spotName}" ลงใน Wishlist แล้ว ❤️`);
    }
  };

  const handleSelectMonth = (month: MonthData) => {
    setSelectedMonth(month);
    showToast(`เลือกช่วงเวลาเดินทางเป็น: ${month.nameTh} (${month.seasonTh}) ✨`);
  };

  const handleSelectFlight = (flight: FlightOption) => {
    setSelectedFlight(flight);
    showToast(`เลือกเที่ยวบิน: ${flight.airline} (${flight.flightNumber}) ✈️`);
  };

  const wishlistAttractions = ATTRACTIONS_DATA.filter((a) => wishlistIds.includes(a.id));

  return (
    <div className="app-container">
      {/* Background glow orbs */}
      <div className="bg-glow-container">
        <div className="bg-glow-circle-1" />
        <div className="bg-glow-circle-2" />
        <div className="bg-glow-circle-3" />
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid var(--accent-pink)',
            boxShadow: '0 10px 25px rgba(244, 63, 94, 0.3)',
            borderRadius: '12px',
            padding: '12px 20px',
            color: '#fff',
            fontSize: '13.5px',
            fontWeight: 600,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backdropFilter: 'blur(10px)',
            animation: 'modalIn 0.2s ease-out',
          }}
        >
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={setCurrency}
        wishlistCount={wishlistIds.length}
        selectedMonthName={selectedMonth.nameTh}
      />

      {/* Main Content Area */}
      <main>
        {activeTab === 'overview' && (
          <OverviewTab
            setActiveTab={setActiveTab}
            selectedMonth={selectedMonth}
            selectedFlight={selectedFlight}
            wishlistAttractions={wishlistAttractions}
            currency={currency}
            tripDurationDays={tripDurationDays}
          />
        )}

        {activeTab === 'dates' && (
          <BestDatesTab
            selectedMonth={selectedMonth}
            onSelectMonth={handleSelectMonth}
          />
        )}

        {activeTab === 'flights' && (
          <FlightsTab
            selectedFlight={selectedFlight}
            onSelectFlight={handleSelectFlight}
            currency={currency}
            selectedMonthName={selectedMonth.nameTh}
          />
        )}

        {activeTab === 'attractions' && (
          <AttractionsTab
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            onSelectAttractionForModal={(a) => setModalAttraction(a)}
            currency={currency}
          />
        )}

        {activeTab === 'itinerary' && (
          <ItineraryBudgetTab
            wishlistAttractions={wishlistAttractions}
            selectedFlight={selectedFlight}
            selectedMonth={selectedMonth}
            currency={currency}
            tripDurationDays={tripDurationDays}
            setTripDurationDays={setTripDurationDays}
          />
        )}

        {activeTab === 'wayfinder' && (
          <WayfinderRoadmapTab
            selectedMonth={selectedMonth}
            selectedFlight={selectedFlight}
            wishlistCount={wishlistIds.length}
          />
        )}
      </main>

      {/* Attraction Detail Modal */}
      <AttractionModal
        attraction={modalAttraction}
        onClose={() => setModalAttraction(null)}
        currency={currency}
        isWishlisted={modalAttraction ? wishlistIds.includes(modalAttraction.id) : false}
        onToggleWishlist={handleToggleWishlist}
      />
    </div>
  );
}
