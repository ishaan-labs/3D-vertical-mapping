"use client";

import React, { useState, useEffect } from "react";
import CadastreViewer3D from "@/components/CadastreViewer3D";
import GeoCadastreMap, { STATE_WARDS, CadastralPlot } from "@/components/GeoCadastreMap";
import { 
  Layers, AlertTriangle, Sparkles, Send, X, Loader2, Globe2, Box, 
  IndianRupee, Plane, Scale, AlertOctagon, Activity, Radio, ShieldAlert, Cpu, UserCheck,
  Leaf, Trees, Wind, Sprout, Crosshair, Terminal, Zap, ShieldCheck, Download, RefreshCw, BarChart2
} from "lucide-react";

export default function Home() {
  const [viewMode, setViewMode] = useState<"CROSS_SECTION" | "MAP">("CROSS_SECTION");
  const [activeTab, setActiveTab] = useState<"ECO_CADASTRE" | "DEEDS" | "FAR_AUDIT" | "UDS_FRAUD">("ECO_CADASTRE");
  const [activePlot, setActivePlot] = useState<CadastralPlot>(STATE_WARDS[0].plots[0]);
  
  const [highlightViolations, setHighlightViolations] = useState(true);
  const [showGreenEcosystem, setShowGreenEcosystem] = useState(true);

  const [farResult, setFarResult] = useState<any>(null);
  const [udsResult, setUdsResult] = useState<any>(null);
  const [ecoResult, setEcoResult] = useState<any>(null);
  const [liveTelemetry, setLiveTelemetry] = useState({ lat: "13.0610° N", lon: "80.2520° E", alt: "+48.2m MSL", fps: "59.8" });

  const [activeLayers, setActiveLayers] = useState({
    TRANSIT: true,
    TELECOM: true,
    WATER: true,
    GAS: true,
    SEWER: true,
  });

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [deedText, setDeedText] = useState("Flat No 402, Carpet 128.5 sqm, 4th Floor, Land Base IND80219481920.");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);

  // Micro-telemetry jitter effect
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTelemetry(prev => ({
        ...prev,
        fps: (59.4 + Math.random() * 0.8).toFixed(1)
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleRunEcoAudit = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/audit/eco-cadastre", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parcel_id: activePlot.ulpin3D,
          plot_area_sqm: 1200.0,
          builtup_footprint_sqm: 600.0,
          green_cover_sqm: 320.0,
          tree_count: 14,
          rooftop_solar_green_sqm: 180.0
        })
      });
      const data = await res.json();
      setEcoResult(data);
    } catch (e) {
      alert("FastAPI backend error.");
    }
  };

  const handleRunFarAudit = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/audit/far-violation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parcel_id: activePlot.ulpin3D,
          plot_area_sqm: 1200.0,
          sanctioned_fsi: 2.5,
          sanctioned_height_m: 18.0,
          actual_height_m: 24.0,
          actual_builtup_area_sqm: 4200.0,
          municipal_tax_rate_per_sqm_inr: 150.0,
          commercial_penalty_multiplier: 4.0
        })
      });
      const data = await res.json();
      setFarResult(data);
    } catch (e) {
      alert("FastAPI backend error.");
    }
  };

  const handleRunUdsAudit = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/audit/uds-conservation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parcel_id: activePlot.ulpin3D,
          total_sanctioned_uds_sqft: 10000.0,
          registered_units: [
            { unit_id: "U-101", owner: "Ishaan Srivastava", allocated_uds_sqft: 2500.0, mortgage_bank: "SBI" },
            { unit_id: "U-201", owner: "Southern Tech", allocated_uds_sqft: 3500.0, mortgage_bank: "HDFC" },
            { unit_id: "U-301", owner: "Apex Asset", allocated_uds_sqft: 3000.0, mortgage_bank: "SBI" },
            { unit_id: "U-401", owner: "Govt Board", allocated_uds_sqft: 2800.0, mortgage_bank: "ICICI" }
          ]
        })
      });
      const data = await res.json();
      setUdsResult(data);
    } catch (e) {
      alert("Backend error.");
    }
  };

  return (
    <main className="h-screen bg-[#030712] text-slate-100 flex flex-col font-sans overflow-hidden select-none relative">
      {/* Dynamic Grid Background Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Top Cyber Command Header */}
      <header className="border-b border-emerald-500/20 bg-[#060b19]/90 backdrop-blur-2xl px-6 py-2.5 flex items-center justify-between shrink-0 z-20 shadow-[0_4px_25px_rgba(0,0,0,0.7)]">
        <div className="flex items-center space-x-3.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-500/10 border border-emerald-400/50 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Cpu className="w-5 h-5 animate-pulse text-emerald-400" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-widest uppercase bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-400 bg-clip-text text-transparent font-mono">
                3D-BHUAADHAR // NATIONAL DIGITAL TWIN
              </h1>
              <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-mono tracking-wider">
                LADM II SECURE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-wider flex items-center gap-2 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              SURVEY OF INDIA NODAL SPATIAL ENGINE // LEVEL-OF-DETAIL 2.8
            </p>
          </div>
        </div>

        {/* Tactical Mode Switchers */}
        <div className="flex items-center space-x-3">
          <div className="flex bg-[#02050f] border border-slate-800 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => setViewMode("CROSS_SECTION")}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer font-mono ${
                viewMode === "CROSS_SECTION"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Box className="w-3.5 h-3.5" /> 3D DIGITAL TWIN
            </button>
            <button
              onClick={() => setViewMode("MAP")}
              className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer font-mono ${
                viewMode === "MAP"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" /> WEBGIS SPATIAL
            </button>
          </div>

          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-extrabold rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:brightness-110 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all cursor-pointer font-mono tracking-wider"
          >
            <Sparkles className="w-4 h-4 animate-spin" /> AI DEED PARSER
          </button>
        </div>
      </header>

      {/* Live Tactical Telemetry Ticker */}
      <div className="grid grid-cols-4 gap-3 px-6 py-2 bg-[#040816]/90 border-b border-slate-800/80 text-xs shrink-0 backdrop-blur-md font-mono z-10">
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#070e24]/70 border border-slate-800 rounded-lg shadow-inner">
          <span className="text-[10px] text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Trees className="w-3 h-3 text-emerald-400" /> PROTECTED CANOPIES
          </span>
          <span className="font-bold text-emerald-400">3,420 UNITS</span>
        </div>
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#070e24]/70 border border-slate-800 rounded-lg shadow-inner">
          <span className="text-[10px] text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Wind className="w-3 h-3 text-teal-400" /> CO₂ CAPTURE RATE
          </span>
          <span className="font-bold text-teal-300">76.95 TONS / YR</span>
        </div>
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#070e24]/70 border border-slate-800 rounded-lg shadow-inner">
          <span className="text-[10px] text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <IndianRupee className="w-3 h-3 text-amber-400" /> REVENUE RECOVERY
          </span>
          <span className="font-bold text-amber-400">₹4.82 CR AUDITED</span>
        </div>
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#070e24]/70 border border-slate-800 rounded-lg shadow-inner">
          <span className="text-[10px] text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Crosshair className="w-3 h-3 text-cyan-400" /> SPATIAL TELEMETRY
          </span>
          <span className="font-bold text-cyan-400">{liveTelemetry.fps} FPS // OK</span>
        </div>
      </div>

      {/* Main Workspace (Viewport + Command Suite) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 min-h-0 overflow-hidden relative z-10">
        {/* Left 7 Columns: 3D Scene Viewport with Tactical Reticles */}
        <div className="lg:col-span-7 relative h-full bg-[#040816] rounded-2xl border border-emerald-500/20 overflow-hidden shadow-[0_0_35px_rgba(0,0,0,0.9)] flex flex-col">
          {viewMode === "CROSS_SECTION" ? (
            <CadastreViewer3D
              onSelectItem={() => {}}
              activeLayers={activeLayers}
              highlightViolations={highlightViolations}
              showGreenEcosystem={showGreenEcosystem}
            />
          ) : (
            <GeoCadastreMap onSelectPlot={setActivePlot} />
          )}

          {/* Top-Right Spatial Reticle Badge */}
          <div className="absolute top-4 right-4 bg-[#050b18]/90 backdrop-blur-xl border border-cyan-500/30 px-3 py-2 rounded-xl shadow-2xl z-10 flex flex-col items-end gap-0.5 text-[10px] font-mono">
            <div className="text-cyan-400 font-bold flex items-center gap-1.5">
              <Crosshair className="w-3 h-3 animate-spin" /> {liveTelemetry.lat} {liveTelemetry.lon}
            </div>
            <div className="text-slate-400">{liveTelemetry.alt} // WGS84</div>
          </div>

          {/* Bottom Tactical Layer Toggles */}
          {viewMode === "CROSS_SECTION" && (
            <div className="absolute bottom-4 left-4 bg-[#060c1e]/90 backdrop-blur-xl border border-slate-700/80 p-3 rounded-xl shadow-2xl z-10 flex items-center gap-5 text-xs font-mono">
              <label className="flex items-center gap-2 text-emerald-400 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={showGreenEcosystem}
                  onChange={(e) => setShowGreenEcosystem(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
                BIOTOPE ROOT-ZONE LAYER
              </label>
              <label className="flex items-center gap-2 text-red-400 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={highlightViolations}
                  onChange={(e) => setHighlightViolations(e.target.checked)}
                  className="w-4 h-4 accent-red-500 rounded"
                />
                FAR GHOST FLOORS
              </label>
            </div>
          )}
        </div>

        {/* Right 5 Columns: Glassmorphic Bento Audit Suite */}
        <div className="lg:col-span-5 flex flex-col space-y-3 h-full overflow-y-auto pr-1">
          {/* Tactical Tab Selectors */}
          <div className="grid grid-cols-4 gap-1.5 bg-[#050b18] p-1.5 rounded-2xl border border-slate-800/80 shadow-lg font-mono">
            <button
              onClick={() => setActiveTab("ECO_CADASTRE")}
              className={`py-2 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === "ECO_CADASTRE"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Leaf className="w-3 h-3" /> ECO
            </button>
            <button
              onClick={() => setActiveTab("DEEDS")}
              className={`py-2 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === "DEEDS"
                  ? "bg-sky-500/20 text-sky-300 border border-sky-500/50"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <UserCheck className="w-3 h-3" /> DEEDS
            </button>
            <button
              onClick={() => setActiveTab("FAR_AUDIT")}
              className={`py-2 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === "FAR_AUDIT"
                  ? "bg-red-500/20 text-red-300 border border-red-500/50"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <AlertOctagon className="w-3 h-3" /> FAR AUDIT
            </button>
            <button
              onClick={() => setActiveTab("UDS_FRAUD")}
              className={`py-2 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === "UDS_FRAUD"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Scale className="w-3 h-3" /> UDS
            </button>
          </div>

          {/* TAB 1: Urban Eco-Cadastre & Biotope Engine */}
          {activeTab === "ECO_CADASTRE" && (
            <div className="bg-[#050b18]/90 border border-emerald-500/30 rounded-2xl p-4 shadow-xl space-y-3.5 flex-1 flex flex-col justify-between backdrop-blur-xl">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-xs font-black text-slate-100 uppercase tracking-widest font-mono">
                      URBAN BIOTOPE & CARBON CADASTRE
                    </h2>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                    MOEFCC COMPLIANT
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-[#02050f] p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">CANOPY FOOTPRINT</span>
                    <span className="font-bold text-emerald-400">14 TREES // 320 M²</span>
                  </div>
                  <div className="bg-[#02050f] p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">SUBTERRANEAN BUFFER</span>
                    <span className="font-bold text-teal-300">3.0M ROOT SHIELD</span>
                  </div>
                </div>

                <button
                  onClick={handleRunEcoAudit}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition shadow-[0_0_20px_rgba(16,185,129,0.35)] cursor-pointer font-mono"
                >
                  EXECUTE ESG CARBON COMPUTATION
                </button>

                {ecoResult && (
                  <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl space-y-2.5 text-xs shadow-inner font-mono">
                    <div className="font-bold text-emerald-400 flex items-center justify-between">
                      <span>STATUS: {ecoResult.eco_status}</span>
                      <span className="text-white bg-emerald-500/20 px-2 py-0.5 rounded">SCORE: {ecoResult.eco_score_index}/100</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                      <div><strong>CO₂ YIELD:</strong> {ecoResult.carbon_metrics?.annual_co2_absorbed_kg} KG/YR</div>
                      <div><strong>OXYGEN:</strong> {ecoResult.carbon_metrics?.annual_oxygen_generated_kg} KG/YR</div>
                    </div>
                    <div className="p-2 bg-[#02050f] rounded-lg border border-emerald-500/30 text-[10px] text-emerald-300">
                      {ecoResult.root_protection_zone}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800 flex items-center justify-between font-mono">
                <span>PARCEL ID: {activePlot.ulpin3D.slice(0, 16)}...</span>
                <span>BIOTOPE RATIO: 0.28 BAR</span>
              </div>
            </div>
          )}

          {/* TAB 2: Strata Ownership Breakdown */}
          {activeTab === "DEEDS" && (
            <div className="bg-[#050b18]/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3 flex-1 flex flex-col justify-between backdrop-blur-xl font-mono">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <h2 className="text-sm font-bold text-white">{activePlot.plotNumber}</h2>
                    <p className="text-[10px] text-slate-400">{activePlot.wardName}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-sky-400">+{activePlot.buildingHeight}M MSL</div>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {activePlot.strataBreakdown.map((s, idx) => (
                    <div key={idx} className="bg-[#02050f] border border-slate-800 p-2.5 rounded-xl text-xs flex flex-col space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-[11px]">{s.floor}</span>
                        <span className="text-sky-400 text-[10px]">{s.elevation}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>OWNER: {s.owner}</span>
                        <span className="text-slate-500">{s.ulpin}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800 flex items-center justify-between">
                <span>TOTAL AREA: {activePlot.carpetAreaSqm} M²</span>
                <span>{activePlot.floors} REGISTERED TIERS</span>
              </div>
            </div>
          )}

          {/* TAB 3: FAR Violation Auditor */}
          {activeTab === "FAR_AUDIT" && (
            <div className="bg-[#050b18]/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3.5 flex-1 flex flex-col justify-between backdrop-blur-xl font-mono">
              <div className="space-y-3">
                <h2 className="text-xs font-black text-slate-100 uppercase tracking-widest flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-red-400" /> VOLUMETRIC FAR & TAX EVASION AUDITOR
                </h2>
                <button
                  onClick={handleRunFarAudit}
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-90 text-white font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer"
                >
                  RUN MUNICIPAL PENALTY AUDIT
                </button>
                {farResult && (
                  <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl space-y-2 text-xs">
                    <div className="font-bold text-red-400">ALERT: +{farResult.fsi_deviation_pct}% EXCESS FSI DETECTED</div>
                    <div className="text-emerald-400 font-bold">UNCOLLECTED TAX: ₹{farResult.financial_audit?.annual_uncollected_property_tax_inr?.toLocaleString("en-IN")} / YR</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: UDS Fraud Check */}
          {activeTab === "UDS_FRAUD" && (
            <div className="bg-[#050b18]/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3.5 flex-1 flex flex-col justify-between backdrop-blur-xl font-mono">
              <div className="space-y-3">
                <h2 className="text-xs font-black text-slate-100 uppercase tracking-widest flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-400" /> UDS CONSERVATION INTEGRITY CHECK
                </h2>
                <button
                  onClick={handleRunUdsAudit}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition cursor-pointer"
                >
                  VERIFY FRACTIONAL LAND EQUATION
                </button>
                {udsResult && (
                  <div className="p-3 bg-amber-950/60 border border-amber-500/40 rounded-xl space-y-2 text-xs">
                    <div className="font-bold text-amber-400">FRAUD ALERT: {udsResult.uds_allocation_percentage}% ALLOCATED (+{udsResult.illegal_oversold_uds_sqft} SQ.FT OVERSOLD)</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
