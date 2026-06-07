"use client";

/**
 * MarketplaceMapView — rendered client-only (imported via next/dynamic ssr:false)
 * Contains all maplibre-gl / react-map-gl code so it never touches the server.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  GeolocateControl,
  type MapRef,
  type ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import Supercluster from "supercluster";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/components/ui/utils";
import type {
  SellerLocation,
  MarketplaceMapViewProps,
} from "./MarketplaceMap";

// ─── Map style ─────────────────────────────────────────────────────────────
// Carto Dark Matter: free vector tiles, no API key required
const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const NIGERIA_CENTER = { longitude: 8.0, latitude: 9.1, zoom: 5.8 };

// ─── Types ─────────────────────────────────────────────────────────────────

type SellerFeature = Supercluster.PointFeature<SellerLocation>;
type AnyCluster =
  | Supercluster.ClusterFeature<Supercluster.AnyProps>
  | SellerFeature;

function isCluster(
  f: AnyCluster
): f is Supercluster.ClusterFeature<Supercluster.AnyProps> {
  return !!(f.properties as { cluster?: boolean }).cluster;
}

// ─── Category colours (same palette as MarketplaceFilters) ─────────────────
const CATEGORY_COLORS: Record<string, string> = {
  "Grains & Cereals": "#10b981",
  "Tubers & Roots": "#f59e0b",
  Vegetables: "#22c55e",
  Fruits: "#f97316",
  Livestock: "#8b5cf6",
  Poultry: "#ef4444",
  "Fish & Seafood": "#0ea5e9",
  "Spices & Herbs": "#d97706",
  Oilseeds: "#84cc16",
  "Processed Foods": "#ec4899",
};
const DEFAULT_COLOR = "#6b7280";
function categoryColor(cat: string) {
  return CATEGORY_COLORS[cat] ?? DEFAULT_COLOR;
}

// ─── CategoryMarker ────────────────────────────────────────────────────────

function CategoryMarker({
  category,
  selected,
  onClick,
}: {
  category: string;
  selected: boolean;
  onClick: () => void;
}) {
  const fill = categoryColor(category);
  return (
    <button
      onClick={onClick}
      aria-label={`${category} seller`}
      className="focus:outline-none"
    >
      <motion.svg
        width={selected ? 38 : 30}
        height={selected ? 48 : 38}
        viewBox="0 0 30 38"
        whileHover={{ scale: 1.15 }}
        animate={{ scale: selected ? 1.2 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,.5))" }}
      >
        {/* Pin body */}
        <path
          d="M15 0C6.716 0 0 6.716 0 15c0 10.5 15 23 15 23S30 25.5 30 15C30 6.716 23.284 0 15 0Z"
          fill={fill}
        />
        {/* Inner dot */}
        <circle cx="15" cy="15" r="6" fill="white" fillOpacity={0.35} />
        {selected && <circle cx="15" cy="15" r="4" fill="white" />}
      </motion.svg>
    </button>
  );
}

// ─── ClusterMarker ─────────────────────────────────────────────────────────

function ClusterMarker({
  count,
  onClick,
}: {
  count: number;
  onClick: () => void;
}) {
  const size = count < 6 ? 34 : count < 21 ? 42 : 52;
  const fontSize = count < 6 ? 13 : count < 21 ? 14 : 16;

  return (
    <button onClick={onClick} aria-label={`Cluster of ${count} sellers`} className="focus:outline-none">
      <motion.div
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        style={{ width: size, height: size, fontSize }}
        className={cn(
          "flex items-center justify-center rounded-full font-bold text-white",
          "border-2 border-white shadow-lg cursor-pointer",
          "bg-emerald-600"
        )}
      >
        {count > 99 ? "99+" : count}
      </motion.div>
    </button>
  );
}

// ─── SellerPopupContent ────────────────────────────────────────────────────
// Rendered inside react-map-gl <Popup>; styled by .agrolink-map-popup CSS

