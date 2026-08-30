export type TabType = 'overview' | 'dates' | 'flights' | 'attractions' | 'itinerary' | 'wayfinder';

export type Currency = 'THB' | 'JPY';

export interface MonthData {
  month: number;
  nameEn: string;
  nameTh: string;
  seasonEn: string;
  seasonTh: string;
  avgTempC: { min: number; max: number };
  rainyDays: number;
  crowdLevel: 1 | 2 | 3 | 4 | 5; // 1 = Low, 5 = Extreme Peak
  priceLevel: 1 | 2 | 3 | 4 | 5;
  overallScore: number; // 1 - 100
  highlights: string[];
  pros: string[];
  cons: string[];
  recommendedFor: string[];
  sakuraBloom?: string;
  autumnMomiji?: string;
  clothingAdvice: string;
}

export interface FlightOption {
  id: string;
  airline: string;
  airlineCode: string;
  logoColor: string;
  flightNumber: string;
  from: string; // BKK / DMK
  fromName: string;
  to: string; // NRT / HND / KIX
  toName: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number; // 0 = Direct, 1 = 1 Stop
  stopAirport?: string;
  transitDuration?: string;
  aircraft: string;
  basePriceTHB: number;
  baggageIncludedKg: number;
  mealsIncluded: boolean;
  seatPitch: string;
  cabinClass: 'Economy' | 'Premium Economy' | 'Business';
  flightType: 'Full Service' | 'Low Cost';
  rating: number;
  tags: string[];
}

export interface Attraction {
  id: string;
  nameEn: string;
  nameJp: string;
  nameTh: string;
  city: 'Tokyo' | 'Kyoto' | 'Osaka' | 'Fuji/Hakone' | 'Yokohama';
  area: string;
  category: 'Sightseeing' | 'Culture & Shrine' | 'Nature & View' | 'Anime & Tech' | 'Shopping & Food' | 'Theme Park';
  descriptionTh: string;
  highlightTh: string;
  estimatedTimeHours: number;
  recommendedTimeOfDay: 'Morning' | 'Afternoon' | 'Sunset' | 'Night' | 'Anytime';
  priceJPY: number;
  nearestStation: string;
  walkingMinutes: number;
  crowdRating: number; // 1 - 5
  mustVisitScore: number; // 1 - 100
  imageUrl: string;
  tipsTh: string[];
  bestSeason?: string;
  tags: string[];
}

export interface WayfinderDecision {
  id: string;
  title: string;
  category: 'Dates' | 'Flights' | 'Stays' | 'Attractions' | 'Passes & Budget';
  status: 'DECIDED' | 'IN_PROGRESS' | 'BLOCKED' | 'FOG';
  summaryTh: string;
  selectedOption?: string;
  impactTh: string;
  actionRequired?: string;
}

export interface TripPlanState {
  targetYear: number;
  targetMonth: number;
  tripDurationDays: number;
  selectedFlightId: string | null;
  wishlistAttractionIds: string[];
  selectedDatesRange: { start: string; end: string } | null;
  budgetEstimates: {
    flightTHB: number;
    hotelPerNightTHB: number;
    dailyFoodJPY: number;
    jrPassJPY: number;
    activitiesJPY: number;
    shoppingJPY: number;
  };
  customNotes: string;
}
