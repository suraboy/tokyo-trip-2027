/**
 * Dynamic Deep-link Generators for Real-time Flight & Hotel Search
 * Generates direct booking links with exact dates, origin, destination, and hotel names.
 */

// Format date for Skyscanner (YYMMDD)
export function formatDateForSkyscanner(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${year.slice(2)}${month}${day}`;
}

// Generate Google Flights Live Search URL with selected dates
export function getGoogleFlightsUrl(
  origin: string = 'BKK',
  destination: string = 'TYO',
  startDate: string = '2027-11-10',
  endDate: string = '2027-11-16'
): string {
  return `https://www.google.com/travel/flights?q=Flights%20to%20${destination}%20from%20${origin}%20on%20${startDate}%20through%20${endDate}`;
}

// Generate Skyscanner Live Flight Search URL
export function getSkyscannerFlightUrl(
  startDate: string = '2027-11-10',
  endDate: string = '2027-11-16'
): string {
  const s = formatDateForSkyscanner(startDate) || '271110';
  const e = formatDateForSkyscanner(endDate) || '271116';
  return `https://www.skyscanner.co.th/transport/flights/bkkt/tyoa/${s}/${e}/?adultsv2=1&cabinclass=economy`;
}

// Generate Trip.com Live Flight Search URL
export function getTripComFlightUrl(
  startDate: string = '2027-11-10',
  endDate: string = '2027-11-16'
): string {
  return `https://th.trip.com/flights/bangkok-to-tokyo/tickets-bkk-tyo?dcity=bkk&acity=tyo&ddate=${startDate}&rdate=${endDate}&adult=1&flighttype=rt`;
}

// Generate Agoda Live Flight Search URL
export function getAgodaFlightUrl(
  startDate: string = '2027-11-10',
  endDate: string = '2027-11-16'
): string {
  return `https://www.agoda.com/flights/search?origin=BKK&destination=TYO&departDate=${startDate}&returnDate=${endDate}&cabinType=Economy&adults=1`;
}

// Generate Agoda Live Hotel Search with exact dates & guests
export function getAgodaHotelSearchUrl(
  hotelName: string,
  checkIn: string = '2027-11-10',
  checkOut: string = '2027-11-16'
): string {
  const query = encodeURIComponent(`${hotelName} Tokyo`);
  return `https://www.agoda.com/search?textToSearch=${query}&checkIn=${checkIn}&checkOut=${checkOut}&rooms=1&adults=2`;
}

// Generate Booking.com Live Hotel Search with exact dates
export function getBookingComHotelSearchUrl(
  hotelName: string,
  checkIn: string = '2027-11-10',
  checkOut: string = '2027-11-16'
): string {
  const query = encodeURIComponent(`${hotelName} Tokyo`);
  return `https://www.booking.com/searchresults.html?ss=${query}&checkin=${checkIn}&checkout=${checkOut}&group_adults=2&no_rooms=1`;
}

// Generate Trip.com Live Hotel Search
export function getTripComHotelSearchUrl(
  hotelName: string,
  checkIn: string = '2027-11-10',
  checkOut: string = '2027-11-16'
): string {
  const query = encodeURIComponent(`${hotelName} Tokyo`);
  return `https://th.trip.com/hotels/list?keyword=${query}&checkIn=${checkIn}&checkOut=${checkOut}&roomNum=1&adult=2`;
}

// Generate Expedia Live Hotel Search
export function getExpediaHotelSearchUrl(
  hotelName: string,
  checkIn: string = '2027-11-10',
  checkOut: string = '2027-11-16'
): string {
  const query = encodeURIComponent(`${hotelName} Tokyo Japan`);
  return `https://www.expedia.co.th/Hotel-Search?destination=${query}&startDate=${checkIn}&endDate=${checkOut}&adults=2`;
}

// Generate Google Hotels Live Price Search
export function getGoogleHotelsSearchUrl(
  hotelName: string,
  checkIn: string = '2027-11-10',
  checkOut: string = '2027-11-16'
): string {
  const query = encodeURIComponent(`${hotelName} Tokyo`);
  return `https://www.google.com/travel/hotels?q=${query}&checkin=${checkIn}&checkout=${checkOut}`;
}
