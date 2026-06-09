"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import Map, {
  Marker,
  Source,
  Layer,
  NavigationControl,
  type MapRef,
  type LayerProps,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPhone,
  FiMessageSquare,
  FiAlertCircle,
  FiMapPin,
  FiPackage,
  FiClock,
  FiCheck,
  FiTruck,
  FiWifi,
  FiWifiOff,
  FiX,
  FiCopy,
  FiUser,
  FiAlertTriangle,
  FiNavigation,
  FiTrendingUp,
} from "react-icons/fi";

// ─── Brand palette ─────────────────────────────────────────────────────────────
const GREEN = "#16a34a";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface LatLng {
  lat: number;
  lng: number;
}

type DeliveryStatus =
  | "placed"
  | "confirmed"
  | "pickup_scheduled"
  | "in_transit"
  | "out_for_delivery"
  | "delivered";

type ConnectionType = "websocket" | "polling" | "offline";

interface OrderSummary {
  id: string;
  product: string;
  quantity: string;
  weight: string;
  pickupAddress: string;
  deliveryAddress: string;
  estimatedDelivery: Date;
  status: DeliveryStatus;
}

interface DriverInfo {
  name: string;
  photo: string;
  rating: number;
  reviews: number;
  phone: string;
  vehicle: string;
  plate: string;
  vehicleColor: string;
}

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  timestamp: string | null;
  status: "completed" | "active" | "pending";
}

// ─── Constants ─────────────────────────────────────────────────────────────────

/** Route waypoints: Mushin Market → Victoria Island, Lagos */
const ROUTE_COORDS: LatLng[] = [
  { lat: 6.5244, lng: 3.3792 }, // Pickup: Mushin Market
  { lat: 6.5180, lng: 3.3720 },
  { lat: 6.5100, lng: 3.3640 },
  { lat: 6.5000, lng: 3.3700 },
  { lat: 6.4900, lng: 3.3850 },
  { lat: 6.4750, lng: 3.3950 },
  { lat: 6.4600, lng: 3.4100 },
  { lat: 6.4430, lng: 3.4150 }, // Delivery: Victoria Island
];

const INITIAL_VEHICLE_INDEX = 3;

const MOCK_ORDER: OrderSummary = {
  id: "AGR-2026-4821",
  product: "Organic Maize (Grade A)",
  quantity: "50 bags",
  weight: "2,500 kg",
  pickupAddress: "Mushin Market, Lagos State",
  deliveryAddress: "Plot 1234, Adeola Odeku St, Victoria Island, Lagos",
  estimatedDelivery: new Date(Date.now() + 45 * 60 * 1000),
  status: "in_transit",
};

const MOCK_DRIVER: DriverInfo = {
  name: "Emeka Okafor",
  photo: "",
  rating: 4.8,
  reviews: 312,
  phone: "+2348012345678",
  vehicle: "Truck (3-tonne flatbed)",
  plate: "LND 432 AG",
  vehicleColor: "White",
};

const STATUS_CONFIG: Record<
  DeliveryStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  placed: {
    label: "Order Placed",
    color: "text-gray-600",
    bg: "bg-gray-100",
    border: "border-gray-200",
  },
  confirmed: {
    label: "Confirmed",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  pickup_scheduled: {
    label: "Pickup Scheduled",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  in_transit: {
    label: "In Transit",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
  },
  out_for_delivery: {
    label: "Out for Delivery",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
  delivered: {
    label: "Delivered",
    color: "text-green-800",
    bg: "bg-green-100",
    border: "border-green-300",
  },
};

/** Inline raster MapStyle using OpenStreetMap tiles — no API key required. */
const MAP_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: "raster" as const,
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "osm-layer",
      type: "raster" as const,
      source: "osm",
    },
  ],
};

