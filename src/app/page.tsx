'use client';

import React, { useState, useEffect } from 'react';
import { Currency, Language, CommunityTripPlan } from '@/types/travel';
import { Navbar } from '@/components/Navbar';
import { OverviewTab } from '@/components/OverviewTab';
import { CreateTripModal } from '@/components/CreateTripModal';
import { TripPlannerWorkspace } from '@/components/TripPlannerWorkspace';

export default function Home() {
  const [currency, setCurrency] = useState<Currency>('THB');
  const [language, setLanguageState] = useState<Language>('th');

  // Restore saved language after mount (avoids SSR hydration mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tokyo-trip-lang');
      if (saved === 'th' || saved === 'en') setLanguageState(saved);
    } catch {}
  }, []);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const setLanguage = (lang: Language) => {
    if (lang === language) return;
    setLanguageState(lang);
    try {
      localStorage.setItem('tokyo-trip-lang', lang);
    } catch {}
    document.documentElement.lang = lang;
    showToast(lang === 'th' ? '🇹🇭 สลับเป็นภาษาไทยเรียบร้อยแล้ว' : '🇬🇧 Switched to English successfully');
  };
  const tr = (th: string, en: string) => (language === 'th' ? th : en);

  // Community Trip Plans State from DB
  const [communityPlans, setCommunityPlans] = useState<CommunityTripPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // Active Trip Planner Workspace State
  const [isWorkspaceActive, setIsWorkspaceActive] = useState<boolean>(false);
  const [activeWorkspacePlan, setActiveWorkspacePlan] = useState<CommunityTripPlan | null>(null);
  const [workspaceTripTitle, setWorkspaceTripTitle] = useState<string>('ทริปโตเกียว & ฟูจิ 2027');
  const [workspaceCreatorName, setWorkspaceCreatorName] = useState<string>('SuraBoy');

  const fetchPlansFromDb = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/trips');
      const data = await res.json();
      if (data.success && Array.isArray(data.trips)) {
        setCommunityPlans(data.trips);
      }
    } catch (e) {
      console.error('Failed to fetch from DB', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlansFromDb();
  }, []);

  // Launch fresh workspace from modal
  const handleStartNewWorkspace = (title: string, creator: string) => {
    setActiveWorkspacePlan(null);
    setWorkspaceTripTitle(title);
    setWorkspaceCreatorName(creator);
    setIsWorkspaceActive(true);
    showToast(tr(`เปิด Dashboard วางแผนทริป "${title}" แล้ว 🚀`, `Opened planner dashboard "${title}" 🚀`));
  };

  // Launch workspace from an existing community plan card
  const handleOpenPlanInWorkspace = (trip: CommunityTripPlan) => {
    setActiveWorkspacePlan(trip);
    setWorkspaceTripTitle(trip.trip_title);
    setWorkspaceCreatorName(trip.creator_name);
    setIsWorkspaceActive(true);
    showToast(tr(`เปิด Dashboard สำหรับทริป "${trip.trip_title}" แล้ว 🗺️`, `Opened dashboard for "${trip.trip_title}" 🗺️`));
  };

  const handleSaveTripFromWorkspace = async (newPlanData: Partial<CommunityTripPlan>) => {
    try {
      showToast(tr('กำลังบันทึกข้อมูลลง Database...', 'Saving to database...'));
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlanData),
      });
      const data = await res.json();

      if (data.success && data.trip) {
        setActiveWorkspacePlan(data.trip);
        setCommunityPlans((prev) => {
          const exists = prev.some((p) => p.id === data.trip.id);
          if (exists) {
            return prev.map((p) => (p.id === data.trip.id ? data.trip : p));
          }
          return [data.trip, ...prev];
        });
        showToast(tr(`บันทึกแพลน "${data.trip.trip_title}" ลง DB สำเร็จ! 💾`, `Plan "${data.trip.trip_title}" saved! 💾`));
      } else {
        showToast(tr('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'Error saving data'));
      }
    } catch (e) {
      showToast(tr('เกิดข้อผิดพลาดในการเชื่อมต่อ Database', 'Database connection error'));
    }
  };

  return (
    <div className="app-container">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'var(--bg-surface-active)',
            border: '1px solid var(--vermilion)',
            boxShadow: '0 10px 25px var(--vermilion-glow)',
            borderRadius: 'var(--radius-pill)',
            padding: '12px 22px',
            color: '#fff',
            fontSize: '13.5px',
            fontWeight: 700,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        currency={currency}
        setCurrency={setCurrency}
        language={language}
        setLanguage={setLanguage}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* Main Workspace or Home Overview */}
      <main>
        {isWorkspaceActive ? (
          <TripPlannerWorkspace
            key={activeWorkspacePlan ? activeWorkspacePlan.id : 'new-workspace'}
            tripTitle={workspaceTripTitle}
            creatorName={workspaceCreatorName}
            initialPlan={activeWorkspacePlan}
            currency={currency}
            language={language}
            onBackToHome={() => setIsWorkspaceActive(false)}
            onSaveTrip={handleSaveTripFromWorkspace}
          />
        ) : (
          <OverviewTab
            currency={currency}
            language={language}
            communityPlans={communityPlans}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onSelectTripForDetail={handleOpenPlanInWorkspace}
          />
        )}
      </main>

      {/* 1-Step Quick Start Modal */}
      <CreateTripModal
        isOpen={isCreateModalOpen}
        language={language}
        onClose={() => setIsCreateModalOpen(false)}
        onStartWorkspace={handleStartNewWorkspace}
      />
    </div>
  );
}
