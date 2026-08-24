"use client";

import React, { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { INDIA_CADASTRE_HIERARCHY, CityData, ParcelZone } from "@/data/cadastreHierarchy";

interface GeoMapProps {
  currentCity: CityData;
  onSelectCity: (city: CityData) => void;
  onSelectParcel: (parcel: ParcelZone, city: CityData) => void;
}

export default function GeoCadastreMap({ currentCity, onSelectCity, onSelectParcel }: GeoMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);

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
      center: currentCity.center,
      zoom: currentCity.zoom,
      pitch: currentCity.pitch,
      bearing: currentCity.bearing
    });

    mapInstance.current = map;

    map.on("load", () => {
      // Render City Hub Markers
      INDIA_CADASTRE_HIERARCHY.forEach(city => {
        const el = document.createElement("div");
        el.className = "cursor-pointer flex flex-col items-center group";
        el.innerHTML = `
          <div class="px-2 py-1 bg-slate-900 text-white font-bold text-[11px] rounded shadow-lg border border-slate-700 group-hover:bg-blue-600 transition">
            ${city.name} (${city.state})
          </div>
          <div class="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-md animate-ping mt-1"></div>
        `;
        el.onclick = () => {
          onSelectCity(city);
          map.flyTo({ center: city.center, zoom: 15.5, pitch: 55, duration: 2000 });
        };

        new maplibregl.Marker({ element: el, anchor: "bottom" })
          .setLngLat(city.center)
          .addTo(map);

        // Render Parcel Markers in City
        city.parcels.forEach(p => {
          const pEl = document.createElement("div");
          pEl.className = "cursor-pointer flex flex-col items-center";
          pEl.innerHTML = `
            <div class="px-2.5 py-1 bg-emerald-700 text-white font-bold text-[10px] rounded shadow-lg border border-white hover:scale-105 transition flex items-center gap-1">
              🏢 ${p.name}
            </div>
            <span class="text-[9px] font-mono font-bold bg-white text-emerald-900 px-1 rounded shadow mt-0.5">${p.surveyNumber}</span>
          `;
          pEl.onclick = () => {
            onSelectParcel(p, city);
          };

          new maplibregl.Marker({ element: pEl, anchor: "bottom" })
            .setLngLat(p.center)
            .addTo(map);
        });
      });
    });

    return () => {
      map.remove();
    };
  }, [currentCity, onSelectCity, onSelectParcel]);

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