const ROUTE_REMAINING_LAYER: LayerProps = {
  id: "route-remaining",
  type: "line",
  paint: {
    "line-color": "#d1d5db",
    "line-width": 4,
    "line-opacity": 0.8,
    "line-dasharray": [4, 3],
  },
};

const ROUTE_COVERED_LAYER: LayerProps = {
  id: "route-covered",
  type: "line",
  paint: {
    "line-color": GREEN,
    "line-width": 5,
    "line-opacity": 0.9,
  },
};

const ISSUE_TYPES = [
  "Driver not responding",
  "Wrong delivery address",
  "Package damaged",
  "Unexpected delay",
  "Vehicle breakdown",
  "Other",
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatCountdown(ms: number): string {
  if (ms <= 0) return "Arriving now";
  const totalSecs = Math.floor(ms / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildGeoLine(
  coords: LatLng[]
): GeoJSON.Feature<GeoJSON.LineString> {
  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: coords.map((c) => [c.lng, c.lat]),
    },
    properties: {},
  };
}

// ─── Custom hook: useDeliveryTracking ──────────────────────────────────────────

function useDeliveryTracking(orderId: string) {
  const [vehicleIndex, setVehicleIndex] = useState(INITIAL_VEHICLE_INDEX);
  const [vehiclePosition, setVehiclePosition] = useState<LatLng>(
    ROUTE_COORDS[INITIAL_VEHICLE_INDEX]
  );
  const [isOnline, setIsOnline] = useState(
    typeof window !== "undefined" ? navigator.onLine : true
  );
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [connectionType, setConnectionType] = useState<ConnectionType>("polling");

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const advanceVehicle = useCallback(() => {
    setVehicleIndex((prev) => {
      const next = Math.min(prev + 1, ROUTE_COORDS.length - 1);
      if (next !== prev) {
        setVehiclePosition(ROUTE_COORDS[next]);
        setLastUpdated(new Date());
      }
      return next;
    });
  }, []);

  /** Online / offline detection */
  useEffect(() => {
    const onOnline = () => {
      setIsOnline(true);
      setConnectionType("polling");
    };
    const onOffline = () => {
      setIsOnline(false);
      setConnectionType("offline");
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  /** WebSocket with polling fallback */
  useEffect(() => {
    if (!isOnline) {
      if (pollRef.current) clearInterval(pollRef.current);
      wsRef.current?.close();
      return;
    }

    const startPolling = () => {
      setConnectionType("polling");
      // Demo: advance every 8s so movement is visible; production would use 30s
      pollRef.current = setInterval(advanceVehicle, 8_000);
    };

    try {
      /**
       * Replace with your actual WS endpoint, e.g.:
       *   new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/tracking/${orderId}`)
       *
       * The server should emit JSON: { location: { lat, lng }, timestamp }
       */
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
      if (!wsUrl) throw new Error("WS not configured — using polling");

      const ws = new WebSocket(`${wsUrl}/tracking/${orderId}`);
      wsRef.current = ws;

      ws.onopen = () => setConnectionType("websocket");
      ws.onmessage = (evt: MessageEvent<string>) => {
        try {
          const data = JSON.parse(evt.data) as {
            location: LatLng;
            timestamp?: string;
          };
          setVehiclePosition(data.location);
          setLastUpdated(new Date());
        } catch {
          // ignore malformed message
        }
      };
      ws.onerror = () => {
        ws.close();
        startPolling();
      };
      ws.onclose = () => {
        if (connectionType !== "offline") startPolling();
      };
    } catch {
      startPolling();
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      wsRef.current?.close();
    };
  }, [orderId, isOnline, advanceVehicle, connectionType]);

  return { vehiclePosition, vehicleIndex, isOnline, lastUpdated, connectionType };
}

// ─── CountdownTimer ────────────────────────────────────────────────────────────

function CountdownTimer({ target }: { target: Date }) {
  const [remaining, setRemaining] = useState(() => target.getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => setRemaining(target.getTime() - Date.now()), 1_000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <span className="font-bold text-green-700 tabular-nums">
      {formatCountdown(remaining)}
    </span>
  );
}

// ─── StarRating ────────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={`text-sm leading-none ${
            s <= Math.round(rating) ? "text-yellow-400" : "text-gray-200"
          }`}
        >
          ★
        </span>
      ))}
      <span className="ml-1 text-xs font-semibold text-gray-700">{rating}</span>
    </div>
  );
}

// ─── OfflineBanner ─────────────────────────────────────────────────────────────

function OfflineBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm text-amber-800 font-medium"
    >
      <FiWifiOff size={15} className="text-amber-600 shrink-0" />
      <span>
        You&apos;re offline. Showing last known vehicle location — live tracking
        will resume when reconnected.
      </span>
    </motion.div>
  );
}

// ─── OrderSummaryCard ──────────────────────────────────────────────────────────

interface OrderSummaryCardProps {
  order: OrderSummary;
  isOnline: boolean;
  connectionType: ConnectionType;
  lastUpdated: Date;
}

function OrderSummaryCard({
  order,
  isOnline,
  connectionType,
  lastUpdated,
}: OrderSummaryCardProps) {
  const cfg = STATUS_CONFIG[order.status];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <FiPackage className="text-green-600" size={14} />
            <span className="text-[11px] text-gray-400 font-medium">Order ID</span>
            <span className="text-[11px] font-bold text-gray-700 font-mono">
              {order.id}
            </span>
          </div>
          <h2 className="text-base font-bold text-gray-900 leading-snug">
            {order.product}
          </h2>
          <p className="text-sm text-gray-500">
            {order.quantity} · {order.weight}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* Status badge */}
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}
          >
            {order.status === "in_transit" && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
            )}
            {cfg.label}
          </span>

          {/* Connection indicator */}
          <div
            className={`flex items-center gap-1 text-[11px] ${
              isOnline ? "text-green-600" : "text-red-500"
            }`}
          >
            {isOnline ? <FiWifi size={11} /> : <FiWifiOff size={11} />}
            <span>
              {isOnline
                ? connectionType === "websocket"
                  ? "Live"
                  : "Polling"
                : "Offline"}
            </span>
            {isOnline && (
              <span className="text-gray-400">
                · updated {formatTime(lastUpdated)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Address & ETA row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <AddressCell
          icon={<FiMapPin className="text-green-600" size={12} />}
          iconBg="bg-green-100"
          label="Pickup"
          value={order.pickupAddress}
        />
        <AddressCell
          icon={<FiMapPin className="text-orange-500" size={12} />}
          iconBg="bg-orange-100"
          label="Delivery"
          value={order.deliveryAddress}
        />
        <div className="flex items-start gap-2">
          <div className="mt-0.5 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <FiClock className="text-blue-600" size={12} />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
              ETA
            </p>
            <p className="text-xs font-medium text-gray-700">
              {formatTime(order.estimatedDelivery)} ·{" "}
              <CountdownTimer target={order.estimatedDelivery} />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddressCell({
  icon,
  iconBg,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <div
        className={`mt-0.5 w-6 h-6 rounded-full ${iconBg} flex items-center justify-center shrink-0`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-xs font-medium text-gray-700 leading-snug">{value}</p>
      </div>
    </div>
  );
}

// ─── TrackingMap ───────────────────────────────────────────────────────────────

interface TrackingMapProps {
  vehiclePosition: LatLng;
  vehicleIndex: number;
  isFollowing: boolean;
  onToggleFollow: () => void;
}

function TrackingMap({
  vehiclePosition,
  vehicleIndex,
  isFollowing,
  onToggleFollow,
}: TrackingMapProps) {
  const mapRef = useRef<MapRef>(null);

  const routeGeoJSON = useMemo(() => buildGeoLine(ROUTE_COORDS), []);
  const coveredGeoJSON = useMemo(
    () => buildGeoLine(ROUTE_COORDS.slice(0, vehicleIndex + 1)),
    [vehicleIndex]
  );

  const pickup = ROUTE_COORDS[0];
  const delivery = ROUTE_COORDS[ROUTE_COORDS.length - 1];
  const mapCenter = useMemo(
    () => ROUTE_COORDS[Math.floor(ROUTE_COORDS.length / 2)],
    []
  );

  // Follow vehicle
  useEffect(() => {
    if (isFollowing && mapRef.current) {
      mapRef.current.flyTo({
        center: [vehiclePosition.lng, vehiclePosition.lat],
        duration: 1200,
        essential: true,
      });
    }
  }, [isFollowing, vehiclePosition]);

  return (
    <div className="relative h-90 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: mapCenter.lng,
          latitude: mapCenter.lat,
          zoom: 12.5,
        }}
        mapStyle={MAP_STYLE}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
      >
        {/* Full route (grey dashed) */}
        <Source id="route-remaining-src" type="geojson" data={routeGeoJSON}>
          <Layer {...ROUTE_REMAINING_LAYER} />
        </Source>

        {/* Covered portion (green solid) */}
        <Source id="route-covered-src" type="geojson" data={coveredGeoJSON}>
          <Layer {...ROUTE_COVERED_LAYER} />
        </Source>

        {/* Pickup marker */}
        <Marker longitude={pickup.lng} latitude={pickup.lat} anchor="center">
          <div
            className="w-8 h-8 rounded-full bg-green-600 border-2 border-white shadow-lg flex items-center justify-center"
            title="Pickup location"
          >
            <FiMapPin className="text-white" size={13} />
          </div>
        </Marker>

        {/* Delivery marker */}
        <Marker longitude={delivery.lng} latitude={delivery.lat} anchor="center">
          <div
            className="w-8 h-8 rounded-full bg-orange-500 border-2 border-white shadow-lg flex items-center justify-center"
            title="Delivery location"
          >
            <FiMapPin className="text-white" size={13} />
          </div>
        </Marker>

        {/* Vehicle marker */}
        <Marker
          longitude={vehiclePosition.lng}
          latitude={vehiclePosition.lat}
          anchor="center"
        >
          <motion.div
            key={`${vehiclePosition.lat}-${vehiclePosition.lng}`}
            initial={{ scale: 0.7, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-30" />
            <div className="relative w-11 h-11 rounded-full bg-white border-[3px] border-green-500 shadow-xl flex items-center justify-center">
              <FiTruck className="text-green-600" size={18} />
            </div>
          </motion.div>
        </Marker>

        <NavigationControl position="bottom-right" />
      </Map>

      {/* Follow toggle */}
      <div className="absolute top-3 right-3">
        <button
          onClick={onToggleFollow}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-md border transition-all ${
            isFollowing
              ? "bg-green-600 text-white border-green-700"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
          }`}
        >
          <FiNavigation size={12} />
          {isFollowing ? "Following" : "Follow"}
        </button>
      </div>

      {/* Map legend */}
      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-md px-3 py-2 flex flex-col gap-1.5">
        <LegendItem
          dotClass="bg-green-600"
          icon={<FiMapPin className="text-white" size={8} />}
          label="Pickup"
        />
        <LegendItem
          dotClass="bg-orange-500"
          icon={<FiMapPin className="text-white" size={8} />}
          label="Delivery"
        />
        <LegendItem
          dotClass="border-2 border-green-500 bg-white"
          icon={<FiTruck className="text-green-600" size={8} />}
          label="Vehicle"
        />
      </div>
    </div>
  );
}

