"use client";
import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MarkerClusterGroup from "react-leaflet-cluster";

interface Restaurant {
  id: number;
  name: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  cuisine: string | null;
  opening_hours: string | null;
  website: string | null;
  region: string | null;
  distance?: number;
}

const interestedIcon = L.divIcon({
  className: "",
  html: `<div style="width:28px;height:28px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:14px;">🐟</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -16],
});

const bookmarkIcon = L.divIcon({
  className: "",
  html: `<div style="width:28px;height:28px;background:#fbbf24;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:14px;">🐟</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -16],
});

const defaultIcon = L.divIcon({
  className: "",
  html: `<div style="width:24px;height:24px;background:#1e3a5f;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;font-size:12px;">🐟</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -14],
});

function cuisineLabel(cuisine: string | null): string {
  if (!cuisine) return '';
  const map: Record<string, string> = {
    sushi: '🍣 寿司',
    japanese: '🍱 和食',
    seafood: '🦞 海鮮',
    fish: '🐟 魚料理',
  };
  return map[cuisine] || cuisine;
}

interface MapProps {
  restaurants: Restaurant[];
  center: [number, number];
  bookmarks: Set<number>;
  interested: Set<number>;
  onToggleBookmark: (id: number) => void;
  onToggleInterested: (id: number) => void;
}

function MapInit({ center }: { center: [number, number] }) {
  const map = useMap();
  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      map.setView(center, 14);
      initialized.current = true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any)._fishtimeMap = map;
    }
  }, [center, map]);
  return null;
}

export default function FishtimeMap({ restaurants, center, bookmarks, interested, onToggleBookmark, onToggleInterested }: MapProps) {
  return (
    <MapContainer center={center} zoom={14} style={{ height: "100%", width: "100%" }} zoomControl={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapInit center={center} />
      <Marker position={center} icon={L.divIcon({
        className: "",
        html: `<div style="width:16px;height:16px;background:#ef4444;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);"></div>`,
        iconSize: [16, 16], iconAnchor: [8, 8],
      })}>
        <Popup>📍 現在地</Popup>
      </Marker>

      <MarkerClusterGroup
        iconCreateFunction={(cluster: { getChildCount: () => number; getAllChildMarkers: () => L.Marker[] }) => {
          const count = cluster.getChildCount();
          const markers = cluster.getAllChildMarkers();
          const hasInterested = markers.some(m => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const id = (m.options as any).restaurantId;
            return interested.has(id);
          });
          const hasBookmark = markers.some(m => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const id = (m.options as any).restaurantId;
            return bookmarks.has(id);
          });
          const bg = hasInterested ? '#3b82f6' : hasBookmark ? '#fbbf24' : '#1e3a5f';
          return L.divIcon({
            className: "",
            html: `<div style="width:40px;height:40px;background:${bg};border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;flex-direction:column;">
              <span style="font-size:14px;">🐟</span>
              <span style="font-size:10px;color:white;font-weight:bold;line-height:1;">${count}</span>
            </div>`,
            iconSize: [40, 40], iconAnchor: [20, 20],
          });
        }}
      >
        {restaurants.map(restaurant => {
          const isInterested = interested.has(restaurant.id);
          const isBookmarked = bookmarks.has(restaurant.id);
          const icon = isInterested ? interestedIcon : isBookmarked ? bookmarkIcon : defaultIcon;

          return (
            <Marker
              key={restaurant.id}
              position={[restaurant.latitude, restaurant.longitude]}
              icon={icon}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              {...{ restaurantId: restaurant.id } as any}
            >
              <Popup>
                <div style={{ minWidth: "180px" }}>
                  <p style={{ fontWeight: "bold", marginBottom: "4px", fontSize: "14px" }}>
                    🐟 {restaurant.name || "名称不明"}
                  </p>
                  {restaurant.cuisine && (
                    <p style={{ fontSize: "12px", color: "#3b82f6", marginBottom: "4px" }}>
                      {cuisineLabel(restaurant.cuisine)}
                    </p>
                  )}
                  {restaurant.address && (
                    <p style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>{restaurant.address}</p>
                  )}
                  {restaurant.opening_hours && (
                    <p style={{ fontSize: "11px", color: "#888", marginBottom: "6px" }}>🕐 {restaurant.opening_hours}</p>
                  )}
                  <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
                    <button
                      onClick={() => onToggleInterested(restaurant.id)}
                      style={{ flex: 1, padding: "4px", background: isInterested ? "#3b82f6" : "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                    >{isInterested ? "♥ 気になる中" : "♥ 気になる"}</button>
                    <button
                      onClick={() => onToggleBookmark(restaurant.id)}
                      style={{ flex: 1, padding: "4px", background: isBookmarked ? "#fbbf24" : "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}
                    >{isBookmarked ? "⭐ 登録中" : "☆ お気に入り"}</button>
                  </div>
                  <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
                    <a
                      href={"https://line.me/R/share?text=" + encodeURIComponent("🐟 " + (restaurant.name || "") + "\n" + (restaurant.address || "") + "\nhttps://fishtime.vercel.app")}
                      target="_blank" rel="noopener noreferrer"
                      style={{ flex: 1, padding: "4px", background: "#06C755", borderRadius: "4px", fontSize: "12px", color: "white", textAlign: "center", textDecoration: "none", fontWeight: "bold" }}
                    >LINE</a>
                    <a
                      href={"https://twitter.com/intent/tweet?text=" + encodeURIComponent("🐟 " + (restaurant.name || "") + " でランチ！\n" + (restaurant.address || "") + "\n#フィッシュタイム #海鮮\nhttps://fishtime.vercel.app")}
                      target="_blank" rel="noopener noreferrer"
                      style={{ flex: 1, padding: "4px", background: "#000", borderRadius: "4px", fontSize: "12px", color: "white", textAlign: "center", textDecoration: "none", fontWeight: "bold" }}
                    >X 投稿</a>
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: "block", textAlign: "center", background: "#1e3a5f", color: "white", padding: "6px", borderRadius: "4px", fontSize: "12px", textDecoration: "none" }}
                  >🗺️ Google Maps で開く</a>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
