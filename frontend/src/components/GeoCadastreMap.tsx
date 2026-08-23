"use client";

import React, { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { 
  Building2, ShieldCheck, MapPin, AlertTriangle, 
  Trees, Filter, Info, X, Radio
} from "lucide-react";

export interface CadastralPlot {
  id: string;
  plotNumber: string;
  wardName: string;
  district: string;
  surveyNumber: string;
  registeredOwner: string;
  ulpin2D: string;
  ulpin3D: string;
  buildingHeight: number;
  floors: number;
  carpetAreaSqm: number;
  strataBreakdown: {
    floor: string;
    owner: string;
    type: string;
    elevation: string;
    ulpin: string;
  }[];
  subsurfaceUtilities: {
    name: string;
    depth: string;
    status: string;
    color: string;
  }[];
  coordinates: [number, number];
}

export const STATE_WARDS = [
  {
    state: "Maharashtra",
    district: "Mumbai Suburban",
    ward: "Ward H/East - Bandra-Kurla Complex (BKC)",
    center: [72.8685, 19.0665] as [number, number],
    zoom: 16.5,
    pitch: 60,
    bearing: -30,
    plots: [
      {
        id: "PLOT-MUM-001",
        plotNumber: "Plot C-24 (G-Block Financial Hub)",
        wardName: "BKC G-Block",
        district: "Mumbai, Maharashtra",
        surveyNumber: "MH-BKC-920/2026",
        registeredOwner: "MMRDA Urban Development Authority",
        ulpin2D: "IND270051098220",
        ulpin3D: "IND270051098220-V000840-X1",
        buildingHeight: 84,
        floors: 28,
        carpetAreaSqm: 8200.0,
        coordinates: [72.8685, 19.0665] as [number, number],
        strataBreakdown: [
          { floor: "Floor 26 - Global Trading Floor", owner: "National Exchange Consortium", type: "Commercial (V)", elevation: "+78.0m to +81.0m", ulpin: "IND270051098220-V078081-E1" },
          { floor: "Floor 14 - Sovereign Wealth Fund", owner: "State Investment Board", type: "Commercial (V)", elevation: "+42.0m to +45.0m", ulpin: "IND270051098220-V042045-S4" },
          { floor: "Basement 3 Bullet Train Box", owner: "NHSRCL High Speed Rail", type: "Subsurface Corridor (U)", elevation: "-15.0m to -22.0m", ulpin: "IND270051098220-U150220-H0" }
        ],
        subsurfaceUtilities: [
          { name: "Mumbai Metro Line 3 Underground Corridor", depth: "-12.0m to -18.0m", status: "CLEAR", color: "#9333ea" },
          { name: "MGL High-Pressure Gas Distribution", depth: "-4.8m to -5.4m", status: "CLEAR", color: "#facc15" }
        ]
      }
    ]
  },
  {
    state: "Tamil Nadu",
    district: "Chennai Central",
    ward: "Ward 114 - Anna Salai Metro Corridor",
    center: [80.2520, 13.0610] as [number, number],
    zoom: 16.5,
    pitch: 60,
    bearing: -20,
    plots: [
      {
        id: "PLOT-CHN-001",
        plotNumber: "Plot 42/A (T. Nagar Commercial Hub)",
        wardName: "Ward 114, Anna Salai Zone",
        district: "Chennai, Tamil Nadu",
        surveyNumber: "TS-842/2026",
        registeredOwner: "DoLR State Digital Real-Estate Assets",
        ulpin2D: "IND338421049280",
        ulpin3D: "IND338421049280-V000720-B2",
        buildingHeight: 72,
        floors: 24,
        carpetAreaSqm: 4200.5,
        coordinates: [80.2520, 13.0610] as [number, number],
        strataBreakdown: [
          { floor: "Rooftop Air Rights (A)", owner: "CleanEnergy Solar Corp", type: "Air Rights (A)", elevation: "+72.0m to +75.0m", ulpin: "IND338421049280-A072075-S1" },
          { floor: "Floor 20 - Executive Penthouse", owner: "Ishaan Srivastava", type: "Vertical Residential (V)", elevation: "+60.0m to +63.0m", ulpin: "IND338421049280-V060063-P4" },
          { floor: "Floor 12 - Tech Hub Office", owner: "Plug & Pray Solutions Ltd", type: "Commercial Strata (V)", elevation: "+36.0m to +39.0m", ulpin: "IND338421049280-V036039-T2" }
        ],
        subsurfaceUtilities: [
          { name: "CMRL Underground Metro Corridor", depth: "-8.5m to -12.0m", status: "CLEAR", color: "#9333ea" }
        ]
      }
    ]
  }
];

export default function GeoCadastreMap({
  onSelectPlot
}: {
  onSelectPlot: (plot: CadastralPlot) => void;
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [selectedStateIndex, setSelectedStateIndex] = useState(0);
  const [activeInspector, setActiveInspector] = useState<any>(null);

  const [filters, setFilters] = useState({
    BUILDINGS: true,
    FAR_VIOLATIONS_ONLY: false,
    UTILITIES: true,
    TREES: true
  });

  const clearMarkers = () => {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
  };

  const renderOverlays = (map: maplibregl.Map, center: [number, number]) => {
    clearMarkers();
    const [lon, lat] = center;

    // 1. Red FAR Violation Tower Marker
    if (filters.BUILDINGS) {
      const bldEl = document.createElement("div");
      bldEl.className = "cursor-pointer group relative flex flex-col items-center";
      bldEl.innerHTML = `
        <div class="px-2.5 py-1 bg-red-600 text-white font-bold text-[10px] rounded-md shadow-lg border border-white flex items-center gap-1">
          <span class="w-2 h-2 rounded-full bg-white animate-ping"></span>
          Plot 42/A (+2 Ghost Floors)
        </div>
        <div class="w-8 h-12 bg-red-500/80 border-2 border-red-700 rounded-sm shadow-2xl flex items-center justify-center text-[9px] text-white font-mono font-bold mt-0.5">
          72m
        </div>
      `;
      bldEl.onclick = () => {
        setActiveInspector({
          type: "BUILDING",
          title: "Plot 42/A (FAR Breach Flagged)",
          height: "72.0m MSL (+2 Unauthorized Tiers)",
          status: "CRITICAL VIOLATION - Uncollected Tax: ₹4.82 Cr/yr",
          category: "FAR_BREACH"
        });
        onSelectPlot(STATE_WARDS[selectedStateIndex].plots[0]);
      };
      const marker1 = new maplibregl.Marker({ element: bldEl, anchor: "bottom" })
        .setLngLat([lon - 0.0008, lat + 0.0004])
        .addTo(map);
      markersRef.current.push(marker1);
    }

    // 2. Blue Compliant HQ Marker
    if (filters.BUILDINGS && !filters.FAR_VIOLATIONS_ONLY) {
      const bld2El = document.createElement("div");
      bld2El.className = "cursor-pointer group relative flex flex-col items-center";
      bld2El.innerHTML = `
        <div class="px-2.5 py-1 bg-blue-700 text-white font-bold text-[10px] rounded-md shadow-lg border border-white">
          State Cadastral HQ (Compliant)
        </div>
        <div class="w-10 h-16 bg-blue-600/80 border-2 border-blue-800 rounded-sm shadow-2xl flex items-center justify-center text-[9px] text-white font-mono font-bold mt-0.5">
          95m
        </div>
      `;
      bld2El.onclick = () => {
        setActiveInspector({
          type: "BUILDING",
          title: "DoLR State Cadastral Twin HQ",
          height: "95.0m MSL (Sanctioned & Verified)",
          status: "ISO 19152 LADM II Fully Compliant",
          category: "COMPLIANT"
        });
      };
      const marker2 = new maplibregl.Marker({ element: bld2El, anchor: "bottom" })
        .setLngLat([lon + 0.0012, lat + 0.0006])
        .addTo(map);
      markersRef.current.push(marker2);
    }

    // 3. Tree Botanical Personhood Markers
    if (filters.TREES) {
      const treeCoords: [number, number, string, string, string][] = [
        [lon - 0.0012, lat - 0.0003, "Heritage Neem (IND338421049280-ECO0042)", "Azadirachta indica (45 Years)", "₹7,20,000"],
        [lon + 0.0003, lat + 0.0012, "Protected Banyan (IND338421049280-ECO0043)", "Ficus benghalensis (60 Years)", "₹12,50,000"]
      ];

      treeCoords.forEach(([tLon, tLat, name, species, penalty]) => {
        const treeEl = document.createElement("div");
        treeEl.className = "cursor-pointer flex flex-col items-center";
        treeEl.innerHTML = `
          <div class="w-7 h-7 rounded-full bg-emerald-600 border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs hover:scale-125 transition">
            🌳
          </div>
          <span class="text-[9px] font-bold text-emerald-900 bg-white/95 px-1.5 py-0.2 rounded shadow border border-emerald-200 mt-0.5 whitespace-nowrap">
            Root Shield 3m
          </span>
        `;
        treeEl.onclick = () => {
          setActiveInspector({
            type: "TREE",
            title: name,
            species: species,
            root_cylinder: "0.0m to -2.8m Subsurface Exclusion Zone",
            penalty: penalty
          });
        };
        const treeMarker = new maplibregl.Marker({ element: treeEl, anchor: "center" })
          .setLngLat([tLon, tLat])
          .addTo(map);
        markersRef.current.push(treeMarker);
      });
    }
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    const initialWard = STATE_WARDS[0];

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            maxzoom: 19,
            attribution: "© OpenStreetMap contributors"
          }
        },
        layers: [
          {
            id: "osm-layer",
            type: "raster",
            source: "osm",
            paint: {
              "raster-brightness-max": 0.95,
              "raster-contrast": 0.05,
              "raster-saturation": -0.3
            }
          }
        ]
      },
      center: initialWard.center,
      zoom: initialWard.zoom,
      pitch: initialWard.pitch,
      bearing: initialWard.bearing,
      antialias: true
    });

    mapInstance.current = map;

    map.on("load", () => {
      map.resize();
      renderOverlays(map, initialWard.center);
    });

    return () => {
      clearMarkers();
      map.remove();
    };
  }, []);

  const handleStateChange = (index: number) => {
    setSelectedStateIndex(index);
    const target = STATE_WARDS[index];
    const map = mapInstance.current;
    if (!map) return;

    map.flyTo({
      center: target.center,
      zoom: target.zoom,
      pitch: target.pitch,
      bearing: target.bearing,
      essential: true,
      duration: 1800
    });

    renderOverlays(map, target.center);
    onSelectPlot(target.plots[0]);
  };

  const toggleFilter = (key: keyof typeof filters) => {
    const next = { ...filters, [key]: !filters[key] };
    setFilters(next);
    if (mapInstance.current) {
      renderOverlays(mapInstance.current, STATE_WARDS[selectedStateIndex].center);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[520px] rounded-xl overflow-hidden border border-slate-200 shadow-inner">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

      {/* Top Left: Cadastral Zone Selector */}
      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur border border-slate-300 p-3 rounded-xl shadow-lg z-10 flex flex-col space-y-2 max-w-xs">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wide">
          <MapPin className="w-4 h-4 text-blue-700" /> Cadastral Zone Selector
        </div>
        <select
          value={selectedStateIndex}
          onChange={(e) => handleStateChange(Number(e.target.value))}
          className="w-full bg-slate-50 border border-slate-300 text-slate-900 font-semibold text-xs rounded-lg p-2 focus:outline-none focus:border-blue-700 cursor-pointer"
        >
          {STATE_WARDS.map((w, idx) => (
            <option key={idx} value={idx}>
              {w.state} — {w.ward}
            </option>
          ))}
        </select>
      </div>

      {/* Top Right: Layer Filter Toggles */}
      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur border border-slate-300 p-3 rounded-xl shadow-lg z-10 flex flex-col space-y-2 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-800 border-b border-slate-200 pb-1.5">
          <Filter className="w-3.5 h-3.5 text-blue-700" /> Layer Query Filter
        </div>
        <div className="flex flex-col space-y-1.5">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
            <input
              type="checkbox"
              checked={filters.BUILDINGS}
              onChange={() => toggleFilter("BUILDINGS")}
              className="w-3.5 h-3.5 accent-blue-700 rounded cursor-pointer"
            />
            3D Strata Buildings
          </label>
          <label className="flex items-center gap-2 cursor-pointer font-semibold text-red-700">
            <input
              type="checkbox"
              checked={filters.FAR_VIOLATIONS_ONLY}
              onChange={() => toggleFilter("FAR_VIOLATIONS_ONLY")}
              className="w-3.5 h-3.5 accent-red-600 rounded cursor-pointer"
            />
            Filter: FAR Violations Only
          </label>
          <label className="flex items-center gap-2 cursor-pointer font-medium text-emerald-700">
            <input
              type="checkbox"
              checked={filters.TREES}
              onChange={() => toggleFilter("TREES")}
              className="w-3.5 h-3.5 accent-emerald-600 rounded cursor-pointer"
            />
            Botanical Tree Personhoods
          </label>
        </div>
      </div>

      {/* Floating Click Inspector Card */}
      {activeInspector && (
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur border border-slate-300 p-4 rounded-xl shadow-2xl z-20 max-w-sm text-xs space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="font-bold text-blue-900 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-blue-700" /> Cadastral Inspection Details
            </span>
            <button
              onClick={() => setActiveInspector(null)}
              className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="font-bold text-slate-900 text-sm">{activeInspector.title}</h3>

          {activeInspector.type === "BUILDING" && (
            <div className="space-y-1 text-slate-600">
              <div><strong>Height Envelope:</strong> {activeInspector.height}</div>
              <div><strong>Status:</strong> <span className={activeInspector.category === "FAR_BREACH" ? "text-red-700 font-bold" : "text-emerald-700 font-bold"}>{activeInspector.status}</span></div>
            </div>
          )}

          {activeInspector.type === "TREE" && (
            <div className="space-y-1 text-slate-600">
              <div><strong>Species:</strong> {activeInspector.species}</div>
              <div><strong>Root Cylinder:</strong> <span className="font-mono text-emerald-700 font-bold">{activeInspector.root_cylinder}</span></div>
              <div><strong>Statutory Felling Penalty:</strong> <span className="font-mono text-red-700 font-bold">{activeInspector.penalty}</span></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