function LegendItem({
  dotClass,
  icon,
  label,
}: {
  dotClass: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`w-5 h-5 rounded-full ${dotClass} flex items-center justify-center shrink-0`}
      >
        {icon}
      </div>
      <span className="text-[10px] font-medium text-gray-600">{label}</span>
    </div>
  );
}

// ─── DeliveryTimeline ──────────────────────────────────────────────────────────

function DeliveryTimeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <h3 className="text-sm font-bold text-gray-800 mb-4">Delivery Progress</h3>
      <ol>
        {steps.map((step, i) => (
          <li key={step.id} className="flex gap-3">
            {/* Spine */}
            <div className="flex flex-col items-center">
              {/* Step icon */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                  step.status === "completed"
                    ? "bg-green-500 text-white"
                    : step.status === "active"
                    ? "bg-green-600 text-white ring-4 ring-green-100"
                    : "bg-gray-100 text-gray-300"
                }`}
                aria-label={step.status}
              >
                {step.status === "completed" ? (
                  <FiCheck size={14} />
                ) : step.status === "active" ? (
                  <motion.span
                    animate={{ scale: [1, 1.25, 1] }}
                    transition={{ repeat: Infinity, duration: 1.6 }}
                    className="flex"
                  >
                    <FiTruck size={14} />
                  </motion.span>
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full border-2 border-gray-300 bg-white block" />
                )}
              </div>
              {/* Connector */}
              {i < steps.length - 1 && (
                <div
                  className={`w-0.5 my-1 flex-1 min-h-7 ${
                    step.status === "completed" ? "bg-green-300" : "bg-gray-200"
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className="pb-5 pt-0.5 flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`text-sm font-semibold leading-snug ${
                    step.status === "active"
                      ? "text-green-700"
                      : step.status === "completed"
                      ? "text-gray-800"
                      : "text-gray-400"
                  }`}
                >
                  {step.title}
                  {step.status === "active" && (
                    <span className="ml-2 text-[10px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </span>
                {step.timestamp && (
                  <span className="text-[11px] text-gray-400 shrink-0 mt-0.5">
                    {step.timestamp}
                  </span>
                )}
              </div>
              <p
                className={`text-xs mt-0.5 ${
                  step.status === "active"
                    ? "text-green-600"
                    : step.status === "pending"
                    ? "text-gray-300"
                    : "text-gray-400"
                }`}
              >
                {step.description}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ─── DriverInfoCard ────────────────────────────────────────────────────────────

function DriverInfoCard({ driver }: { driver: DriverInfo }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <h3 className="text-sm font-bold text-gray-800 mb-3">Driver Information</h3>

      {/* Avatar + identity */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-green-100 border-2 border-green-200 flex items-center justify-center shrink-0 overflow-hidden">
          {driver.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={driver.photo}
              alt={driver.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <FiUser className="text-green-600" size={24} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate">{driver.name}</p>
          <StarRating rating={driver.rating} />
          <p className="text-xs text-gray-400 mt-0.5">
            {driver.reviews.toLocaleString()} deliveries completed
          </p>
        </div>

        {/* Quick call button */}
        <a
          href={`tel:${driver.phone}`}
          className="w-10 h-10 rounded-full bg-green-50 hover:bg-green-100 border border-green-200 flex items-center justify-center transition-colors shrink-0"
          title={`Call ${driver.name}`}
          aria-label={`Call driver ${driver.name}`}
        >
          <FiPhone className="text-green-600" size={15} />
        </a>
      </div>

      {/* Vehicle details */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="bg-gray-50 rounded-xl px-3 py-2.5">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">
            Vehicle
          </p>
          <p className="text-xs font-semibold text-gray-700 mt-0.5 leading-snug">
            {driver.vehicle}
          </p>
          <p className="text-[10px] text-gray-400">{driver.vehicleColor}</p>
        </div>
        <div className="bg-gray-50 rounded-xl px-3 py-2.5">
          <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">
            Plate No.
          </p>
          <p className="text-sm font-bold text-gray-800 mt-0.5 font-mono tracking-wider">
            {driver.plate}
          </p>
        </div>
      </div>

      {/* Chat button */}
      <button className="mt-3 w-full flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 active:bg-green-200 border border-green-200 text-green-700 text-sm font-semibold rounded-xl py-2.5 transition-colors">
        <FiMessageSquare size={14} />
        Chat with Driver
      </button>
    </div>
  );
}

// ─── ActionButtons ─────────────────────────────────────────────────────────────

interface ActionButtonsProps {
  driver: DriverInfo;
  orderId: string;
  onReportIssue: () => void;
}

function ActionButtons({ driver, orderId, onReportIssue }: ActionButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/track/${orderId}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard API not available — use execCommand fallback
      const el = document.createElement("textarea");
      el.value = url;
      el.setAttribute("readonly", "");
      el.style.cssText = "position:fixed;opacity:0;pointer-events:none";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2_200);
  }, [orderId]);

  return (
    <div className="grid grid-cols-3 gap-3">
      <ActionTile
        href={`tel:${driver.phone}`}
        iconBg="bg-green-100 group-hover:bg-green-200"
        icon={<FiPhone className="text-green-600" size={16} />}
        label="Call Driver"
        hoverBorder="hover:border-green-200"
      />

      <button
        onClick={handleShare}
        className="flex flex-col items-center gap-1.5 bg-white hover:bg-blue-50 active:bg-blue-100 border border-gray-100 hover:border-blue-200 rounded-2xl py-3.5 transition-colors group"
        aria-label="Copy tracking link to clipboard"
      >
        <div className="w-9 h-9 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition-colors">
          {copied ? (
            <FiCheck className="text-blue-600" size={16} />
          ) : (
            <FiCopy className="text-blue-600" size={16} />
          )}
        </div>
        <span className="text-xs font-semibold text-gray-600">
          {copied ? "Copied!" : "Share Link"}
        </span>
      </button>

      <button
        onClick={onReportIssue}
        className="flex flex-col items-center gap-1.5 bg-white hover:bg-red-50 active:bg-red-100 border border-gray-100 hover:border-red-200 rounded-2xl py-3.5 transition-colors group"
        aria-label="Report a delivery issue"
      >
        <div className="w-9 h-9 rounded-full bg-red-100 group-hover:bg-red-200 flex items-center justify-center transition-colors">
          <FiAlertTriangle className="text-red-600" size={16} />
        </div>
        <span className="text-xs font-semibold text-gray-600">Report Issue</span>
      </button>
    </div>
  );
}

function ActionTile({
  href,
  iconBg,
  icon,
  label,
  hoverBorder,
}: {
  href: string;
  iconBg: string;
  icon: React.ReactNode;
  label: string;
  hoverBorder: string;
}) {
  return (
    <a
      href={href}
      className={`flex flex-col items-center gap-1.5 bg-white border border-gray-100 ${hoverBorder} rounded-2xl py-3.5 transition-colors group`}
    >
      <div className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center transition-colors`}>
        {icon}
      </div>
      <span className="text-xs font-semibold text-gray-600">{label}</span>
    </a>
  );
}

