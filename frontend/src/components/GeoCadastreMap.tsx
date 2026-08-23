"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { ShieldCheck, MapPin, Eye } from "lucide-react";

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
    pitch: 62,
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
          { name: "Mumbai Metro Line 3 Underground Corridor", depth: "-12.0m to -18.0m", status: "CLEAR", color: "#a855f7" },
          { name: "MGL High-Pressure Gas Distribution", depth: "-4.8m to -5.4m", status: "CLEAR", color: "#facc15" }
        ]
      }
    ]
  },
  {
    state: "Tamil Nadu",
    district: "Chennai Central",
    ward: "Ward 114 - Anna Salai Metro & Commercial Corridor",
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
          { floor: "Floor 12 - Tech Hub Office", owner: "Plug & Pray Solutions Ltd", type: "Commercial Strata (V)", elevation: "+36.0m to +39.0m", ulpin: "IND338421049280-V036039-T2" },
          { floor: "Ground Floor Retail Arcade", owner: "State Retail Corp", type: "Surface Cadastre (S)", elevation: "+0.0m to +3.0m", ulpin: "IND338421049280-S000003-G0" },
          { floor: "Basement 2 Underground Metro Link", owner: "CMRL Metro Rail Corp", type: "Subsurface Utility (U)", elevation: "-8.0m to -12.0m", ulpin: "IND338421049280-U080120-M9" }
        ],
        subsurfaceUtilities: [
          { name: "Underground Metro Corridor Phase 2", depth: "-8.5m to -12.0m", status: "CLEAR", color: "#a855f7" },
          { name: "BSNL Gigabit Optic Fiber Main", depth: "-1.8m to -2.2m", status: "CLEAR", color: "#ec4899" },
          { name: "Municipal 500mm Water Trunk", depth: "-3.4m to -3.8m", status: "CLEAR", color: "#84cc16" },
          { name: "GAIL High-Pressure Gas Conduit", depth: "-4.8m to -5.2m", status: "CLEAR", color: "#facc15" }
        ]
      }
    ]
  },
  {
    state: "Delhi NCT",
    district: "New Delhi",
    ward: "Ward 42 - Connaught Place Financial Circle",
    center: [77.2185, 28.6315] as [number, number],
    zoom: 16.5,
    pitch: 58,
    bearing: 40,
    plots: [
      {
        id: "PLOT-DEL-001",
        plotNumber: "Plot No. 14 (Statesman Commercial Tower)",
        wardName: "Connaught Place Zone",
        district: "New Delhi, Delhi",
        surveyNumber: "DL-CP-140/2026",
        registeredOwner: "National Capital Urban Development",
        ulpin2D: "IND110001048120",
        ulpin3D: "IND110001048120-V000620-A1",
        buildingHeight: 62,
        floors: 20,
        carpetAreaSqm: 5600.0,
        coordinates: [77.2185, 28.6315] as [number, number],
        strataBreakdown: [
          { floor: "Floor 18 - Central Board Office", owner: "Govt of Delhi NCT", type: "Administrative (V)", elevation: "+54.0m to +57.0m", ulpin: "IND110001048120-V054057-G1" },
          { floor: "Floor 10 - Media Exchange Suite", owner: "Capital News Media", type: "Commercial (V)", elevation: "+30.0m to +33.0m", ulpin: "IND110001048120-V030033-M4" },
          { floor: "Basement 2 DMRC Metro Intersect", owner: "Delhi Metro Rail Corp", type: "Subsurface Transit (U)", elevation: "-9.0m to -14.0m", ulpin: "IND110001048120-U090140-D9" }
        ],
        subsurfaceUtilities: [
          { name: "DMRC Yellow Line Underground Tunnel", depth: "-9.5m to -14.0m", status: "CLEAR", color: "#a855f7" },
          { name: "IGL Natural Gas Pipeline Trunk", depth: "-4.5m to -5.0m", status: "CLEAR", color: "#facc15" }
        ]
      }
    ]
  }
];

function getGeoDataForCenter(center: [number, number]) {
  const [lon, lat] = center;

  const buildingFeatures = [
    {
      type: "Feature",
      properties: {
        id: "BLD-1",
        name: "Plot Cadastral Alpha (FAR Violation Flagged)",
        height: 78,
        color: "#ef4444"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [lon - 0.0015, lat + 0.0006],
          [lon - 0.0002, lat + 0.0006],
          [lon - 0.0002, lat + 0.0018],
          [lon - 0.0015, lat + 0.0018],
          [lon - 0.0015, lat + 0.0006]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        id: "BLD-2",
        name: "State Cadastral Twin HQ (Compliant)",
        height: 95,
        color: "#0284c7"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [lon + 0.0005, lat + 0.0004],
          [lon + 0.0022, lat + 0.0004],
          [lon + 0.0022, lat + 0.0019],
          [lon + 0.0005, lat + 0.0019],
          [lon + 0.0005, lat + 0.0004]
        ]]
      }
    },
    {
      type: "Feature",
      properties: {
        id: "BLD-3",
        name: "Metropolitan Financial Plaza",
        height: 52,
        color: "#38bdf8"
      },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [lon - 0.0014, lat - 0.0016],
          [lon + 0.0002, lat - 0.0016],
          [lon + 0.0002, lat - 0.0006],
          [lon - 0.0014, lat - 0.0006],
          [lon - 0.0014, lat - 0.0016]
        ]]
      }
    }
  ];

  const utilityFeatures = [
    {
      type: "Feature",
      properties: { name: "Underground Metro Corridor", color: "#a855f7" },
      geometry: {
        type: "LineString",
        coordinates: [
          [lon - 0.0035, lat + 0.0018],
          [lon - 0.0010, lat + 0.0005],
          [lon + 0.0018, lat - 0.0006],
          [lon + 0.0040, lat - 0.0018]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "BSNL Gigabit Optic Fiber", color: "#ec4899" },
      geometry: {
        type: "LineString",
        coordinates: [
          [lon - 0.0030, lat + 0.0012],
          [lon, lat + 0.0003],
          [lon + 0.0030, lat - 0.0009]
        ]
      }
    },
    {
      type: "Feature",
      properties: { name: "Municipal Potable Water Main", color: "#84cc16" },
      geometry: {
        type: "LineString",
        coordinates: [
          [lon - 0.0025, lat - 0.0012],
          [lon + 0.0006, lat],
          [lon + 0.0035, lat + 0.0012]
        ]
      }
    }
  ];

  return { buildingFeatures, utilityFeatures };
}

