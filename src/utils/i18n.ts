import { Language } from '@/types/travel';

export const translations = {
  th: {
    // Navbar
    tripHeaderTag: '🌸 ทริปญี่ปุ่น 2027',
    exchangeRate: 'เรทเงินเยน: 100 JPY ≈ 23.50 THB',
    tokyoTime: 'เวลาโตเกียว:',
    brandTitle: 'TOKYO TRIP 2027',
    brandTag: '🌸 Japan Vacation',
    brandSubtitle: 'ชุมชนแบ่งปันและวางแผนเที่ยวญี่ปุ่นแบบเข้าใจง่าย',
    createPlanBtn: '+ สร้างแพลนใหม่',
    currencyThb: '฿ THB',
    currencyJpy: '¥ JPY',
    langTh: '🇹🇭 TH',
    langEn: '🇬🇧 EN',

    // Overview Hero
    heroTag1: 'วางแผนเที่ยวญี่ปุ่น 2027',
    heroTag2: 'โตเกียว • ฟูจิ • คันไซ',
    heroTag3: (count: number) => `มี ${count} แพลนในระบบ`,
    heroTitleLine1: 'สร้างแพลนท่องเที่ยวของคุณง่ายๆ',
    heroTitleLine2: 'และค้นหาแรงบันดาลใจจากเพื่อนๆ ในชุมชน',
    heroDesc: 'อยากไปเที่ยวญี่ปุ่นกี่วัน? ไปช่วงซากุระหรือใบไม้เปลี่ยนสี? ปักหมุดสถานที่ที่คุณอยากไป แล้วสร้างแพลนสวยๆ แชร์ให้เพื่อนหรือครอบครัวดูได้ทันที',
    heroCta: '+ เริ่มสร้างแพลนเที่ยวของคุณ',

    // Community Feed
    communitySectionTitle: 'แผนท่องเที่ยวจากเพื่อนๆ ในชุมชน',
    communitySectionSubtitle: 'คลิกเพื่อเปิดดูรายละเอียด และปรับแต่งเป็นทริปของคุณเองได้ทันที',
    searchPlaceholder: 'ค้นหาชื่อแพลน, ที่เที่ยว (เช่น ฟูจิ, ชิบูย่า, ซากุระ)...',
    filterAll: '🔥 ทั้งหมด',
    filterShort: '⚡ 3-5 วัน (วันลาน้อย)',
    filterMedium: '🗼 6-8 วัน (โตเกียว+ฟูจิ)',
    filterLong: '🚄 9+ วัน (ข้ามเมือง)',
    emptyTitle: 'ยังไม่มีแพลนท่องเที่ยวในระบบ',
    emptyDesc: 'เป็นคนแรกที่สร้างแพลนเที่ยวญี่ปุ่น แล้วแชร์ให้เพื่อนๆ ในคอมมูนิตี้ดูกันเลย!',
    daysUnit: 'วัน',
    spotsInTrip: (count: number) => `สถานที่ในทริปนี้ (${count} แห่ง):`,
    moreSpots: (count: number) => `+${count} อื่นๆ`,
    estBudget: 'งบประมาณ:',
    openDashboardBtn: '🚀 เปิด Dashboard แพลนนี้',

    // Create Modal
    modalTag1: '1-STEP QUICK START',
    modalTag2: '🌸 TOKYO EXPEDITION',
    modalTitle: 'เริ่มต้นวางแผนทริปญี่ปุ่น 2027',
    modalDesc: 'กรอกเพียง 2 ช่องเพื่อเปิด Dashboard วางแผน: เลือกที่เที่ยวใกล้โตเกียว ดูระยะทางจากที่พัก และเทียบตั๋วเครื่องบินราคาดีที่สุด',
    fieldTripTitle: '✏️ ตั้งชื่อแพลนเที่ยวของคุณ *',
    fieldTripTitlePlaceholder: 'เช่น ทริปโตเกียว-ฟูจิ ใบไม้เปลี่ยนสี 7 วัน, ทริปครอบครัว...',
    fieldCreator: '🎒 ชื่อของคุณ / นามแฝง *',
    fieldCreatorPlaceholder: 'เช่น SuraBoy, NekoTraveler',
    modalSubmitBtn: 'ไปยัง Dashboard วางแผนทริป',

    // Workspace Header & Navigation
    backHomeBtn: 'กลับหน้าหลัก',
    savePlanBtn: 'บันทึกแผนทริปลงระบบ',
    savingBtn: 'กำลังบันทึก...',
    spotsChecked: (count: number) => `${count} จุดเช็คอิน`,
    step1Title: '1. ปฏิทินเลือกวัน & ตั๋วบิน',
    step2Title: '2. เที่ยวบินราคาดีที่สุด',
    step3Title: '3. เลือกที่พักราคาดีที่สุด',
    step4Title: '4. สถานที่ท่องเที่ยว & ใกล้โตเกียว',
    step5Title: '5. แผนที่ & ระยะทาง',

    // Calendar
    calendarMatrixTitle: 'ปฏิทิน 12 เดือน และ ราคาเที่ยวบินไป-กลับ 2027',
    calendarMatrixSubtitle: 'คลิกเพื่อเปลี่ยนเดือน หรือกด "วันไป" และ "วันกลับ" บนปฏิทินรายวันด้านล่าง',
    roundTripTotal: 'รวมไป-กลับ',
    dayWent: '🛫 วันไป',
    dayReturn: '🛬 วันกลับ',
    dayIndexLabel: (idx: number, total: number) => `✨ วันที่ ${idx}/${total}`,
    selectedRangeSummary: 'ช่วงวันที่เลือกเดินทาง:',
    flightSearchLinks: 'ค้นหาตั๋วจริงตามช่วงเวลานี้:',
    nextToFlightStep: 'ไปยังขั้นตอน 2: เลือกตั๋วเครื่องบิน ➔',

    // Flights Tab
    flightsTitle: 'เที่ยวบินกรุงเทพฯ - โตเกียว (ไป-กลับ)',
    flightsSubtitle: 'เปรียบเทียบตั๋วบินตรง & แวะพัก ราคาที่ดีที่สุด พร้อมน้ำหนักกระเป๋าและอาหาร',
    directFlightBadge: 'บินตรง Direct',
    oneStopBadge: (airport: string) => `แวะ 1 จุด (${airport})`,
    baggageLabel: 'กระเป๋า:',
    mealsLabel: 'อาหาร:',
    mealsIncluded: 'รวมในตั๋ว',
    mealsExtra: 'ซื้อเพิ่ม',
    selectFlightAndProceed: 'เลือกไฟลท์นี้ ➔ ไปเลือกโรงแรม',
    flightSelected: '✓ เลือกแล้ว ➔ ไปเลือกโรงแรม',
    roundTripTaxIncluded: 'ไป-กลับ รวมภาษี',

    // Hotel Tab
    hotelsTitle: 'เปรียบเทียบโรงแรม & ย่านที่พักยอดนิยมในโตเกียว',
    hotelsSubtitle: 'เลือกย่านที่ตอบโจทย์ พร้อมเทียบราคาเรียลไทม์จาก Agoda, Booking.com, Trip.com',
    selectHotelAndProceed: 'เลือกโรงแรมนี้ ➔ ไปเลือกที่เที่ยว',
    hotelSelected: '✓ เลือกแล้ว ➔ ไปเลือกที่เที่ยว',
    walkMinutesToStation: (station: string, min: number) => `เดิน ${min} นาทีถึงสถานี ${station}`,
    lowestPriceBadge: 'ราคาดีที่สุด Lowest',
    hotelPricePerNight: 'ราคาเฉลี่ย / คืน (รวมภาษี)',

    // Attractions Tab
    attractionsTitle: 'คลังสถานที่ท่องเที่ยวในโตเกียว & ใกล้โตเกียว (<2 ชม.)',
    attractionsSubtitle: 'ค้นหาสถานที่ หรือดึงสถานที่จริงจาก Google Maps เพื่อปักหมุดลงแผนที่ทริป',
    searchAttractionsPlaceholder: 'ค้นหาชื่อสถานที่ (เช่น ชิบูย่า, วัดเซนโซจิ, ฟูจิ, คาวากุจิโกะ)...',
    googleMapsDeepSearch: 'ค้นหาและเพิ่มจาก Google Maps โดยตรง',
    addCustomSpotPrompt: '+ เพิ่มสถานที่นี้เข้าในทริปของคุณ',
    freeEntry: 'เข้าชมฟรี (FREE)',
    entranceFee: 'ค่าเข้าชม:',
    viewDetailsModal: 'ดูข้อมูลเพิ่มเติม',
    selectedInTrip: '✓ เลือกแล้วในทริป',
    addSpotToTrip: '+ เพิ่มลงในทริป',
    proceedToMapStep: 'ไปดูแผนที่ & เส้นทางเดินทาง ➔',

    // Map & Transit Tab
    mapTitle: 'แผนที่เส้นทางท่องเที่ยวและเวลาเดินทางจริง',
    mapSubtitle: 'จำลองการเดินทางจากสนามบินสู่ที่พัก และจากโรงแรมไปยังจุดเช็คอินทุกแห่ง',
    airportTransferGuideTitle: 'คู่มือการเดินทางจากสนามบินเข้าสู่ที่พัก (Leg 0 Airport Transfer)',
    airportTransferGuideSubtitle: 'คำแนะนำการเดินทางตรงสู่โรงแรมของคุณเพื่อความสะดวกที่สุด',
    recommendedTrainForHotel: 'คำแนะนำการเดินทางสู่โรงแรมของคุณ:',
    distanceLabel: 'ระยะทาง:',
    estimatedTransitTime: 'เวลาเดินทางประมาณ:',
    openGoogleMapsDirections: 'เปิดเส้นทางบน Google Maps',
    transitSummaryTitle: 'สรุปเวลาเดินทางจากโรงแรมสู่สถานที่ทั้งหมด:',
  },

  en: {
    // Navbar
    tripHeaderTag: '🌸 Japan Trip 2027',
    exchangeRate: 'Exchange Rate: 100 JPY ≈ 23.50 THB',
    tokyoTime: 'Tokyo Time:',
    brandTitle: 'TOKYO TRIP 2027',
    brandTag: '🌸 Japan Vacation',
    brandSubtitle: 'Intuitive Japan Travel Planner & Community',
    createPlanBtn: '+ Create Plan',
    currencyThb: '฿ THB',
    currencyJpy: '¥ JPY',
    langTh: '🇹🇭 TH',
    langEn: '🇬🇧 EN',

    // Overview Hero
    heroTag1: 'Plan Japan Trip 2027',
    heroTag2: 'Tokyo • Fuji • Kansai',
    heroTag3: (count: number) => `${count} Plans Available`,
    heroTitleLine1: 'Build Your Japan Itinerary Easily',
    heroTitleLine2: '& Explore Community Inspirations',
    heroDesc: 'How many days? Cherry blossoms or autumn foliage? Pin your favorite spots and craft a stunning itinerary ready to share with friends and family.',
    heroCta: '+ Start Creating Your Plan',

    // Community Feed
    communitySectionTitle: 'Community Trip Itineraries',
    communitySectionSubtitle: 'Click any plan to inspect details and customize it for your dream trip',
    searchPlaceholder: 'Search trip name, spots (e.g. Fuji, Shibuya, Sakura)...',
    filterAll: '🔥 All Plans',
    filterShort: '⚡ 3-5 Days (Quick)',
    filterMedium: '🗼 6-8 Days (Tokyo+Fuji)',
    filterLong: '🚄 9+ Days (Cross-city)',
    emptyTitle: 'No trip plans found',
    emptyDesc: 'Be the first to create a Japan trip plan and inspire travelers across the globe!',
    daysUnit: 'Days',
    spotsInTrip: (count: number) => `Spots in this trip (${count}):`,
    moreSpots: (count: number) => `+${count} more`,
    estBudget: 'Est. Budget:',
    openDashboardBtn: '🚀 Open Plan Dashboard',

    // Create Modal
    modalTag1: '1-STEP QUICK START',
    modalTag2: '🌸 TOKYO EXPEDITION',
    modalTitle: 'Start Planning Tokyo Trip 2027',
    modalDesc: 'Fill in 2 simple fields to launch the planner: select spots near Tokyo, calculate transit from hotel, and compare best flight deals.',
    fieldTripTitle: '✏️ Name Your Trip Plan *',
    fieldTripTitlePlaceholder: 'e.g. Tokyo & Fuji Autumn 7 Days, Family Getaway...',
    fieldCreator: '🎒 Your Name / Handle *',
    fieldCreatorPlaceholder: 'e.g. SuraBoy, NekoTraveler',
    modalSubmitBtn: 'Launch Planner Dashboard',

    // Workspace Header & Navigation
    backHomeBtn: 'Back to Home',
    savePlanBtn: 'Save Plan to Database',
    savingBtn: 'Saving...',
    spotsChecked: (count: number) => `${count} Checked Spots`,
    step1Title: '1. Best Dates & Flight Calendar',
    step2Title: '2. Best Flight Deals',
    step3Title: '3. Hotel Price Comparison',
    step4Title: '4. Tokyo & Nearby Attractions',
    step5Title: '5. Map & Transit Routes',

    // Calendar
    calendarMatrixTitle: '12-Month Matrix & Round-Trip Flight Prices 2027',
    calendarMatrixSubtitle: 'Click to select month or pick departure and return dates on the interactive calendar below',
    roundTripTotal: 'Round-Trip',
    dayWent: '🛫 Departure',
    dayReturn: '🛬 Return',
    dayIndexLabel: (idx: number, total: number) => `✨ Day ${idx}/${total}`,
    selectedRangeSummary: 'Selected Travel Window:',
    flightSearchLinks: 'Search Live Flights for These Dates:',
    nextToFlightStep: 'Proceed to Step 2: Flight Deals ➔',

    // Flights Tab
    flightsTitle: 'Bangkok - Tokyo Flights (Round-Trip)',
    flightsSubtitle: 'Compare best direct and 1-stop flights with baggage and meal inclusions',
    directFlightBadge: 'Direct Flight',
    oneStopBadge: (airport: string) => `1 Stop (${airport})`,
    baggageLabel: 'Baggage:',
    mealsLabel: 'Meals:',
    mealsIncluded: 'Included',
    mealsExtra: 'Add-on',
    selectFlightAndProceed: 'Select Flight ➔ Proceed to Hotels',
    flightSelected: '✓ Selected ➔ Proceed to Hotels',
    roundTripTaxIncluded: 'Round-Trip Taxes Included',

    // Hotel Tab
    hotelsTitle: 'Compare Top Tokyo Hotels & Neighborhoods',
    hotelsSubtitle: 'Pick your ideal base and compare live rates from Agoda, Booking.com, Trip.com',
    selectHotelAndProceed: 'Select Hotel ➔ Proceed to Attractions',
    hotelSelected: '✓ Selected ➔ Proceed to Attractions',
    walkMinutesToStation: (station: string, min: number) => `${min} min walk to ${station} Station`,
    lowestPriceBadge: 'Lowest Price',
    hotelPricePerNight: 'Avg. Rate / Night (Incl. Taxes)',

    // Attractions Tab
    attractionsTitle: 'Tokyo & Day Trip Attractions (<2 Hours)',
    attractionsSubtitle: 'Explore iconic spots or search and import custom places directly from Google Maps',
    searchAttractionsPlaceholder: 'Search spot names (e.g. Shibuya, Sensoji, Fuji, Kawaguchiko)...',
    googleMapsDeepSearch: 'Search & Import from Google Maps',
    addCustomSpotPrompt: '+ Add this place to your trip',
    freeEntry: 'FREE Admission',
    entranceFee: 'Admission Fee:',
    viewDetailsModal: 'View Details',
    selectedInTrip: '✓ Added to Trip',
    addSpotToTrip: '+ Add to Trip',
    proceedToMapStep: 'View Map & Transit Routes ➔',

    // Map & Transit Tab
    mapTitle: 'Real-Time Map & Transit Route Visualizer',
    mapSubtitle: 'Interactive route mapping from airport to hotel and from hotel to all check-in spots',
    airportTransferGuideTitle: 'Airport to Hotel Transit Guide (Leg 0 Airport Transfer)',
    airportTransferGuideSubtitle: 'Recommended express train and bus routes directly to your hotel',
    recommendedTrainForHotel: 'Recommended Transit Route:',
    distanceLabel: 'Distance:',
    estimatedTransitTime: 'Estimated Transit:',
    openGoogleMapsDirections: 'Open Directions in Google Maps',
    transitSummaryTitle: 'Transit Breakdown from Hotel to All Attractions:',
  },
};

export const useI18n = (lang: Language) => {
  return translations[lang] || translations.th;
};
