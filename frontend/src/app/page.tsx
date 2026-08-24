"use client";

import React, { useState, useRef } from "react";
import CadastreViewer3D, { CadastreViewerRef, TelemetryData } from "@/components/CadastreViewer3D";
import GeoCadastreMap from "@/components/GeoCadastreMap";
import { 
  INDIA_CADASTRE_HIERARCHY, 
  CityData, 
  ParcelZone, 
  BuildingRecord, 
  PropertyUnit, 
  SubsurfaceAsset 
} from "@/data/cadastreHierarchy";
import {
  Layers, Search, ChevronRight, ChevronDown, 
  Building2, Home as HomeIcon, MapPin, Eye,
  Compass, ArrowUpRight, ShieldCheck, Scale, AlertOctagon,
  Sparkles, SlidersHorizontal, RotateCcw, Plus, Minus
} from "lucide-react";

export default function Home() {
  const [currentCity, setCurrentCity] = useState<CityData>(INDIA_CADASTRE_HIERARCHY[0]);
  const [currentParcel, setCurrentParcel] = useState<ParcelZone>(INDIA_CADASTRE_HIERARCHY[0].parcels[0]);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingRecord | null>(INDIA_CADASTRE_HIERARCHY[0].parcels[0].buildings[0]);
  const [selectedUnit, setSelectedUnit] = useState<PropertyUnit | null>(INDIA_CADASTRE_HIERARCHY[0].parcels[0].buildings[0].units[0]);
  const [selectedSubsurface, setSelectedSubsurface] = useState<SubsurfaceAsset | null>(null);

  const [viewMode, setViewMode] = useState<"3D" | "2D">("3D");
  const [activeFloorFilter, setActiveFloorFilter] = useState<number | null>(12);
  const [showUnderground, setShowUnderground] = useState<boolean>(true);
  const [inspectorTab, setInspectorTab] = useState<"OVERVIEW" | "VERTICAL_STRUCTURE" | "RIGHTS" | "DEED_JSON">("OVERVIEW");

  const [telemetry, setTelemetry] = useState<TelemetryData>({
    cursorLat: "13.0610° N",
    cursorLon: "80.2520° E",
    cursorZ: "+14.8m MSL",
    camPitch: -22,
    camBearing: 45,
    fps: 60
  });

  const viewer3DRef = useRef<CadastreViewerRef | null>(null);

  const handleSelectCity = (city: CityData) => {
    setCurrentCity(city);
    setCurrentParcel(city.parcels[0]);
    setSelectedBuilding(city.parcels[0].buildings[0]);
    setSelectedUnit(city.parcels[0].buildings[0].units[0]);
    setSelectedSubsurface(null);
  };

  const handleSelectParcel = (parcel: ParcelZone, city: CityData) => {
    setCurrentCity(city);
    setCurrentParcel(parcel);
    setSelectedBuilding(parcel.buildings[0]);
    setSelectedUnit(parcel.buildings[0].units[0]);
    setSelectedSubsurface(null);
    setViewMode("3D");
  };

  const handleSelectUnit = (unit: PropertyUnit, building: BuildingRecord) => {
    setSelectedBuilding(building);
    setSelectedUnit(unit);
    setSelectedSubsurface(null);
    setActiveFloorFilter(unit.floorNumber);
    viewer3DRef.current?.focusFloor(unit.floorNumber);
  };

  return (
    <div className="h-screen w-screen bg-[#090d16] text-slate-800 flex flex-col font-sans overflow-hidden select-none">
      
      {/* 1. TOP HEADER & INTERACTIVE BREADCRUMB */}
      <header className="h-11 bg-white border-b border-slate-200 px-3 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center space-x-2 text-xs">
          <div className="w-5 h-5 bg-slate-900 text-white rounded flex items-center justify-center text-[10px] font-bold font-mono">
            3D
          </div>
          <span className="font-extrabold text-xs tracking-tight text-slate-900">
            3D-BhuAadhaar
          </span>

          <span className="text-slate-300">/</span>

          {/* Progressive Spatial Breadcrumb */}
          <div className="flex items-center space-x-1 font-mono text-[11px] text-slate-600">
            <span 
              onClick={() => setViewMode("2D")}
              className="hover:text-blue-700 cursor-pointer font-semibold"
            >
              India
            </span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-slate-500">{currentCity.state}</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <select
              value={currentCity.id}
              onChange={(e) => {
                const found = INDIA_CADASTRE_HIERARCHY.find(c => c.id === e.target.value);
                if (found) handleSelectCity(found);
              }}
              className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-bold text-slate-800 cursor-pointer focus:outline-none"
            >
              {INDIA_CADASTRE_HIERARCHY.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="font-semibold text-slate-800">{currentParcel.name.split(" ")[0]}</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="font-bold text-blue-700">{selectedBuilding?.name || "Zone Overview"}</span>
            {selectedUnit && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                  {selectedUnit.unitCode}
                </span>
              </>
            )}
          </div>
        </div>

        {/* View Switchers */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="flex bg-slate-100 p-0.5 rounded border border-slate-200">
            <button
              onClick={() => setViewMode("3D")}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded transition cursor-pointer ${
                viewMode === "3D" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              3D Digital Twin
            </button>
            <button
              onClick={() => setViewMode("2D")}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded transition cursor-pointer ${
                viewMode === "2D" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              2D City Map
            </button>
          </div>

          <label className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={showUnderground}
              onChange={(e) => setShowUnderground(e.target.checked)}
              className="w-3 h-3 accent-slate-900 rounded cursor-pointer"
            />
            Underground Infrastructure
          </label>
        </div>
      </header>

      {/* WORKSPACE: LEFT NAV + 3D VIEWPORT + RIGHT CADASTRE INSPECTOR */}
      <div className="flex-1 flex relative overflow-hidden">

        {/* 2. LEFT SIDEBAR: VERTICAL HIERARCHICAL DRILL-DOWN */}
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 z-20 text-xs">
          <div className="flex-1 overflow-y-auto">
            
            {/* Parcel Information Header */}
            <div className="p-3 border-b border-slate-100 bg-slate-50/80">
              <span className="text-[9px] font-mono uppercase font-bold text-slate-400 block">Cadastral Parcel</span>
              <h3 className="font-bold text-xs text-slate-900 leading-snug">{currentParcel.name}</h3>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">{currentParcel.surveyNumber} • {currentParcel.wardName}</div>
            </div>

            {/* Vertical Floor Hierarchy Selector */}
            {selectedBuilding && (
              <div className="p-2.5 space-y-2">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center justify-between">
                  <span>Vertical Structure ({selectedBuilding.floorsCount} Floors)</span>
                  <span className="font-mono text-slate-400">{selectedBuilding.heightM}m</span>
                </div>

                <div className="space-y-1">
                  {selectedBuilding.units.map((unit) => {
                    const isSelected = selectedUnit?.unitId === unit.unitId;
                    return (
                      <div
                        key={unit.unitId}
                        onClick={() => handleSelectUnit(unit, selectedBuilding)}
                        className={`p-2 rounded border transition cursor-pointer flex flex-col space-y-0.5 ${
                          isSelected
                            ? "bg-blue-50 border-blue-300 text-blue-900 shadow-xs"
                            : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold text-[11px]">
                          <span>Floor {unit.floorNumber}: {unit.unitCode}</span>
                          <span className="text-[10px] font-mono text-blue-700">{unit.useType}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 flex justify-between font-mono">
                          <span>{unit.elevationRange}</span>
                          <span>{unit.carpetAreaSqm} m²</span>
                        </div>
                        <div className="text-[9px] text-slate-400 truncate">
                          Owner: <strong>{unit.ownerName}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Subsurface Utilities Section */}
            {showUnderground && (
              <div className="p-2.5 border-t border-slate-100 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  Registered Subsurface Infrastructure
                </div>
                <div className="space-y-1">
                  {currentParcel.subsurfaceUtilities.map((sub) => {
                    const isSelected = selectedSubsurface?.id === sub.id;
                    return (
                      <div
                        key={sub.id}
                        onClick={() => {
                          setSelectedSubsurface(sub);
                          setSelectedUnit(null);
                          setInspectorTab("OVERVIEW");
                        }}
                        className={`p-1.5 rounded border transition cursor-pointer text-[10px] ${
                          isSelected
                            ? "bg-purple-50 border-purple-300 text-purple-900 font-bold"
                            : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                        }`}
                      >
                        <div className="flex justify-between">
                          <span>{sub.name}</span>
                          <span className="font-mono text-purple-700">{sub.depthRange}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats Bar */}
          <div className="p-2.5 border-t border-slate-200 bg-slate-50/80 text-[10px] text-slate-500 flex items-center justify-between font-mono">
            <span>Spatial Engine</span>
            <span>v3.0-Twin</span>
          </div>
        </aside>

        {/* 3. CENTER: 3D DIGITAL TWIN / 2D MAP VIEWPORT */}
        <main className="flex-1 relative h-full w-full bg-slate-100 overflow-hidden flex flex-col">
          <div className="flex-1 relative w-full h-full">
            {viewMode === "3D" ? (
              <>
                <CadastreViewer3D
                  ref={viewer3DRef}
                  buildings={currentParcel.buildings}
                  subsurfaceAssets={currentParcel.subsurfaceUtilities}
                  selectedBuilding={selectedBuilding}
                  selectedUnit={selectedUnit}
                  selectedSubsurface={selectedSubsurface}
                  activeFloorFilter={activeFloorFilter}
                  showUnderground={showUnderground}
                  onSelectBuilding={setSelectedBuilding}
                  onSelectUnit={handleSelectUnit}
                  onSelectSubsurface={(s) => {
                    setSelectedSubsurface(s);
                    setSelectedUnit(null);
                  }}
                  onTelemetryUpdate={setTelemetry}
                />

                {/* Navigation Tools Overlay */}
                <div className="absolute top-3 right-3 bg-white border border-slate-200 rounded shadow-xs p-1 flex flex-col space-y-1 z-10">
                  <button
                    onClick={() => viewer3DRef.current?.zoomIn()}
                    title="Zoom In"
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => viewer3DRef.current?.zoomOut()}
                    title="Zoom Out"
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => viewer3DRef.current?.resetCamera()}
                    title="Reset View"
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Vertical Elevation Hierarchy Ribbon */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs border border-slate-200 rounded p-2 shadow-xs text-[10px] font-mono flex flex-col space-y-1 z-10 select-none">
                  <div className="font-bold text-slate-900 border-b border-slate-100 pb-0.5 uppercase tracking-tight">
                    Vertical Strata MSL
                  </div>
                  <div className="text-slate-600 flex justify-between gap-3">
                    <span className="font-bold">+{selectedBuilding?.heightM || 38}m</span>
                    <span>Rooftop Apex</span>
                  </div>
                  <div className="text-emerald-700 bg-emerald-50 px-1 rounded flex justify-between gap-3 font-semibold">
                    <span>0.0m</span>
                    <span>Surface Baseline</span>
                  </div>
                  <div className="text-purple-700 flex justify-between gap-3">
                    <span className="font-bold">-8.5m</span>
                    <span>Metro Tunnel</span>
                  </div>
                  <div className="text-slate-500 flex justify-between gap-3">
                    <span>-12.0m</span>
                    <span>Subsurface Invert</span>
                  </div>
                </div>
              </>
            ) : (
              <GeoCadastreMap
                currentCity={currentCity}
                onSelectCity={handleSelectCity}
                onSelectParcel={handleSelectParcel}
              />
            )}
          </div>

          {/* Telemetry Status Bar */}
          <div className="h-6 bg-[#090d16] text-slate-400 border-t border-slate-800 px-3 flex items-center justify-between text-[10px] font-mono shrink-0 z-20">
            <div className="flex items-center space-x-4">
              <span className="flex items-center gap-1 text-slate-300">
                <Compass className="w-3 h-3 text-cyan-400" /> {telemetry.cursorLat} {telemetry.cursorLon}
              </span>
              <span className="text-slate-500">|</span>
              <span>ELEV: <strong className="text-white">{telemetry.cursorZ}</strong></span>
              <span className="text-slate-500">|</span>
              <span>CITY: <strong className="text-white">{currentCity.name}</strong></span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> DIGITAL TWIN // ONLINE
              </span>
            </div>
          </div>
        </main>

        {/* 4. RIGHT SIDEBAR: CONTEXT-SENSITIVE PROPERTY & UNIT INSPECTOR */}
        <aside className="w-80 bg-white border-l border-slate-200 flex flex-col justify-between shrink-0 z-20 text-xs">
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Dynamic Inspector Header */}
            <div className="p-3 border-b border-slate-200 bg-slate-50/70">
              <span className="text-[9px] font-mono uppercase font-bold text-slate-500 block">
                {selectedUnit ? "3D Strata Unit Record" : selectedSubsurface ? "Subsurface Infrastructure Asset" : "Building Record"}
              </span>
              <h2 className="font-bold text-xs text-slate-900 leading-snug">
                {selectedUnit ? `${selectedBuilding?.name} — ${selectedUnit.unitCode}` : selectedSubsurface ? selectedSubsurface.name : selectedBuilding?.name}
              </h2>
            </div>

            {/* Inspector Navigation Tabs */}
            <div className="flex border-b border-slate-200 bg-white text-[11px] font-semibold text-slate-500">
              <button
                onClick={() => setInspectorTab("OVERVIEW")}
                className={`flex-1 py-1.5 text-center border-b-2 transition cursor-pointer ${
                  inspectorTab === "OVERVIEW" ? "border-slate-900 text-slate-900 font-bold" : "border-transparent hover:text-slate-900"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setInspectorTab("VERTICAL_STRUCTURE")}
                className={`flex-1 py-1.5 text-center border-b-2 transition cursor-pointer ${
                  inspectorTab === "VERTICAL_STRUCTURE" ? "border-slate-900 text-slate-900 font-bold" : "border-transparent hover:text-slate-900"
                }`}
              >
                Spatial Matrix
              </button>
              <button
                onClick={() => setInspectorTab("RIGHTS")}
                className={`flex-1 py-1.5 text-center border-b-2 transition cursor-pointer ${
                  inspectorTab === "RIGHTS" ? "border-slate-900 text-slate-900 font-bold" : "border-transparent hover:text-slate-900"
                }`}
              >
                Legal Rights
              </button>
              <button
                onClick={() => setInspectorTab("DEED_JSON")}
                className={`flex-1 py-1.5 text-center border-b-2 transition cursor-pointer ${
                  inspectorTab === "DEED_JSON" ? "border-slate-900 text-slate-900 font-bold" : "border-transparent hover:text-slate-900"
                }`}
              >
                Deed (JSON)
              </button>
            </div>

            {/* Inspector Body */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3">
              
              {/* TAB 1: OVERVIEW */}
              {inspectorTab === "OVERVIEW" && (
                <div className="space-y-2.5">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight block mb-0.5">Volumetric 3D-ULPIN</span>
                    <div className="font-mono text-[10px] bg-slate-50 p-1.5 rounded border border-slate-200 font-bold text-slate-900 break-all select-all">
                      {selectedUnit?.ulpin3D || selectedSubsurface?.ulpin3D || selectedBuilding?.ulpin3D}
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded overflow-hidden divide-y divide-slate-100 text-[11px]">
                    <div className="flex justify-between p-1.5 bg-slate-50/50">
                      <span className="text-slate-500">Registered Owner</span>
                      <span className="font-semibold text-slate-900">{selectedUnit?.ownerName || selectedSubsurface?.owner || "State Registry"}</span>
                    </div>
                    <div className="flex justify-between p-1.5">
                      <span className="text-slate-500">Parcel ID</span>
                      <span className="font-mono font-semibold text-slate-900">{selectedBuilding?.parcelId || currentParcel.id}</span>
                    </div>
                    <div className="flex justify-between p-1.5 bg-slate-50/50">
                      <span className="text-slate-500">Elevation Envelope</span>
                      <span className="font-mono font-semibold text-slate-900">{selectedUnit?.elevationRange || selectedSubsurface?.depthRange}</span>
                    </div>
                  </div>

                  {selectedBuilding && selectedBuilding.ghostFloorsCount > 0 && (
                    <div className="p-2 bg-rose-50 border border-rose-200 rounded space-y-1">
                      <div className="font-bold text-rose-900 flex items-center gap-1 text-[11px]">
                        <AlertOctagon className="w-3.5 h-3.5 text-rose-600" /> FAR Violation Audit
                      </div>
                      <p className="text-[10px] text-slate-600">
                        {selectedBuilding.ghostFloorsCount} Unauthorized ghost floors detected above sanctioned height.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SPATIAL MATRIX */}
              {inspectorTab === "VERTICAL_STRUCTURE" && (
                <div className="space-y-2 text-[11px]">
                  <div className="border border-slate-200 rounded overflow-hidden divide-y divide-slate-100">
                    <div className="flex justify-between p-1.5 bg-slate-50/50">
                      <span className="text-slate-500">Carpet Area</span>
                      <span className="font-mono font-semibold">{selectedUnit?.carpetAreaSqm || selectedBuilding?.footprintAreaSqm} m²</span>
                    </div>
                    <div className="flex justify-between p-1.5">
                      <span className="text-slate-500">3D Volumetric Extent</span>
                      <span className="font-mono font-semibold">{selectedUnit?.volumeM3 || selectedBuilding?.totalBuiltupSqm} m³</span>
                    </div>
                    <div className="flex justify-between p-1.5 bg-slate-50/50">
                      <span className="text-slate-500">Z-Base / Z-Peak</span>
                      <span className="font-mono font-semibold">{selectedUnit ? `${selectedUnit.zMin}m / ${selectedUnit.zMax}m` : "0.0m / +38.0m"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: LEGAL RIGHTS */}
              {inspectorTab === "RIGHTS" && (
                <div className="space-y-2 text-[11px]">
                  <div className="bg-slate-50 p-2 rounded border border-slate-200">
                    <div className="text-[9px] text-slate-400 font-bold uppercase">ISO 19152 RRR Strata Title</div>
                    <div className="font-bold text-slate-800">Primary Freehold 3D Unit (LA_Right)</div>
                  </div>
                  {selectedUnit?.mortgageBank && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded text-[10px]">
                      <strong>Mortgage Encumbrance:</strong> Pledged to {selectedUnit.mortgageBank}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: DEED JSON */}
              {inspectorTab === "DEED_JSON" && (
                <div>
                  <pre className="p-2 bg-[#090d16] text-slate-200 rounded text-[9px] font-mono overflow-x-auto leading-relaxed">
                    {JSON.stringify(
                      {
                        standard: "ISO 19152 LADM II",
                        ulpin_3d: selectedUnit?.ulpin3D || selectedBuilding?.ulpin3D,
                        parcel: currentParcel.name,
                        building: selectedBuilding?.name,
                        unit: selectedUnit?.unitCode,
                        owner: selectedUnit?.ownerName || selectedBuilding?.address
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}
            </div>
          </div>

          <div className="p-2 border-t border-slate-200 bg-slate-50/80 text-[10px] text-slate-400 flex items-center justify-between font-mono">
            <span>DoLR Spatial Explorer</span>
            <span>v3.0-Twin</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