export default function GeoCadastreMap({
  onSelectPlot
}: {
  onSelectPlot: (plot: CadastralPlot) => void;
}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);

  const [selectedStateIndex, setSelectedStateIndex] = useState(0);
  const [isXrayActive, setIsXrayActive] = useState(false);
  const onSelectPlotRef = useRef(onSelectPlot);

  useEffect(() => {
    onSelectPlotRef.current = onSelectPlot;
  }, [onSelectPlot]);

  useEffect(() => {
    if (!mapContainer.current) return;

    const initialWard = STATE_WARDS[0];

    const map = new maplibregl.Map({
      container: mapContainer.current,
      maxZoom: 18,
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
              "raster-brightness-max": 0.45,
              "raster-contrast": 0.35,
              "raster-saturation": -0.85
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
      const { buildingFeatures, utilityFeatures } = getGeoDataForCenter(initialWard.center);

      map.addSource("3d-buildings-source", {
        type: "geojson",
        data: { type: "FeatureCollection", features: buildingFeatures as any }
      });

      map.addLayer({
        id: "3d-buildings-extrusion",
        source: "3d-buildings-source",
        type: "fill-extrusion",
        paint: {
          "fill-extrusion-color": ["get", "color"],
          "fill-extrusion-height": ["get", "height"],
          "fill-extrusion-base": 0,
          "fill-extrusion-opacity": 0.9
        }
      });

      map.addSource("3d-utilities-source", {
        type: "geojson",
        data: { type: "FeatureCollection", features: utilityFeatures as any }
      });

      map.addLayer({
        id: "utilities-layer",
        source: "3d-utilities-source",
        type: "line",
        paint: {
          "line-color": ["get", "color"],
          "line-width": 8,
          "line-opacity": 0.95
        }
      });

      map.on("click", "3d-buildings-extrusion", () => {
        onSelectPlotRef.current(STATE_WARDS[0].plots[0]);
      });

      map.on("mouseenter", "3d-buildings-extrusion", () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", "3d-buildings-extrusion", () => (map.getCanvas().style.cursor = ""));
    });

    return () => {
      map.remove();
    };
  }, []);

  const handleStateChange = useCallback((index: number) => {
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
      duration: 2000
    });

    const { buildingFeatures, utilityFeatures } = getGeoDataForCenter(target.center);

    if (map.getSource("3d-buildings-source")) {
      (map.getSource("3d-buildings-source") as maplibregl.GeoJSONSource).setData({
        type: "FeatureCollection",
        features: buildingFeatures as any
      });
    }

    if (map.getSource("3d-utilities-source")) {
      (map.getSource("3d-utilities-source") as maplibregl.GeoJSONSource).setData({
        type: "FeatureCollection",
        features: utilityFeatures as any
      });
    }

    onSelectPlotRef.current(target.plots[0]);
  }, []);

  const toggleXray = () => {
    setIsXrayActive(!isXrayActive);
    const map = mapInstance.current;
    if (!map) return;

    if (!isXrayActive) {
      map.setPaintProperty("3d-buildings-extrusion", "fill-extrusion-opacity", 0.3);
      map.setPaintProperty("utilities-layer", "line-width", 12);
    } else {
      map.setPaintProperty("3d-buildings-extrusion", "fill-extrusion-opacity", 0.9);
      map.setPaintProperty("utilities-layer", "line-width", 8);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden shadow-2xl" />

      {/* Floating Control HUD */}
      <div className="absolute top-4 left-4 bg-[#070e24]/95 backdrop-blur-xl border border-cyan-500/30 p-3.5 rounded-2xl shadow-2xl z-10 flex flex-col space-y-2.5 max-w-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-100 uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-emerald-400" /> Cadastral Zone Selector
          </div>
          <button
            onClick={toggleXray}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition flex items-center gap-1.5 cursor-pointer ${
              isXrayActive
                ? "bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
                : "bg-slate-800 text-slate-300 hover:text-white"
            }`}
          >
            <Eye className="w-3 h-3" /> {isXrayActive ? "X-Ray Active" : "Subsurface X-Ray"}
          </button>
        </div>

        <select
          value={selectedStateIndex}
          onChange={(e) => handleStateChange(Number(e.target.value))}
          className="w-full bg-[#030712] border border-slate-700 text-white font-semibold text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
        >
          {STATE_WARDS.map((w, idx) => (
            <option key={idx} value={idx}>
              {w.state} — {w.ward}
            </option>
          ))}
        </select>

        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Click any <strong>3D Building Volume</strong> to inspect Title Deeds.</span>
        </div>
      </div>
    </div>
  );
}