function SellerPopupContent({
  seller,
  onClose,
  onProfileClick,
}: {
  seller: SellerLocation;
  onClose: () => void;
  onProfileClick: (s: SellerLocation) => void;
}) {
  const initials = seller.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Deterministic avatar colour from name charCode
  const avatarHue =
    seller.name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  return (
    <div className="w-64 rounded-2xl bg-slate-900 border border-white/12 overflow-hidden shadow-2xl shadow-black/60">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b border-white/8">
        <div
          className="size-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: `hsl(${avatarHue} 55% 42%)` }}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white truncate">
            {seller.name}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            {/* Stars */}
            <span className="text-amber-400 text-xs">
              {"★".repeat(Math.round(seller.rating))}
            </span>
            <span className="text-xs text-white/50">
              {seller.rating} · {seller.reviewCount} reviews
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close popup"
          className="p-1 rounded-md text-white/40 hover:text-white/80 transition-colors"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      </div>

      {/* Category badge + distance */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/8">
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium"
          style={{
            background: `${categoryColor(seller.category)}22`,
            color: categoryColor(seller.category),
          }}
        >
          {seller.category}
        </span>
        <span className="text-xs text-white/45">
          {seller.distance != null
            ? `${seller.distance} km away`
            : seller.state}
        </span>
      </div>

      {/* Products */}
      <div className="px-3 py-2.5 space-y-1.5">
        <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1">
          Available products
        </p>
        {seller.products.slice(0, 3).map((p) => (
          <div key={p.id} className="flex items-center justify-between">
            <span className="text-xs text-white/70 truncate pr-2">{p.name}</span>
            <span className="text-xs font-medium text-emerald-400 whitespace-nowrap">
              {p.price}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="px-3 pb-3">
        <button
          onClick={() => onProfileClick(seller)}
          className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold py-2 transition-colors"
        >
          View Profile
        </button>
      </div>
    </div>
  );
}

// ─── MarketplaceMapView ────────────────────────────────────────────────────

export default function MarketplaceMapView({
  sellers,
  selectedSeller,
  onSelectSeller,
  className,
}: MarketplaceMapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const moveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Viewport state
  const [viewState, setViewState] = useState(NIGERIA_CENTER);
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(
    null
  );

  // ── Capture bounds on load and after move ──────────────────
  const captureBounds = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const b = map.getBounds();
    setBounds([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
  }, []);

  const handleMapLoad = useCallback(() => {
    captureBounds();
  }, [captureBounds]);

  const handleMove = useCallback(
    (evt: ViewStateChangeEvent) => {
      setViewState(evt.viewState);
      // Debounce cluster recalc — only update bounds 120 ms after last move
      clearTimeout(moveTimerRef.current);
      moveTimerRef.current = setTimeout(captureBounds, 120);
    },
    [captureBounds]
  );

  useEffect(() => {
    return () => clearTimeout(moveTimerRef.current);
  }, []);

  // ── Build Supercluster index ───────────────────────────────
  const scIndex = useMemo(() => {
    const sc = new Supercluster<SellerLocation>({ radius: 55, maxZoom: 14 });
    sc.load(
      sellers.map((s) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [s.longitude, s.latitude],
        },
        properties: s,
      }))
    );
    return sc;
  }, [sellers]);

  // ── Compute clusters for current viewport ─────────────────
  const clusters = useMemo<AnyCluster[]>(() => {
    if (!bounds) return [];
    return scIndex.getClusters(bounds, Math.floor(viewState.zoom)) as AnyCluster[];
  }, [scIndex, bounds, viewState.zoom]);

  // ── Zoom into cluster on click ─────────────────────────────
  const handleClusterClick = useCallback(
    (clusterId: number, lng: number, lat: number) => {
      const zoom = scIndex.getClusterExpansionZoom(clusterId);
      mapRef.current?.flyTo({ center: [lng, lat], zoom, duration: 600 });
    },
    [scIndex]
  );

  // ── Geolocation ────────────────────────────────────────────
  const handleLocateMe = useCallback(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        mapRef.current?.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 11,
          duration: 1000,
        });
      },
      () => {
        /* silently ignore denied */
      }
    );
  }, []);

  return (
    <div className={cn("relative w-full h-full", className)}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={handleMove}
        onLoad={handleMapLoad}
        mapStyle={MAP_STYLE}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
        reuseMaps
      >
        {/* Built-in controls — styled dark via globals.css overrides */}
        <NavigationControl position="top-left" />
        <GeolocateControl
          position="top-left"
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation
        />

        {/* ── Markers ─────────────────────────────────────── */}
        {clusters.map((feature, i) => {
          const [lng, lat] = feature.geometry.coordinates;

          if (isCluster(feature)) {
            const { cluster_id: cid, point_count: count } =
              feature.properties as {
                cluster_id: number;
                point_count: number;
              };
            return (
              <Marker key={`cl-${cid ?? i}`} longitude={lng} latitude={lat} anchor="center">
                <ClusterMarker
                  count={count}
                  onClick={() => handleClusterClick(cid, lng, lat)}
                />
              </Marker>
            );
          }

          // Single seller marker
          const seller = feature.properties as SellerLocation;
          const isSelected = selectedSeller?.id === seller.id;
          return (
            <Marker
              key={seller.id}
              longitude={lng}
              latitude={lat}
              anchor="bottom"
              style={{ zIndex: isSelected ? 10 : 1 }}
            >
              <CategoryMarker
                category={seller.category}
                selected={isSelected}
                onClick={() =>
                  onSelectSeller(isSelected ? null : seller)
                }
              />
            </Marker>
          );
        })}

        {/* ── Popup ───────────────────────────────────────── */}
        <AnimatePresence>
          {selectedSeller && (
            <Popup
              key={selectedSeller.id}
              longitude={selectedSeller.longitude}
              latitude={selectedSeller.latitude}
              anchor="bottom"
              offset={[0, -42] as [number, number]}
              closeButton={false}
              closeOnClick={false}
              onClose={() => onSelectSeller(null)}
              className="agrolink-map-popup"
            >
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
              >
                <SellerPopupContent
                  seller={selectedSeller}
                  onClose={() => onSelectSeller(null)}
                  onProfileClick={(s) => console.log("View profile:", s.id)}
                />
              </motion.div>
            </Popup>
          )}
        </AnimatePresence>
      </Map>

      {/* ── Custom "Locate me" overlay (complements GeolocateControl) ── */}
      {/* GeolocateControl is already rendered above — no extra button needed */}

      {/* Map attribution */}
      <a
        href="https://carto.com/attributions"
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-1 right-1 z-10 text-[10px] text-white/30 hover:text-white/50"
      >
        © CARTO · © OpenStreetMap contributors
      </a>
    </div>
  );
}
