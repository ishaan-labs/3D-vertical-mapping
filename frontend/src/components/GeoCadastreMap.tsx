"use client";

import React, { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Building, ShieldCheck, MapPin, Eye, Zap, Layers } from "lucide-react";

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
  polygon: [number, number][];
}

export const STATE_WARDS = [
  {
    state: "Tamil Nadu",
    district: "Chennai Central",
    ward: "Ward 114 - Anna Salai Commercial & Metro Corridor",
    center: [80.2520, 13.0610] as [number, number],
    zoom: 16.5,
    plots: [
      {
        id: "PLOT-CHN-001",
        plotNumber: "Plot No. 42/A (T. Nagar Commercial)",
        wardName: "Ward 114, Anna Salai Zone",
        district: "Chennai, Tamil Nadu",
        surveyNumber: "TS-842/2026",
        registeredOwner: "DoLR State Digital Real-Estate Assets",
        ulpin2D: "IND338421049280",
        ulpin3D: "IND338421049280-V000720-B2",
        buildingHeight: 72,
        floors: 24,
        carpetAreaSqm: 4200.5,
        coordinates: [80.2522, 13.0612] as [number, number],
        polygon: [
          [80.2515, 13.0605],
          [80.2530, 13.0605],
          [80.2530, 13.0620],
          [80.2515, 13.0620],
          [80.2515, 13.0605]
        ] as [number, number][],
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
      },
      {
        id: "PLOT-CHN-002",
        plotNumber: "Plot No. 88/B (Commercial Arcade)",
        wardName: "Ward 114, Anna Salai Zone",
        district: "Chennai, Tamil Nadu",
        surveyNumber: "TS-889/2026",
        registeredOwner: "Metropolitan Financial Holdings",
        ulpin2D: "IND338421049281",
        ulpin3D: "IND338421049281-V000450-C1",
        buildingHeight: 45,
        floors: 15,
        carpetAreaSqm: 2800.0,
        coordinates: [80.2545, 13.0625] as [number, number],
        polygon: [
          [80.2538, 13.0618],
          [80.2552, 13.0618],
          [80.2552, 13.0632],
          [80.2538, 13.0632],
          [80.2538, 13.0618]
        ] as [number, number][],
        strataBreakdown: [
          { floor: "Floor 15 - Financial Suite", owner: "Apex Asset Management", type: "Commercial (V)", elevation: "+42.0m to +45.0m", ulpin: "IND338421049281-V042045-A1" },
          { floor: "Floor 8 - Corporate Offices", owner: "Southern Global Tech", type: "Commercial (V)", elevation: "+24.0m to +27.0m", ulpin: "IND338421049281-V024027-B3" },
          { floor: "Basement 1 Automated Parking", owner: "Metropolitan Holdings", type: "Subsurface (U)", elevation: "-3.0m to -6.0m", ulpin: "IND338421049281-U030060-P1" }
        ],
        subsurfaceUtilities: [
          { name: "Municipal 400mm Potable Water Line", depth: "-3.2m to -3.6m", status: "CLEAR", color: "#84cc16" },
          { name: "City Storm Sewer Trunk (800mm)", depth: "-6.2m to -6.8m", status: "CLEAR", color: "#0284c7" }
        ]
      }
    ]
  },
  {
    state: "Delhi NCT",
    district: "New Delhi",
    ward: "Ward 42 - Connaught Place Outer Circle",
    center: [77.2185, 28.6315] as [number, number],
    zoom: 16.5,
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
        coordinates: [77.2188, 28.6318] as [number, number],
        polygon: [
          [77.2178, 28.6308],
          [77.2198, 28.6308],
          [77.2198, 28.6328],
          [77.2178, 28.6328],
          [77.2178, 28.6308]
        ] as [number, number][],
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
  },
  {
    state: "Maharashtra",
    district: "Mumbai Suburban",
    ward: "Ward H/East - Bandra-Kurla Complex (BKC)",
    center: [72.8685, 19.0665] as [number, number],
    zoom: 16.5,
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
        coordinates: [72.8688, 19.0668] as [number, number],
        polygon: [
          [72.8675, 19.0655],
          [72.8698, 19.0655],
          [72.8698, 19.0678],
          [72.8675, 19.0678],
          [72.8675, 19.0655]
        ] as [number, number][],
        strataBreakdown: [
          { floor: "Floor 26 - Global Trading Floor", owner: "National Exchange Consortium", type: "Commercial (V)", elevation: "+78.0m to +81.0m", ulpin: "IND270051098220-V078081-E1" },
          { floor: "Floor 14 - Sovereign Wealth Fund", owner: "State Investment Board", type: "Commercial (V)", elevation: "+42.0m to +45.0m", ulpin: "IND270051098220-V042045-S4" },
          { floor: "Basement 3 Bullet Train Bullet Box", owner: "NHSRCL High Speed Rail", type: "Subsurface Corridor (U)", elevation: "-15.0m to -22.0m", ulpin: "IND270051098220-U150220-H0" }
        ],
        subsurfaceUtilities: [
          { name: "Mumbai Metro Line 3 Underground Corridor", depth: "-12.0m to -18.0m", status: "CLEAR", color: "#a855f7" },
          { name: "MGL High-Pressure Gas Distribution", depth: "-4.8m to -5.4m", status: "CLEAR", color: "#facc15" }
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

  const [selectedStateIndex, setSelectedStateIndex] = useState(0);
  const currentWard = STATE_WARDS[selectedStateIndex];

  useEffect(() => {
    if (!mapContainer.current) return;

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
            attribution: "© OpenStreetMap Contributors | Survey of India / Bhuvan"
          }
        },
        layers: [
          { id: "bg", type: "background", paint: { "background-color": "#090d16" } },
          {
            id: "osm",
            type: "raster",
            source: "osm",
            paint: {
              "raster-brightness-max": 0.38,
              "raster-contrast": 0.3,
              "raster-saturation": -0.85
            }
          }
        ]
      },
      center: currentWard.center,
      zoom: currentWard.zoom,
      pitch: 62,
      bearing: -20,
      antialias: true
    });

    mapInstance.current = map;

    const loadCadastreData = () => {
      // 1. Cadastral Plots 3D Extrusions
      const plotFeatures = currentWard.plots.map(p => ({
        type: "Feature",
        properties: {
          id: p.id,
          plotNumber: p.plotNumber,
          height: p.buildingHeight,
          owner: p.registeredOwner,
          ulpin: p.ulpin3D
        },
        geometry: {
          type: "Polygon",
          coordinates: [p.polygon]
        }
      }));

      if (map.getSource("cadastre-plots")) {
        (map.getSource("cadastre-plots") as maplibregl.GeoJSONSource).setData({
          type: "FeatureCollection",
          features: plotFeatures as any
        });
      } else {
        map.addSource("cadastre-plots", {
          type: "geojson",
          data: { type: "FeatureCollection", features: plotFeatures as any }
        });

        // 3D Building Extrusion Layer
        map.addLayer({
          id: "3d-plots-extrusion",
          source: "cadastre-plots",
          type: "fill-extrusion",
          paint: {
            "fill-extrusion-color": "#0284c7",
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-base": 0,
            "fill-extrusion-opacity": 0.88
          }
        });

        // 2D Yellow Boundary Line for the parcel
        map.addLayer({
          id: "2d-plot-boundaries",
          source: "cadastre-plots",
          type: "line",
          paint: {
            "line-color": "#facc15",
            "line-width": 3
          }
        });
      }

      // 2. Subsurface Multi-Utility Lines
      const utilityFeatures = [
        {
          type: "Feature",
          properties: { name: "Metro Tunnel", color: "#a855f7" },
          geometry: {
            type: "LineString",
            coordinates: [
              [currentWard.center[0] - 0.003, currentWard.center[1] + 0.001],
              [currentWard.center[0], currentWard.center[1]],
              [currentWard.center[0] + 0.003, currentWard.center[1] - 0.001]
            ]
          }
        },
        {
          type: "Feature",
          properties: { name: "Potable Water Trunk", color: "#84cc16" },
          geometry: {
            type: "LineString",
            coordinates: [
              [currentWard.center[0] - 0.0025, currentWard.center[1] - 0.0015],
              [currentWard.center[0], currentWard.center[1] + 0.0005],
              [currentWard.center[0] + 0.0025, currentWard.center[1] + 0.0015]
            ]
          }
        }
      ];

      if (map.getSource("cadastre-utilities")) {
        (map.getSource("cadastre-utilities") as maplibregl.GeoJSONSource).setData({
          type: "FeatureCollection",
          features: utilityFeatures as any
        });
      } else {
        map.addSource("cadastre-utilities", {
          type: "geojson",
          data: { type: "FeatureCollection", features: utilityFeatures as any }
        });

        map.addLayer({
          id: "utilities-layer",
          source: "cadastre-utilities",
          type: "line",
          paint: {
            "line-color": ["get", "color"],
            "line-width": 6,
            "line-opacity": 0.95
          }
        });
      }
    };

    map.on("load", () => {
      loadCadastreData();

      // Click event on Cadastral Parcel to load full 3D Twin & Strata deeds
      map.on("click", "3d-plots-extrusion", (e) => {
        if (!e.features || !e.features[0]) return;
        const clickedId = e.features[0].properties?.id;
        const matched = currentWard.plots.find(p => p.id === clickedId);
        if (matched) {
          onSelectPlot(matched);
        }
      });

      map.on("mouseenter", "3d-plots-extrusion", () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", "3d-plots-extrusion", () => (map.getCanvas().style.cursor = ""));
    });

    return () => {
      map.remove();
    };
  }, [currentWard, onSelectPlot]);

  const handleStateChange = (index: number) => {
    setSelectedStateIndex(index);
    const target = STATE_WARDS[index];
    if (mapInstance.current) {
      mapInstance.current.flyTo({
        center: target.center,
        zoom: target.zoom,
        pitch: 62,
        bearing: -20,
        essential: true,
        duration: 2500
      });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full rounded-xl overflow-hidden shadow-2xl" />

      {/* Top Floating Administrative Government Selection Bar */}
      <div className="absolute top-4 left-4 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-3.5 rounded-xl shadow-2xl z-10 flex flex-col space-y-2 max-w-md">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
          <MapPin className="w-4 h-4 text-emerald-400" /> Administrative Cadastral Selection
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={selectedStateIndex}
            onChange={(e) => handleStateChange(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-700 text-white font-semibold text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
          >
            {STATE_WARDS.map((w, idx) => (
              <option key={idx} value={idx}>
                {w.state} — {w.ward}
              </option>
            ))}
          </select>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Click any <strong>3D Blue Building Parcel</strong> on the map to inspect full vertical ownership deeds.</span>
        </div>
      </div>
    </div>
  );
}
