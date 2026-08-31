import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Fetch Real-time JPY to THB Forex rate
    let jpyToThb = 0.232;
    let forexUpdatedAt = new Date().toISOString();
    try {
      const forexRes = await fetch('https://open.er-api.com/v6/latest/JPY', {
        next: { revalidate: 3600 },
      });
      if (forexRes.ok) {
        const forexData = await forexRes.json();
        if (forexData.rates?.THB) {
          jpyToThb = Number(forexData.rates.THB.toFixed(4));
          forexUpdatedAt = forexData.time_last_update_utc || forexUpdatedAt;
        }
      }
    } catch (e) {
      console.warn('Forex fetch fallback:', e);
    }

    // 2. Fetch Real-time Tokyo Weather from Open-Meteo (Shinjuku / Tokyo Station)
    let weatherData = {
      tempC: 18.5,
      humidity: 55,
      weatherCode: 0,
      conditionText: 'ฟ้าใส แดดอ่อนๆ',
      windSpeedKmH: 8.2,
      updatedAt: new Date().toISOString(),
    };

    try {
      const weatherRes = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=35.6895&longitude=139.6917&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia%2FTokyo',
        { next: { revalidate: 1800 } }
      );
      if (weatherRes.ok) {
        const wJson = await weatherRes.json();
        const cur = wJson.current;
        if (cur) {
          const code = cur.weather_code || 0;
          let text = 'แจ่มใส ฟ้าเปิด';
          if (code >= 1 && code <= 3) text = 'มีเมฆบางส่วน';
          else if (code >= 45 && code <= 48) text = 'มีหมอกบาง';
          else if (code >= 51 && code <= 67) text = 'มีฝนตกปรอยๆ';
          else if (code >= 71 && code <= 77) text = 'หิมะตก';
          else if (code >= 80 && code <= 82) text = 'ฝนตกเป็นช่วงๆ';
          else if (code >= 95) text = 'พายุฝนฟ้าคะนอง';

          weatherData = {
            tempC: cur.temperature_2m,
            humidity: cur.relative_humidity_2m,
            weatherCode: code,
            conditionText: text,
            windSpeedKmH: cur.wind_speed_10m,
            updatedAt: cur.time || new Date().toISOString(),
          };
        }
      }
    } catch (e) {
      console.warn('Weather fetch fallback:', e);
    }

    return NextResponse.json({
      success: true,
      source: 'live_public_apis',
      timestamp: new Date().toISOString(),
      forex: {
        base: 'JPY',
        target: 'THB',
        rate: jpyToThb,
        lastUpdated: forexUpdatedAt,
      },
      weather: {
        city: 'Tokyo, Japan',
        coordinates: { lat: 35.6895, lon: 139.6917 },
        ...weatherData,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch live data' },
      { status: 500 }
    );
  }
}