// ─── ReportIssueModal ──────────────────────────────────────────────────────────

function ReportIssueModal({
  orderId,
  onClose,
}: {
  orderId: string;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    // In production: POST to /api/orders/${orderId}/issues
    console.info("[DeliveryTracker] Issue reported:", { orderId, type: selected, notes });
    setSubmitted(true);
  };

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Report a delivery issue"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 28, stiffness: 320 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FiAlertCircle className="text-red-500" size={17} />
            <h3 className="font-bold text-gray-800">Report an Issue</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <FiX size={15} />
          </button>
        </div>

        {submitted ? (
          /* Success state */
          <div className="flex flex-col items-center py-10 px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <FiCheck className="text-green-600" size={28} />
            </div>
            <h4 className="text-base font-bold text-gray-800 mb-1">
              Issue Reported
            </h4>
            <p className="text-sm text-gray-500 mb-5">
              Our support team will review your report and get back to you
              shortly. Order #{orderId}.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Done
            </button>
          </div>
        ) : (
          /* Form state */
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Issue Type
              </p>
              <div className="grid grid-cols-2 gap-2">
                {ISSUE_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelected(type)}
                    className={`text-left text-xs px-3 py-2.5 rounded-xl border font-medium transition-colors ${
                      selected === type
                        ? "bg-red-50 border-red-300 text-red-700"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Additional Notes{" "}
                <span className="normal-case font-normal text-gray-400">
                  (optional)
                </span>
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Describe the issue in more detail…"
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-300"
              />
              <p className="text-[11px] text-gray-400 text-right mt-1">
                {notes.length}/500
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selected}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-colors"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

const TIMELINE_STEPS: TimelineStep[] = [
  {
    id: "placed",
    title: "Order Placed",
    description: "Your order has been received and logged.",
    timestamp: "Today, 08:14 AM",
    status: "completed",
  },
  {
    id: "confirmed",
    title: "Order Confirmed",
    description: "Seller confirmed availability and packaging.",
    timestamp: "Today, 08:42 AM",
    status: "completed",
  },
  {
    id: "pickup_scheduled",
    title: "Pickup Scheduled",
    description: "Driver assigned and en route to pickup location.",
    timestamp: "Today, 09:05 AM",
    status: "completed",
  },
  {
    id: "in_transit",
    title: "In Transit",
    description: "Your order is on its way to the delivery address.",
    timestamp: "Today, 09:38 AM",
    status: "active",
  },
  {
    id: "out_for_delivery",
    title: "Out for Delivery",
    description: "Driver is in your area — delivery imminent.",
    timestamp: null,
    status: "pending",
  },
  {
    id: "delivered",
    title: "Delivered",
    description: "Order delivered and confirmed by recipient.",
    timestamp: null,
    status: "pending",
  },
];

export interface DeliveryTrackerProps {
  /** Order ID — defaults to mock data when omitted. */
  orderId?: string;
}

export default function DeliveryTracker({
  orderId = MOCK_ORDER.id,
}: DeliveryTrackerProps) {
  const { vehiclePosition, vehicleIndex, isOnline, lastUpdated, connectionType } =
    useDeliveryTracking(orderId);

  const [isFollowing, setIsFollowing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="max-w-2xl mx-auto space-y-4 p-4 pb-10">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Track Delivery</h1>
          <p className="text-xs text-gray-400">Real-time shipment tracking</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <FiTrendingUp size={13} className="text-green-500" />
          <span>Live updates every 30s</span>
        </div>
      </div>

      {/* Offline banner */}
      <AnimatePresence mode="wait">
        {!isOnline && <OfflineBanner key="offline-banner" />}
      </AnimatePresence>

      {/* 1. Order summary */}
      <OrderSummaryCard
        order={MOCK_ORDER}
        isOnline={isOnline}
        connectionType={connectionType}
        lastUpdated={lastUpdated}
      />

      {/* 2. Interactive map */}
      <TrackingMap
        vehiclePosition={vehiclePosition}
        vehicleIndex={vehicleIndex}
        isFollowing={isFollowing}
        onToggleFollow={() => setIsFollowing((v) => !v)}
      />

      {/* 3. Delivery timeline */}
      <DeliveryTimeline steps={TIMELINE_STEPS} />

      {/* 4. Driver info */}
      <DriverInfoCard driver={MOCK_DRIVER} />

      {/* 5. Action buttons */}
      <ActionButtons
        driver={MOCK_DRIVER}
        orderId={orderId}
        onReportIssue={() => setShowModal(true)}
      />

      {/* Report issue modal */}
      <AnimatePresence>
        {showModal && (
          <ReportIssueModal
            key="report-modal"
            orderId={orderId}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
