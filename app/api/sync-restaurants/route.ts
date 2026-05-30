import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

const REGIONS = [
  { name: '関東',       bbox: '35.0,138.8,36.2,140.9' },
  { name: '関西',       bbox: '34.2,134.9,35.1,136.0' },
  { name: '中京',       bbox: '34.5,136.5,35.5,137.8' },
  { name: '北海道',     bbox: '41.4,140.0,45.6,145.9' },
  { name: '東北',       bbox: '36.8,139.5,41.5,141.8' },
  { name: '北陸・信越', bbox: '35.5,136.0,37.7,138.9' },
  { name: '中国・四国', bbox: '32.9,130.5,35.0,134.5' },
  { name: '九州',       bbox: '31.0,129.5,34.0,132.0' },
  { name: '沖縄',       bbox: '24.0,122.9,26.9,128.3' },
];

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

async function fetchFromOverpass(query: string): Promise<Response> {
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        signal: AbortSignal.timeout(90000),
      });
      if (res.ok) return res;
    } catch {
      // 次のエンドポイントを試す
    }
    await new Promise(r => setTimeout(r, 2000));
  }
  throw new Error('全Overpassエンドポイントが失敗');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.SYNC_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const results: Record<string, number> = {};
  let total = 0;

  // テーブルを空にする
  await supabase.from('restaurants').delete().neq('id', 0);

  for (const region of REGIONS) {
    const query = `
      [out:json][timeout:90];
      (
        node["amenity"="restaurant"]["cuisine"="sushi"](${region.bbox});
        node["amenity"="restaurant"]["cuisine"="japanese"](${region.bbox});
        node["amenity"="restaurant"]["cuisine"="seafood"](${region.bbox});
        node["amenity"="restaurant"]["cuisine"="fish"](${region.bbox});
      );
      out body;
    `;

    try {
      const res = await fetchFromOverpass(query);
      const data = await res.json();
      const restaurants = data.elements.map((el: {
        id: number;
        lat: number;
        lon: number;
        tags?: Record<string, string>;
      }) => ({
        id: el.id,
        name: el.tags?.name || el.tags?.['name:ja'] || null,
        latitude: el.lat,
        longitude: el.lon,
        address: el.tags?.['addr:full'] || el.tags?.['addr:street'] || null,
        cuisine: el.tags?.cuisine || null,
        opening_hours: el.tags?.opening_hours || null,
        website: el.tags?.website || el.tags?.['contact:website'] || null,
        region: region.name,
      }));

      for (let i = 0; i < restaurants.length; i += 1000) {
        const chunk = restaurants.slice(i, i + 1000);
        await supabase.from('restaurants').upsert(chunk);
      }

      results[region.name] = restaurants.length;
      total += restaurants.length;
      await new Promise(r => setTimeout(r, 5000));
    } catch (e) {
      results[region.name] = -1;
      console.error(`${region.name} エラー:`, e);
    }
  }

  return NextResponse.json({ success: true, total, regions: results });
}
