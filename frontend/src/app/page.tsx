"use client";

import React, { useState, useRef } from "react";
import CadastreViewer3D, { UtilityItem, CadastreViewerRef, TelemetryData } from "@/components/CadastreViewer3D";
import GeoCadastreMap, { STATE_WARDS } from "@/components/GeoCadastreMap";
import {
  Layers, Search, ChevronRight, ChevronDown, 
  MousePointer, Ruler, Scissors, AlertCircle, Sparkles, 
  Plus, Minus, RotateCcw, AlertTriangle, Trees, Leaf, Scale,
  UploadCloud, Loader2, Send, X, AlertOctagon,
  Compass, HeartHandshake, Database
} from "lucide-react";

export default function Home() {
  const [viewMode, setViewMode] = useState<"3D" | "2D">("3D");
  const [activeWorkflow, setActiveWorkflow] = useState<"CADASTRE" | "FAR_AUDIT" | "UDS_FRAUD" | "TREE_PERSONHOOD">("TREE_PERSONHOOD");
  const [searchQuery, setSearchQuery] = useState("");
  const [inspectorTab, setInspectorTab] = useState<"OVERVIEW" | "SPATIAL" | "RIGHTS" | "DOCUMENTS">("OVERVIEW");
  const [activeTool, setActiveTool] = useState<"select" | "measure" | "slice" | "conflicts">("select");

  const [telemetry, setTelemetry] = useState<TelemetryData>({
    cursorLat: "13.0610° N",
    cursorLon: "80.2520° E",
    cursorZ: "+14.8m MSL",
    camPitch: -22,
    camBearing: 45,
    fps: 60
  });

  const viewer3DRef = useRef<CadastreViewerRef | null>(null);

  // Layer Visibility
  const [layers, setLayers] = useState({
    properties: true,
    buildings: true,
    roads: true,
    utilities: true,
    metro: true,
    water: true,
    gas: true,
    telecom: true,
    trees: true
  });

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    properties: true,
    utilities: true,
    ecological: true
  });

  // Pre-populated default selected entity (Heritage Neem Tree)
  const [selectedItem, setSelectedItem] = useState<UtilityItem | null>({
    id: "TREE-42",
    name: "Heritage Neem Tree (Azadirachta indica)",
    category: "ECO_TREE",
    depth: "0.0m to -2.8m (Root Zone) / +7.7m (Canopy)",
    status: "ACTIVE",
    ulpin: "IND338421049280-ECO0042",
    parcelId: "ECO-CHN-0042",
    owner: "Ward 114 Urban Forestry Council",
    species: "Azadirachta indica",
    botanicalName: "Azadirachta indica",
    ageYears: 45,
    canopyRadiusM: 3.5,
    rootDepthM: 2.8,
    custodian: "Ward 114 Urban Forestry Council",
    fellingPenaltyInr: 720000,
    annualCo2Kg: 84.4,
    taxRebateInr: 717,
    coordinates: "13.0610° N, 80.2520° E",
    zMin: -2.8,
    zMax: 7.7,
    details: "Protected Botanical Personhood Entity. Statutory 3.0m subterranean root exclusion cylinder strictly enforced under Section 8 of Tree Preservation Act."
  });

  // Afforestation State
  const [applicantType, setApplicantType] = useState<"GOVERNMENT_INFRA" | "PRIVATE_DEVELOPER">("GOVERNMENT_INFRA");
  const [applicantName, setApplicantName] = useState("Chennai Metro Rail Corp (CMRL Phase 2)");
  const [afforestationProof, setAfforestationProof] = useState<any>(null);
  const [isProcessingProof, setIsProcessingProof] = useState(false);

  // FAR Violation Audit State
  const [farAuditData, setFarAuditData] = useState<any>({
    fsi_deviation_pct: 33.3,
    unauthorized_ghost_floors: 2,
    unauthorized_builtup_sqm: 1200.0,
    financial_audit: {
      annual_uncollected_property_tax_inr: 4820000,
      compounded_structural_penalty_inr: 19280000
    }
  });

  // UDS Fraud Conservation State
  const [udsAuditData, setUdsAuditData] = useState<any>({
    uds_allocation_percentage: 118.0,
    illegal_oversold_uds_sqft: 1800.0,
    risk_level: "HIGH_MORTGAGE_FRAUD_RISK",
    flagged_banks: ["State Bank of India (SBI)", "HDFC Bank"]
  });

  // AI Ingest Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [deedText, setDeedText] = useState("Flat No 402 situated on 4th Floor of Block B, elevation 12.0m to 15.0m, carpet area 128.5 sqm under survey parcel IND338421049280.");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);

  const toggleLayerGroup = (group: string) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleVerifyAfforestation = async () => {
    setIsProcessingProof(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/audit/compensatory-afforestation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parent_tree_ulpin: selectedItem?.ulpin || "IND338421049280-ECO0042",
          applicant_name: applicantName,
          applicant_type: applicantType,
          felling_reason: "Metro Tunnel Underground Station Shaft Construction",
          escrow_amount_inr: selectedItem?.fellingPenaltyInr || 720000,
          target_afforestation_zone_id: "IND338421-ZONE-GREEN-08",
          geotagged_proof_hash: "SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
          saplings_planted_count: 10
        })
      });
      const data = await res.json();
      setAfforestationProof(data);
    } catch (e) {
      alert("Error processing compensatory afforestation.");
    } finally {
      setIsProcessingProof(false);
    }
  };

  const handleAiIngest = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/cadastre/ai-ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_deed_text: deedText })
      });
      const data = await res.json();
      setAiResponse(data);
      if (data.ai_extracted_data) {
        alert("3D Parcel Ingested! 3D-ULPIN: " + data.generated_3d_ulpin?.ulpin_3d);
      }
    } catch (e) {
      alert("AI Ingestion error.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#090d16] text-slate-800 flex flex-col font-sans overflow-hidden select-none">
      
      {/* 1. TOP NAVBAR */}
      <header className="h-11 bg-white border-b border-slate-200 px-3 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center space-x-3">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 bg-slate-900 text-white rounded flex items-center justify-center text-[10px] font-bold font-mono">
              3D
            </div>
            <span className="font-extrabold text-xs tracking-tight text-slate-900">
              3D-BhuAadhaar <span className="text-slate-400 font-normal">| Cadastral Engine</span>
            </span>
          </div>
          <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-300 rounded">
            ISO 19152 LADM II
          </span>
        </div>

        {/* Workflow Switchers */}
        <div className="flex bg-slate-100 p-0.5 rounded border border-slate-200 text-xs">
          <button
            onClick={() => {
              setActiveWorkflow("TREE_PERSONHOOD");
              setSelectedItem({
                id: "TREE-42",
                name: "Heritage Neem Tree (Azadirachta indica)",
                category: "ECO_TREE",
                depth: "0.0m to -2.8m (Root Zone) / +7.7m (Canopy)",
                status: "ACTIVE",
                ulpin: "IND338421049280-ECO0042",
                parcelId: "ECO-CHN-0042",
                owner: "Ward 114 Urban Forestry Council",
                species: "Azadirachta indica",
                botanicalName: "Azadirachta indica",
                ageYears: 45,
                canopyRadiusM: 3.5,
                rootDepthM: 2.8,
                custodian: "Ward 114 Urban Forestry Council",
                fellingPenaltyInr: 720000,
                annualCo2Kg: 84.4,
                taxRebateInr: 717,
                coordinates: "13.0610° N, 80.2520° E",
                zMin: -2.8,
                zMax: 7.7,
                details: "Protected Botanical Personhood Entity. Statutory 3.0m subterranean root exclusion cylinder strictly enforced."
              });
            }}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded transition cursor-pointer ${
              activeWorkflow === "TREE_PERSONHOOD" ? "bg-white text-emerald-800 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Trees className="w-3.5 h-3.5 text-emerald-600" /> Tree Personhood & Escrow
          </button>
          <button
            onClick={() => {
              setActiveWorkflow("FAR_AUDIT");
              setSelectedItem({
                id: "BLD-42A",
                name: "Plot 42/A Commercial Plaza",
                category: "GHOST_FLOOR",
                depth: "+0.0m to +24.0m MSL (+2 Ghost Floors)",
                status: "ALERT",
                ulpin: "IND338421049280-V000540-A1",
                parcelId: "TS-842/A",
                owner: "Apex Commercial Estates Ltd",
                areaSqm: 4200.0,
                volumeM3: 20160.0,
                coordinates: "13.0610° N, 80.2520° E",
                zMin: 0.0,
                zMax: 24.0,
                details: "FAR BREACH: 2 Unauthorized Ghost Floors detected above permitted height. Municipal tax recovery required."
              });
            }}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded transition cursor-pointer ${
              activeWorkflow === "FAR_AUDIT" ? "bg-white text-rose-700 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 text-rose-600" /> FAR Violation Audit
          </button>
          <button
            onClick={() => {
              setActiveWorkflow("UDS_FRAUD");
              setSelectedItem({
                id: "UDS-PARCEL",
                name: "Strata Land Share Conservation (Σ UDS)",
                category: "BUILDING",
                depth: "0.0m Baseline Strata",
                status: "ALERT",
                ulpin: "IND338421049280",
                parcelId: "TS-842/BASE",
                owner: "Multi-Unit Strata Consortium",
                areaSqm: 1200.0,
                volumeM3: 1200.0,
                coordinates: "13.0610° N, 80.2520° E",
                zMin: 0.0,
                zMax: 0.0,
                details: "UDS Mathematical Conservation Integrity Check. Detects duplicate mortgage pledges across financial institutions."
              });
            }}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded transition cursor-pointer ${
              activeWorkflow === "UDS_FRAUD" ? "bg-white text-amber-800 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-amber-600" /> UDS Fraud Engine
          </button>
          <button
            onClick={() => setActiveWorkflow("CADASTRE")}
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded transition cursor-pointer ${
              activeWorkflow === "CADASTRE" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" /> Spatial Cadastre
          </button>
        </div>

        {/* View Switchers */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="flex bg-slate-100 p-0.5 rounded border border-slate-200">
            <button
              onClick={() => setViewMode("3D")}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded transition cursor-pointer ${
                viewMode === "3D" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              3D Twin
            </button>
            <button
              onClick={() => setViewMode("2D")}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded transition cursor-pointer ${
                viewMode === "2D" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              2D WebGIS
            </button>
          </div>

          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] rounded transition cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-amber-300" /> Ingest Deed
          </button>
        </div>
      </header>

      {/* WORKSPACE */}
      <div className="flex-1 flex relative overflow-hidden">

        {/* 2. LEFT SIDEBAR */}
        <aside className="w-60 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 z-20 text-xs">
          <div className="flex-1 overflow-y-auto">
            <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span className="flex items-center gap-1.5 uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5 text-slate-500" /> Spatial Layers
              </span>
              <span className="text-[10px] text-slate-400 font-mono">EPSG:4326</span>
            </div>

            <div className="p-2 space-y-1 font-medium text-[11px]">
              <div>
                <div 
                  onClick={() => toggleLayerGroup("properties")}
                  className="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-50 cursor-pointer text-slate-800 font-semibold"
                >
                  <div className="flex items-center gap-1">
                    {expandedGroups.properties ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                    <span>Surface Architecture</span>
                  </div>
                </div>

                {expandedGroups.properties && (
                  <div className="pl-5 pr-1 py-0.5 space-y-0.5 text-slate-600">
                    <label className="flex items-center justify-between hover:bg-slate-50 px-1.5 py-0.5 rounded cursor-pointer">
                      <span>3D Strata Buildings</span>
                      <input 
                        type="checkbox" 
                        checked={layers.buildings} 
                        onChange={() => toggleLayer("buildings")}
                        className="w-3 h-3 accent-slate-900 rounded" 
                      />
                    </label>
                    <label className="flex items-center justify-between hover:bg-slate-50 px-1.5 py-0.5 rounded cursor-pointer">
                      <span>Municipal Roadway</span>
                      <input 
                        type="checkbox" 
                        checked={layers.roads} 
                        onChange={() => toggleLayer("roads")}
                        className="w-3 h-3 accent-slate-900 rounded" 
                      />
                    </label>
                  </div>
                )}
              </div>

              <div>
                <div 
                  onClick={() => toggleLayerGroup("utilities")}
                  className="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-50 cursor-pointer text-slate-800 font-semibold"
                >
                  <div className="flex items-center gap-1">
                    {expandedGroups.utilities ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                    <span>Subsurface Networks</span>
                  </div>
                </div>

                {expandedGroups.utilities && (
                  <div className="pl-5 pr-1 py-0.5 space-y-0.5 text-slate-600">
                    <label className="flex items-center justify-between hover:bg-slate-50 px-1.5 py-0.5 rounded cursor-pointer">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-600" /> Metro Box (-8.5m)
                      </span>
                      <input 
                        type="checkbox" 
                        checked={layers.metro} 
                        onChange={() => toggleLayer("metro")}
                        className="w-3 h-3 accent-slate-900 rounded" 
                      />
                    </label>
                    <label className="flex items-center justify-between hover:bg-slate-50 px-1.5 py-0.5 rounded cursor-pointer">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" /> Water Trunk (-3.4m)
                      </span>
                      <input 
                        type="checkbox" 
                        checked={layers.water} 
                        onChange={() => toggleLayer("water")}
                        className="w-3 h-3 accent-slate-900 rounded" 
                      />
                    </label>
                    <label className="flex items-center justify-between hover:bg-slate-50 px-1.5 py-0.5 rounded cursor-pointer">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" /> GAIL Gas (-5.2m)
                      </span>
                      <input 
                        type="checkbox" 
                        checked={layers.gas} 
                        onChange={() => toggleLayer("gas")}
                        className="w-3 h-3 accent-slate-900 rounded" 
                      />
                    </label>
                    <label className="flex items-center justify-between hover:bg-slate-50 px-1.5 py-0.5 rounded cursor-pointer">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-pink-500" /> Optic Fiber (-1.8m)
                      </span>
                      <input 
                        type="checkbox" 
                        checked={layers.telecom} 
                        onChange={() => toggleLayer("telecom")}
                        className="w-3 h-3 accent-slate-900 rounded" 
                      />
                    </label>
                  </div>
                )}
              </div>

              <div>
                <div 
                  onClick={() => toggleLayerGroup("ecological")}
                  className="flex items-center justify-between px-2 py-1 rounded hover:bg-slate-50 cursor-pointer text-slate-800 font-semibold"
                >
                  <div className="flex items-center gap-1">
                    {expandedGroups.ecological ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                    <span>Ecological Assets</span>
                  </div>
                </div>

                {expandedGroups.ecological && (
                  <div className="pl-5 pr-1 py-0.5 space-y-0.5 text-slate-600">
                    <label className="flex items-center justify-between hover:bg-slate-50 px-1.5 py-0.5 rounded cursor-pointer">
                      <span className="flex items-center gap-1.5">
                        <Trees className="w-3 h-3 text-emerald-600" /> Trees & 3m Root Shields
                      </span>
                      <input 
                        type="checkbox" 
                        checked={layers.trees} 
                        onChange={() => toggleLayer("trees")}
                        className="w-3 h-3 accent-slate-900 rounded" 
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tools */}
          <div className="p-2.5 border-t border-slate-200 bg-slate-50/80">
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Tools
            </div>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              <button
                onClick={() => setActiveTool("select")}
                className={`flex items-center gap-1 px-2 py-1 rounded font-semibold border cursor-pointer ${
                  activeTool === "select"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <MousePointer className="w-3 h-3" /> Select
              </button>
              <button
                onClick={() => setActiveTool("measure")}
                className={`flex items-center gap-1 px-2 py-1 rounded font-semibold border cursor-pointer ${
                  activeTool === "measure"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Ruler className="w-3 h-3" /> Measure
              </button>
              <button
                onClick={() => setActiveTool("slice")}
                className={`flex items-center gap-1 px-2 py-1 rounded font-semibold border cursor-pointer ${
                  activeTool === "slice"
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Scissors className="w-3 h-3" /> Cutaway
              </button>
              <button
                onClick={() => setActiveTool("conflicts")}
                className={`flex items-center gap-1 px-2 py-1 rounded font-semibold border cursor-pointer ${
                  activeTool === "conflicts"
                    ? "bg-rose-700 text-white border-rose-700"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <AlertCircle className="w-3 h-3 text-rose-500" /> Clashes
              </button>
            </div>
          </div>
        </aside>

        {/* 3. CENTER: 3D VIEWPORT */}
        <main className="flex-1 relative h-full w-full bg-slate-100 overflow-hidden flex flex-col">
          <div className="flex-1 relative w-full h-full">
            {viewMode === "3D" ? (
              <CadastreViewer3D
                ref={viewer3DRef}
                onSelectItem={setSelectedItem}
                activeLayers={layers}
                activeTool={activeTool}
                onTelemetryUpdate={setTelemetry}
              />
            ) : (
              <GeoCadastreMap onSelectPlot={(p) => {
                setSelectedItem({
                  id: p.id,
                  name: p.plotNumber,
                  category: "BUILDING",
                  depth: `0.0m to +${p.buildingHeight}m MSL`,
                  status: "ACTIVE",
                  ulpin: p.ulpin3D,
                  parcelId: p.surveyNumber,
                  owner: p.registeredOwner,
                  areaSqm: p.carpetAreaSqm,
                  volumeM3: p.carpetAreaSqm * p.buildingHeight,
                  coordinates: `${p.coordinates[1]}° N, ${p.coordinates[0]}° E`,
                  zMin: 0.0,
                  zMax: p.buildingHeight,
                  details: "ISO 19152 LADM II Strata Title Deed."
                });
              }} />
            )}

            {/* Navigation Controls */}
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

            {/* Vertical Strata Hierarchy Ruler */}
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs border border-slate-200 rounded p-2 shadow-xs text-[10px] font-mono flex flex-col space-y-1.5 z-10 select-none">
              <div className="font-bold text-slate-900 flex items-center justify-between pb-1 border-b border-slate-100 uppercase tracking-tight">
                <span>Strata Bounds</span>
                <span className="text-slate-400">MSL</span>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-3 text-slate-600">
                  <span className="font-semibold text-slate-800">+72m</span>
                  <span className="text-slate-500">Rooftop Air Rights</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-slate-600">
                  <span className="font-semibold text-slate-800">+24m</span>
                  <span className="text-slate-500">Superstructure</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-emerald-700 bg-emerald-50 px-1 rounded font-semibold">
                  <span>0.0m</span>
                  <span>Surface Ground</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-slate-600">
                  <span className="font-semibold text-slate-800">-2.8m</span>
                  <span className="text-emerald-600">Root Shield</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-slate-600">
                  <span className="font-semibold text-slate-800">-3.4m</span>
                  <span className="text-slate-500">Water Trunk</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-slate-600">
                  <span className="font-semibold text-slate-800">-8.5m</span>
                  <span className="text-indigo-600">Metro Corridor</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. GIS TELEMETRY STATUS BAR */}
          <div className="h-6 bg-[#090d16] text-slate-400 border-t border-slate-800 px-3 flex items-center justify-between text-[10px] font-mono shrink-0 z-20">
            <div className="flex items-center space-x-4">
              <span className="flex items-center gap-1 text-slate-300">
                <Compass className="w-3 h-3 text-cyan-400" /> {telemetry.cursorLat} {telemetry.cursorLon}
              </span>
              <span className="text-slate-500">|</span>
              <span>ELEV: <strong className="text-white">{telemetry.cursorZ}</strong></span>
              <span className="text-slate-500">|</span>
              <span>PITCH: <strong>{telemetry.camPitch}°</strong></span>
              <span>YAW: <strong>{telemetry.camBearing}°</strong></span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> WEBGL 2.0 // OK
              </span>
              <span className="text-slate-500">|</span>
              <span>{telemetry.fps} FPS</span>
            </div>
          </div>
        </main>

        {/* 4. RIGHT SIDEBAR: TECHNICAL INSPECTOR */}
        <aside className="w-80 bg-white border-l border-slate-200 flex flex-col justify-between shrink-0 z-20 text-xs">
          {selectedItem ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              
              {/* Header */}
              <div className="p-3 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-mono uppercase font-bold text-slate-500 block">
                    {selectedItem.category === "ECO_TREE" ? "Botanical Personhood Entity" : selectedItem.category}
                  </span>
                  <h2 className="font-bold text-xs text-slate-900 leading-snug">{selectedItem.name}</h2>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 bg-white text-[11px] font-semibold text-slate-500">
                <button
                  onClick={() => setInspectorTab("OVERVIEW")}
                  className={`flex-1 py-1.5 text-center border-b-2 transition cursor-pointer ${
                    inspectorTab === "OVERVIEW" ? "border-slate-900 text-slate-900" : "border-transparent hover:text-slate-900"
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setInspectorTab("SPATIAL")}
                  className={`flex-1 py-1.5 text-center border-b-2 transition cursor-pointer ${
                    inspectorTab === "SPATIAL" ? "border-slate-900 text-slate-900" : "border-transparent hover:text-slate-900"
                  }`}
                >
                  Spatial
                </button>
                <button
                  onClick={() => setInspectorTab("RIGHTS")}
                  className={`flex-1 py-1.5 text-center border-b-2 transition cursor-pointer ${
                    inspectorTab === "RIGHTS" ? "border-slate-900 text-slate-900" : "border-transparent hover:text-slate-900"
                  }`}
                >
                  Rights & Audit
                </button>
                <button
                  onClick={() => setInspectorTab("DOCUMENTS")}
                  className={`flex-1 py-1.5 text-center border-b-2 transition cursor-pointer ${
                    inspectorTab === "DOCUMENTS" ? "border-slate-900 text-slate-900" : "border-transparent hover:text-slate-900"
                  }`}
                >
                  Deed JSON
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3">
                
                {inspectorTab === "OVERVIEW" && (
                  <div className="space-y-2.5">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight block mb-0.5">Volumetric 3D-ULPIN</span>
                      <div className="font-mono text-[10px] bg-slate-50 p-1.5 rounded border border-slate-200 font-bold text-slate-900 break-all select-all">
                        {selectedItem.ulpin}
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded overflow-hidden divide-y divide-slate-100 text-[11px]">
                      <div className="flex justify-between p-1.5 bg-slate-50/50">
                        <span className="text-slate-500">Legal Owner</span>
                        <span className="font-semibold text-slate-900">{selectedItem.owner || selectedItem.custodian}</span>
                      </div>
                      <div className="flex justify-between p-1.5">
                        <span className="text-slate-500">Survey Parcel ID</span>
                        <span className="font-mono font-semibold text-slate-900">{selectedItem.parcelId}</span>
                      </div>
                      <div className="flex justify-between p-1.5 bg-slate-50/50">
                        <span className="text-slate-500">Vertical Bounds</span>
                        <span className="font-mono font-semibold text-slate-900">{selectedItem.depth}</span>
                      </div>
                    </div>

                    {/* TREE PERSONHOOD PANEL */}
                    {selectedItem.category === "ECO_TREE" && (
                      <div className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded space-y-1.5">
                        <div className="flex items-center justify-between text-emerald-900 font-bold text-[11px]">
                          <span>Protected Botanical Personhood</span>
                          <span className="text-[10px] font-mono bg-white px-1 py-0.2 rounded border border-emerald-200">{selectedItem.ageYears} Yrs Old</span>
                        </div>
                        <div className="text-[11px] text-slate-700 space-y-0.5">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Taxon:</span>
                            <span className="italic font-medium">{selectedItem.species}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">CO₂ Capture:</span>
                            <span className="font-mono font-bold">{selectedItem.annualCo2Kg} kg/yr</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Tax Dividend:</span>
                            <span className="font-mono text-emerald-700 font-bold">₹{selectedItem.taxRebateInr} / yr</span>
                          </div>
                        </div>
                        <div className="pt-1.5 border-t border-emerald-200 text-rose-800 font-bold text-[11px] flex items-center justify-between">
                          <span>Statutory Felling Penalty:</span>
                          <span className="font-mono">₹{selectedItem.fellingPenaltyInr?.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    )}

                    {/* FAR AUDIT PANEL */}
                    {(activeWorkflow === "FAR_AUDIT" || selectedItem.category === "GHOST_FLOOR") && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded space-y-1.5">
                        <div className="flex items-center justify-between text-rose-900 font-bold text-[11px]">
                          <span className="flex items-center gap-1"><AlertOctagon className="w-3.5 h-3.5 text-rose-600" /> FAR Violation Audit</span>
                          <span className="font-mono font-bold">+{farAuditData.fsi_deviation_pct}% Excess FSI</span>
                        </div>
                        <div className="text-[11px] text-slate-700 space-y-0.5">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Ghost Floors:</span>
                            <span className="font-bold text-rose-700">{farAuditData.unauthorized_ghost_floors} Unauthorized</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Excess Built-up:</span>
                            <span className="font-mono font-semibold">{farAuditData.unauthorized_builtup_sqm} m²</span>
                          </div>
                        </div>
                        <div className="pt-1.5 border-t border-rose-200 text-rose-800 font-bold text-[11px] flex items-center justify-between">
                          <span>Uncollected Tax:</span>
                          <span className="font-mono">₹{farAuditData.financial_audit?.annual_uncollected_property_tax_inr?.toLocaleString("en-IN")} / yr</span>
                        </div>
                      </div>
                    )}

                    {/* UDS FRAUD PANEL */}
                    {activeWorkflow === "UDS_FRAUD" && (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded space-y-1.5">
                        <div className="flex items-center justify-between text-amber-900 font-bold text-[11px]">
                          <span className="flex items-center gap-1"><Scale className="w-3.5 h-3.5 text-amber-600" /> UDS Fraud Engine</span>
                          <span className="font-mono font-bold text-rose-700">{udsAuditData.uds_allocation_percentage}% Allocated</span>
                        </div>
                        <p className="text-[10px] text-slate-700">
                          <strong>Oversold Land Share:</strong> +{udsAuditData.illegal_oversold_uds_sqft} sq.ft beyond 100% legal plot boundary. Multi-mortgage pledge detected.
                        </p>
                      </div>
                    )}

                    <div className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
                      <strong>Registry Note:</strong> {selectedItem.details}
                    </div>
                  </div>
                )}

                {inspectorTab === "SPATIAL" && (
                  <div className="space-y-2 text-[11px]">
                    <div className="border border-slate-200 rounded overflow-hidden divide-y divide-slate-100">
                      <div className="flex justify-between p-1.5 bg-slate-50/50">
                        <span className="text-slate-500">Centroid</span>
                        <span className="font-mono font-semibold">{selectedItem.coordinates}</span>
                      </div>
                      <div className="flex justify-between p-1.5">
                        <span className="text-slate-500">Elevation Base (Z-min)</span>
                        <span className="font-mono font-semibold">{selectedItem.zMin ?? 0.0}m MSL</span>
                      </div>
                      <div className="flex justify-between p-1.5 bg-slate-50/50">
                        <span className="text-slate-500">Elevation Peak (Z-max)</span>
                        <span className="font-mono font-semibold">{selectedItem.zMax ?? 24.0}m MSL</span>
                      </div>
                      <div className="flex justify-between p-1.5">
                        <span className="text-slate-500">Enclosed Footprint</span>
                        <span className="font-mono font-semibold">{selectedItem.areaSqm || 600} m²</span>
                      </div>
                      <div className="flex justify-between p-1.5 bg-slate-50/50">
                        <span className="text-slate-500">3D Volumetric Volume</span>
                        <span className="font-mono font-semibold">{selectedItem.volumeM3 || 14400} m³</span>
                      </div>
                    </div>
                  </div>
                )}

                {inspectorTab === "RIGHTS" && (
                  <div className="space-y-2 text-[11px]">
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <div className="text-[9px] text-slate-400 font-bold uppercase">ISO 19152 RRR Classification</div>
                      <div className="font-bold text-slate-800">Primary Freehold Strata Title (LA_Right)</div>
                    </div>

                    {selectedItem.category === "ECO_TREE" && (
                      <div className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-2">
                        <div className="font-bold text-slate-800 flex items-center gap-1">
                          <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" /> Afforestation Escrow (1:10)
                        </div>
                        <p className="text-[10px] text-slate-500">
                          Mandatory replacement proof required before clearing municipal development NOC.
                        </p>

                        <div className="grid grid-cols-2 gap-1.5">
                          <div>
                            <label className="text-[9px] text-slate-500 block">Sector</label>
                            <select
                              value={applicantType}
                              onChange={(e: any) => setApplicantType(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded p-1 text-[10px]"
                            >
                              <option value="GOVERNMENT_INFRA">Government PSU</option>
                              <option value="PRIVATE_DEVELOPER">Private Builder</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[9px] text-slate-500 block">Executing Authority</label>
                            <input
                              type="text"
                              value={applicantName}
                              onChange={(e) => setApplicantName(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded p-1 text-[10px]"
                            />
                          </div>
                        </div>

                        <button
                          onClick={handleVerifyAfforestation}
                          disabled={isProcessingProof}
                          className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs rounded transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          {isProcessingProof ? <Loader2 className="w-3 h-3 animate-spin" /> : <UploadCloud className="w-3 h-3" />}
                          Deposit Escrow & Mint 10 Tokens
                        </button>

                        {afforestationProof && (
                          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-[10px] text-emerald-900 font-mono">
                            Verified: 10 Child Tokens Minted in {afforestationProof.afforestation_audit?.target_zone}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {inspectorTab === "DOCUMENTS" && (
                  <div>
                    <pre className="p-2 bg-[#090d16] text-slate-200 rounded text-[9px] font-mono overflow-x-auto leading-relaxed">
                      {JSON.stringify(
                        {
                          standard: "ISO 19152 LADM II",
                          ulpin_3d: selectedItem.ulpin,
                          entity: selectedItem.name,
                          bounds: selectedItem.depth,
                          status: selectedItem.status,
                          owner: selectedItem.owner || selectedItem.custodian
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <MousePointer className="w-6 h-6 text-slate-300 mb-1" />
              <p className="font-medium text-slate-600 text-xs">Select an object in the viewport</p>
            </div>
          )}

          <div className="p-2 border-t border-slate-200 bg-slate-50/80 text-[10px] text-slate-400 flex items-center justify-between font-mono">
            <span>DoLR Spatial Engine</span>
            <span>v2.8-prod</span>
          </div>
        </aside>
      </div>

      {/* AI Deed Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-lg w-full max-w-xl shadow-2xl p-5 flex flex-col space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-500" /> AI Deed Ingestion Engine
              </div>
              <button onClick={() => setIsAiModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              rows={4}
              value={deedText}
              onChange={(e) => setDeedText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-400 font-mono"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAiIngest}
                disabled={isAiLoading}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded transition cursor-pointer"
              >
                {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                {isAiLoading ? "Parsing..." : "Ingest & Generate 3D-ULPIN"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
