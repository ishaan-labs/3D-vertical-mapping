"use client";

import React, { useState } from "react";
import CadastreViewer3D from "@/components/CadastreViewer3D";
import GeoCadastreMap, { STATE_WARDS, CadastralPlot } from "@/components/GeoCadastreMap";
import { 
  Layers, AlertTriangle, Sparkles, Send, X, Loader2, Globe2, Box, 
  IndianRupee, Plane, Scale, AlertOctagon, Activity, Radio, ShieldAlert, Cpu, UserCheck,
  Leaf, Trees, Wind, Sprout
} from "lucide-react";

export default function Home() {
  const [viewMode, setViewMode] = useState<"CROSS_SECTION" | "MAP">("CROSS_SECTION");
  const [activeTab, setActiveTab] = useState<"DEEDS" | "FAR_AUDIT" | "UDS_FRAUD" | "ECO_CADASTRE">("ECO_CADASTRE");
  const [activePlot, setActivePlot] = useState<CadastralPlot>(STATE_WARDS[0].plots[0]);
  
  const [highlightViolations, setHighlightViolations] = useState(true);
  const [showGreenEcosystem, setShowGreenEcosystem] = useState(true);

  const [farResult, setFarResult] = useState<any>(null);
  const [udsResult, setUdsResult] = useState<any>(null);
  const [ecoResult, setEcoResult] = useState<any>(null);

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

  // 1. Eco-Cadastre Green-FSI Audit
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
      alert("FastAPI backend connection error.");
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
    <main className="h-screen bg-[#030712] text-slate-100 flex flex-col font-sans overflow-hidden select-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]">
      {/* Header */}
      <header className="border-b border-emerald-900/30 bg-[#070d1e]/80 backdrop-blur-xl px-6 py-2.5 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center space-x-3.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
            <Leaf className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-extrabold tracking-widest uppercase bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
                3D-BhuAadhar Eco-Cadastre
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                ESG & LADM II
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-wider">
              Volumetric Cadastre, Urban Tree-Root Protection & Biotope Carbon Index
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex bg-[#040817] border border-slate-800 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => setViewMode("CROSS_SECTION")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === "CROSS_SECTION"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Box className="w-3.5 h-3.5" /> 3D Eco-Twin & Strata
            </button>
            <button
              onClick={() => setViewMode("MAP")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === "MAP"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" /> Geographic WebGIS
            </button>
          </div>

          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> AI Deed Ingestor
          </button>
        </div>
      </header>

      {/* Ticker */}
      <div className="grid grid-cols-4 gap-3 px-6 py-2 bg-[#050b18]/60 border-b border-slate-800/80 text-xs shrink-0 backdrop-blur-md">
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/50 border border-slate-800 rounded-lg">
          <span className="text-[10px] text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Trees className="w-3 h-3 text-emerald-400" /> Protected Urban Canopies
          </span>
          <span className="font-mono font-bold text-emerald-400">3,420 Trees</span>
        </div>
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/50 border border-slate-800 rounded-lg">
          <span className="text-[10px] text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Wind className="w-3 h-3 text-teal-400" /> CO₂ Sequestered / yr
          </span>
          <span className="font-mono font-bold text-teal-300">76.95 Tons</span>
        </div>
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/50 border border-slate-800 rounded-lg">
          <span className="text-[10px] text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <IndianRupee className="w-3 h-3 text-amber-400" /> Tax Recovery Pool
          </span>
          <span className="font-mono font-bold text-amber-400">₹4.82 Cr / yr</span>
        </div>
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/50 border border-slate-800 rounded-lg">
          <span className="text-[10px] text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Sprout className="w-3 h-3 text-emerald-400" /> Green-FSI Score
          </span>
          <span className="font-mono font-bold text-emerald-400">84 / 100 ESG</span>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 min-h-0 overflow-hidden">
        {/* Left Viewport */}
        <div className="lg:col-span-7 relative h-full bg-[#060c1c] rounded-2xl border border-emerald-900/30 overflow-hidden shadow-2xl flex flex-col">
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

          {viewMode === "CROSS_SECTION" && (
            <div className="absolute bottom-4 left-4 bg-[#070e24]/90 backdrop-blur-xl border border-slate-700/80 p-2.5 rounded-xl shadow-2xl z-10 flex items-center gap-5 text-xs">
              <label className="flex items-center gap-2 text-emerald-400 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={showGreenEcosystem}
                  onChange={(e) => setShowGreenEcosystem(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
                Tree Canopy & Root Protection Zones
              </label>
              <label className="flex items-center gap-2 text-red-400 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={highlightViolations}
                  onChange={(e) => setHighlightViolations(e.target.checked)}
                  className="w-4 h-4 accent-red-500 rounded"
                />
                FAR Violations
              </label>
            </div>
          )}
        </div>

        {/* Right Audit Suite */}
        <div className="lg:col-span-5 flex flex-col space-y-3 h-full overflow-y-auto pr-1">
          {/* Navigation Tabs */}
          <div className="grid grid-cols-4 gap-1 bg-[#070e24] p-1.5 rounded-2xl border border-slate-800 shadow-lg">
            <button
              onClick={() => setActiveTab("ECO_CADASTRE")}
              className={`py-2 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === "ECO_CADASTRE"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Leaf className="w-3 h-3" /> Eco-Cadastre
            </button>
            <button
              onClick={() => setActiveTab("DEEDS")}
              className={`py-2 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === "DEEDS"
                  ? "bg-sky-500/20 text-sky-400 border border-sky-500/50"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <UserCheck className="w-3 h-3" /> Deeds
            </button>
            <button
              onClick={() => setActiveTab("FAR_AUDIT")}
              className={`py-2 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === "FAR_AUDIT"
                  ? "bg-red-500/20 text-red-400 border border-red-500/50"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <AlertOctagon className="w-3 h-3" /> FAR Audit
            </button>
            <button
              onClick={() => setActiveTab("UDS_FRAUD")}
              className={`py-2 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === "UDS_FRAUD"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/50"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Scale className="w-3.5 h-3.5" /> UDS Fraud
            </button>
          </div>

          {/* TAB: Eco-Cadastre & Biotope Engine */}
          {activeTab === "ECO_CADASTRE" && (
            <div className="bg-[#070e24]/90 border border-emerald-500/30 rounded-2xl p-4 shadow-xl space-y-3.5 flex-1 flex flex-col justify-between backdrop-blur-md">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-extrabold text-slate-100 uppercase tracking-widest flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-emerald-400" /> Urban Biotope & Carbon Cadastre
                  </h2>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    ESG Standard
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Calculates volumetric tree canopy coverage, enforces subterranean root-zone easements against pipeline excavation, and tracks plot carbon sequestration.
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#040817] p-3 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block font-medium">Tree Canopy Index</span>
                    <span className="font-bold text-emerald-400">14 Mature Trees (320m²)</span>
                  </div>
                  <div className="bg-[#040817] p-3 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block font-medium">Subsurface Root Zone</span>
                    <span className="font-bold text-teal-300">3.0m Protected Radius</span>
                  </div>
                </div>

                <button
                  onClick={handleRunEcoAudit}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
                >
                  Compute Plot ESG Carbon Index
                </button>

                {ecoResult && (
                  <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl space-y-2.5 text-xs shadow-inner">
                    <div className="font-bold text-emerald-400 flex items-center justify-between">
                      <span>{ecoResult.eco_status}</span>
                      <span className="font-mono text-white">Score: {ecoResult.eco_score_index}/100</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                      <div><strong>Annual CO₂ Absorption:</strong> {ecoResult.carbon_metrics?.annual_co2_absorbed_kg} kg/yr</div>
                      <div><strong>Oxygen Yield:</strong> {ecoResult.carbon_metrics?.annual_oxygen_generated_kg} kg/yr</div>
                    </div>
                    <div className="p-2.5 bg-slate-950 rounded-lg border border-emerald-500/30 text-[11px] text-emerald-300">
                      {ecoResult.root_protection_zone}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800 flex items-center justify-between font-mono">
                <span>MoEFCC Green-FSI Norms</span>
                <span>Bio-Shield Active</span>
              </div>
            </div>
          )}

          {/* TAB: Strata Deeds */}
          {activeTab === "DEEDS" && (
            <div className="bg-[#070e24]/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3 flex-1 flex flex-col justify-between backdrop-blur-md">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div>
                    <h2 className="text-sm font-extrabold text-white">{activePlot.plotNumber}</h2>
                    <p className="text-[10px] text-slate-400">{activePlot.wardName}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-mono font-bold text-sky-400">+{activePlot.buildingHeight}m MSL</div>
                  </div>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {activePlot.strataBreakdown.map((s, idx) => (
                    <div key={idx} className="bg-[#040817] border border-slate-800 p-2 rounded-xl text-xs flex flex-col space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-[11px]">{s.floor}</span>
                        <span className="text-sky-400 font-mono text-[10px]">{s.elevation}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span><strong>Owner:</strong> {s.owner}</span>
                        <span className="text-slate-500 font-mono">{s.ulpin}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: FAR Audit */}
          {activeTab === "FAR_AUDIT" && (
            <div className="bg-[#070e24]/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3.5 flex-1 flex flex-col justify-between backdrop-blur-md">
              <div className="space-y-3">
                <h2 className="text-xs font-extrabold text-slate-100 uppercase tracking-widest flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-red-400" /> FAR & Tax Evasion Engine
                </h2>
                <button
                  onClick={handleRunFarAudit}
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-90 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  Execute Municipal FAR Audit
                </button>
                {farResult && (
                  <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl space-y-2 text-xs">
                    <div className="font-bold text-red-400">CRITICAL BYLAW VIOLATION: +{farResult.fsi_deviation_pct}% Excess FSI</div>
                    <div className="text-emerald-400 font-bold font-mono">Uncollected Tax: ₹{farResult.financial_audit?.annual_uncollected_property_tax_inr?.toLocaleString("en-IN")} / yr</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: UDS Fraud */}
          {activeTab === "UDS_FRAUD" && (
            <div className="bg-[#070e24]/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3.5 flex-1 flex flex-col justify-between backdrop-blur-md">
              <div className="space-y-3">
                <h2 className="text-xs font-extrabold text-slate-100 uppercase tracking-widest flex items-center gap-2">
                  <Scale className="w-4 h-4 text-amber-400" /> UDS Conservation Validator
                </h2>
                <button
                  onClick={handleRunUdsAudit}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  Verify UDS Allocation Integrity
                </button>
                {udsResult && (
                  <div className="p-3 bg-amber-950/60 border border-amber-500/40 rounded-xl space-y-2 text-xs">
                    <div className="font-bold text-amber-400">FRAUD ALERT: {udsResult.uds_allocation_percentage}% Allocated (+{udsResult.illegal_oversold_uds_sqft} sq.ft Oversold)</div>
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
