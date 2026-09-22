import { useState, useEffect, useMemo, useRef } from "react";
import type { GameState, Loc } from "../game/types";
import { LOCS } from "../game/types";
import { IMG_MAP } from "./images";
import Ambient from "./Ambient";

interface MapLocation {
  id: Loc;
  x: number;
  y: number;
  name: string;
  kanji: string;
  desc: string;
  unlocked: boolean;
  hasEvent?: boolean;
}

interface Path {
  from: Loc;
  to: Loc;
  sealed?: boolean;
}

interface Props {
  state: GameState;
  onLocationClick: (loc: Loc) => void;
}

const PATHS: Path[] = [
  { from: "road", to: "gate" },
  { from: "gate", to: "village" },
  { from: "village", to: "temple" },
  { from: "village", to: "forest" },
  { from: "forest", to: "river" },
  { from: "river", to: "mill" },
  { from: "temple", to: "cave" },
  { from: "village", to: "path", sealed: true },
  { from: "path", to: "shrine", sealed: true },
];

export default function MapView({ state, onLocationClick }: Props) {
  const [hoveredLoc, setHoveredLoc] = useState<Loc | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const animationRef = useRef<number | null>(null);
  const [charPos, setCharPos] = useState({ x: 0, y: 0 });

  // Map locations with their positions
  const locations: MapLocation[] = useMemo(() => [
    { id: "road", x: 12, y: 22, name: "Mountain Road", kanji: "道", desc: "The misty road that ends where the village begins.", unlocked: true },
    { id: "gate", x: 28, y: 38, name: "Village Gate", kanji: "門", desc: "Genji's post. The gate that keeps the village's secrets.", unlocked: true },
    { id: "village", x: 48, y: 52, name: "Kagerou Square", kanji: "村", desc: "The heart of the village. The well, the stalls, the elder's house.", unlocked: state.flags["entered"] || false },
    { id: "temple", x: 72, y: 28, name: "Mountain Temple", kanji: "寺", desc: "Jikai's stair. The bell that rings for the dead.", unlocked: state.flags["entered"] || false },
    { id: "forest", x: 20, y: 65, name: "Whispering Forest", kanji: "森", desc: "The forest where the trees remember what the village has forgotten.", unlocked: state.flags["entered"] || false },
    { id: "river", x: 35, y: 75, name: "Iron River", kanji: "川", desc: "The river that tastes of iron and memory.", unlocked: state.flags["entered"] || false },
    { id: "mill", x: 60, y: 70, name: "Old Mill", kanji: "臼", desc: "The mill that ground the village's prosperity, and its end.", unlocked: state.flags["entered"] || false },
    { id: "cave", x: 85, y: 15, name: "Hermit's Cave", kanji: "穴", desc: "The cave where the mountain keeps its oldest memories.", unlocked: Object.keys(state.knowledge).length >= 3 },
    { id: "path", x: 82, y: 58, name: "Sealed Path", kanji: "坂", desc: "The rope gate. Beyond lies what the village has buried.", unlocked: Object.keys(state.knowledge).length >= 2 },
    { id: "shrine", x: 90, y: 76, name: "Mistbound Shrine", kanji: "祠", desc: "The shrine that is not on any map. Six names wait beneath the stone.", unlocked: state.knowledge["the_names"] !== undefined },
  ], [state.flags, state.knowledge]);

  // Update character position when location changes (no animation during state sync)
  useEffect(() => {
    const loc = locations.find(l => l.id === state.loc);
    if (loc && !isMoving) {
      setCharPos({ x: loc.x, y: loc.y });
    }
  }, [state.loc, locations, isMoving]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleLocationClick = (loc: MapLocation) => {
    if (!loc.unlocked || loc.id === state.loc || isMoving) return;

    setIsMoving(true);
    const target = { x: loc.x, y: loc.y };
    const start = { ...charPos };
    const duration = 1000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCharPos({
        x: start.x + (target.x - start.x) * eased,
        y: start.y + (target.y - start.y) * eased,
      });

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
        setIsMoving(false);
        onLocationClick(loc.id);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const getPathCoords = (path: Path) => {
    const from = locations.find(l => l.id === path.from);
    const to = locations.find(l => l.id === path.to);
    if (!from || !to) return null;
    return { x1: from.x, y1: from.y, x2: to.x, y2: to.y };
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-ink-950">
      {/* Map background */}
      <div className="absolute inset-0">
        <img
          src={IMG_MAP}
          alt="Kagerou Village Map"
          className="w-full h-full object-cover opacity-75"
          draggable={false}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/50 via-transparent to-ink-950/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950/40 via-transparent to-ink-950/40" />
      </div>

      {/* Atmospheric mist */}
      <Ambient embers={8} mist dim />

      {/* SVG overlay for paths */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
        {PATHS.map((path, i) => {
          const coords = getPathCoords(path);
          if (!coords) return null;
          const isAccessible = !path.sealed || locations.find(l => l.id === path.to)?.unlocked;
          return (
            <g key={i}>
              <line
                x1={`${coords.x1}%`}
                y1={`${coords.y1}%`}
                x2={`${coords.x2}%`}
                y2={`${coords.y2}%`}
                stroke={path.sealed && !isAccessible ? "#3d342a" : "#c8a24b"}
                strokeWidth="1.5"
                strokeDasharray={path.sealed ? "6 4" : "0"}
                opacity={isAccessible ? 0.5 : 0.25}
              />
              {path.sealed && !isAccessible && (
                <g>
                  <circle
                    cx={`${(coords.x1 + coords.x2) / 2}%`}
                    cy={`${(coords.y1 + coords.y2) / 2}%`}
                    r="10"
                    fill="#14110e"
                    stroke="#cf5136"
                    strokeWidth="1.5"
                    opacity="0.8"
                  />
                  <text
                    x={`${(coords.x1 + coords.x2) / 2}%`}
                    y={`${(coords.y1 + coords.y2) / 2}%`}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#cf5136"
                    fontSize="10"
                    fontFamily="serif"
                    fontWeight="bold"
                  >
                    封
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* Location markers */}
      {locations.map((loc) => {
        const isCurrentLocation = loc.id === state.loc;
        const canClick = loc.unlocked && !isCurrentLocation && !isMoving;
        const isHovered = hoveredLoc === loc.id;

        return (
          <button
            key={loc.id}
            onClick={() => handleLocationClick(loc)}
            onMouseEnter={() => setHoveredLoc(loc.id)}
            onMouseLeave={() => setHoveredLoc(null)}
            disabled={!canClick}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
              canClick ? "cursor-pointer hover:scale-110" : "cursor-not-allowed"
            } ${!loc.unlocked ? "opacity-40" : ""}`}
            style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
          >
            <div className="relative flex flex-col items-center gap-1.5">
              {/* Outer glow for current location */}
              {isCurrentLocation && (
                <div className="absolute inset-0 -m-3 rounded-full bg-gold-500/20 blur-md animate-pulse" />
              )}

              {/* Marker circle */}
              <div className={`relative w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                isCurrentLocation
                  ? "border-gold-400 bg-gold-500/30 shadow-[0_0_24px_rgba(200,162,75,0.7)]"
                  : loc.unlocked
                  ? "border-paper-300/60 bg-ink-900/90 hover:border-gold-400 hover:bg-ink-800/90 hover:shadow-[0_0_16px_rgba(200,162,75,0.4)]"
                  : "border-ink-600 bg-ink-900/70"
              }`}>
                <span className={`font-display text-base font-bold ${
                  isCurrentLocation ? "text-gold-300" : loc.unlocked ? "text-paper-100" : "text-ink-500"
                }`}>
                  {loc.kanji}
                </span>
              </div>

              {/* Location name label */}
              <div className={`px-2.5 py-1 rounded-sm text-[11px] whitespace-nowrap transition-all border ${
                isCurrentLocation
                  ? "bg-gold-500/20 text-gold-300 border-gold-500/40 font-display font-bold"
                  : isHovered && loc.unlocked
                  ? "bg-ink-900/95 text-paper-100 border-gold-500/40"
                  : loc.unlocked
                  ? "bg-ink-900/90 text-paper-300 border-ink-600"
                  : "bg-ink-900/70 text-ink-500 border-ink-700"
              }`}>
                {loc.name}
              </div>

              {/* Description tooltip on hover */}
              {isHovered && loc.unlocked && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-56 bracketed bg-ink-900/95 border border-gold-500/40 px-3 py-2 z-20 pointer-events-none">
                  <p className="font-body text-[11px] leading-relaxed text-paper-300 italic">
                    {loc.desc}
                  </p>
                </div>
              )}

              {/* Pulse ring for current location */}
              {isCurrentLocation && (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-gold-400 animate-ping opacity-50" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-shu-400 border border-ink-900 animate-pulse" />
                </>
              )}

              {/* Locked indicator */}
              {!loc.unlocked && (
                <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink-900 border border-ink-600">
                  <span className="font-display text-[9px] text-ink-500">?</span>
                </div>
              )}
            </div>
          </button>
        );
      })}

      {/* Character marker */}
      <div
        className="absolute transform -translate-x-1/2 -translate-y-full pointer-events-none"
        style={{
          left: `${charPos.x}%`,
          top: `${charPos.y}%`,
          zIndex: 15,
          transition: isMoving ? 'none' : 'left 0.3s ease, top 0.3s ease',
        }}
      >
        <div className="relative flex flex-col items-center">
          {/* Character shadow */}
          <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-3 bg-black/50 rounded-full blur-[2px] ${
            isMoving ? "scale-75" : "scale-100"
          } transition-transform duration-300`} />

          {/* Character sprite */}
          <div className={`relative ${isMoving ? "animate-bounce-subtle" : ""}`}>
            {/* Hat (kasa) */}
            <div className="relative w-10 h-3 bg-ink-800 rounded-full border border-ink-700 mb-[-2px] mx-auto">
              <div className="absolute inset-x-1 top-0 h-1 bg-ink-700 rounded-full" />
            </div>
            {/* Head */}
            <div className="w-5 h-5 rounded-full bg-paper-300 border-2 border-ink-800 mx-auto relative">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-0.5 bg-ink-700 rounded-full" />
            </div>
            {/* Body (traveler's coat) */}
            <div className="relative w-7 h-8 mx-auto mt-[-1px]">
              <div className="absolute inset-0 bg-shu-500 border-2 border-ink-800 rounded-sm" />
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-0.5 h-6 bg-ink-800" />
              <div className="absolute top-4 left-0 right-0 h-1 bg-ink-800" />
            </div>
            {/* Walking stick (when moving) */}
            {isMoving && (
              <div className="absolute -right-2 top-4 w-0.5 h-8 bg-ink-700 rotate-12 origin-top" />
            )}
          </div>
        </div>
      </div>

      {/* Map title cartouche */}
      <div className="absolute top-4 left-4 bracketed bg-ink-900/95 px-5 py-3 border border-gold-500/40">
        <div className="flex items-center gap-3">
          <span className="font-display text-2xl font-bold text-gold-300">霧伏</span>
          <div className="h-8 w-px bg-gold-500/40" />
          <div>
            <div className="font-display text-sm font-bold tracking-wider text-paper-100">
              Kagerou
            </div>
            <div className="font-body text-[10px] text-paper-500 italic">
              The Mistbound Village
            </div>
          </div>
        </div>
      </div>

      {/* Compass rose */}
      <div className="absolute top-4 right-4 w-16 h-16 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-60">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#c8a24b" strokeWidth="1" opacity="0.4" />
          <circle cx="50" cy="50" r="35" fill="none" stroke="#c8a24b" strokeWidth="0.5" opacity="0.3" />
          <polygon points="50,10 47,45 53,45" fill="#c8a24b" opacity="0.8" />
          <polygon points="50,90 47,55 53,55" fill="#8a7c5d" opacity="0.6" />
          <polygon points="10,50 45,47 45,53" fill="#8a7c5d" opacity="0.6" />
          <polygon points="90,50 55,47 55,53" fill="#8a7c5d" opacity="0.6" />
          <text x="50" y="8" textAnchor="middle" fill="#c8a24b" fontSize="8" fontFamily="serif" fontWeight="bold">N</text>
          <text x="50" y="98" textAnchor="middle" fill="#8a7c5d" fontSize="7" fontFamily="serif">S</text>
          <text x="4" y="53" textAnchor="middle" fill="#8a7c5d" fontSize="7" fontFamily="serif">W</text>
          <text x="96" y="53" textAnchor="middle" fill="#8a7c5d" fontSize="7" fontFamily="serif">E</text>
          <circle cx="50" cy="50" r="3" fill="#c8a24b" />
        </svg>
      </div>

      {/* Current location info panel */}
      <div className="absolute bottom-4 left-4 right-4 md:left-4 md:right-auto md:w-96 bracketed bg-ink-900/95 border border-ink-600 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-gold-500 bg-gold-500/20 flex items-center justify-center shrink-0">
            <span className="font-display text-xl font-bold text-gold-300">
              {LOCS[state.loc].kanji}
            </span>
          </div>
          <div className="min-w-0">
            <div className="font-display text-base font-bold text-paper-100">
              {LOCS[state.loc].name}
            </div>
            <div className="font-body text-[11px] text-paper-500 mt-0.5">
              {locations.find(l => l.id === state.loc)?.desc}
            </div>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-ink-700 flex items-center justify-between">
          <span className="font-body text-[10px] uppercase tracking-[0.2em] text-paper-700">
            Click a location to travel
          </span>
          <span className="font-display text-xs text-gold-400">
            {locations.filter(l => l.unlocked).length} / {locations.length} discovered
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bracketed bg-ink-900/95 border border-ink-600 px-3 py-2 text-xs hidden md:block">
        <div className="font-body text-[9px] uppercase tracking-[0.25em] text-paper-700 mb-1.5">Legend</div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border border-gold-400 bg-gold-500/30" />
            <span className="text-paper-300">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border border-paper-300/60 bg-ink-900/80" />
            <span className="text-paper-300">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border border-ink-600 bg-ink-900/60" />
            <span className="text-ink-500">Undiscovered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-1 border-t border-dashed border-shu-400" />
            <span className="text-ink-500">Sealed path</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 0.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
