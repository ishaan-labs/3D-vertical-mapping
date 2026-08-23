"use client";

import React, { useState } from "react";
import CadastreViewer3D from "@/components/CadastreViewer3D";
import GeoCadastreMap, { STATE_WARDS, CadastralPlot } from "@/components/GeoCadastreMap";
import { 
  Layers, AlertTriangle, FileText, CheckCircle2, 
  Sparkles, Send, X, Loader2, Globe2, Box, ShieldCheck, UserCheck, Check,
  IndianRupee, Plane, Scale, AlertOctagon
} from "lucide-react";

export default function Home() {
  const [viewMode, setViewMode] = useState<"CROSS_SECTION" | "MAP">("CROSS_SECTION");
  const [activeTab, setActiveTab] = useState<"FAR_AUDIT" | "UDS_FRAUD" | "AIRSPACE">("FAR_AUDIT");
  
  const [activePlot, setActivePlot] = useState<CadastralPlot>(STATE_WARDS[0].plots[0]);
  const [highlightViolations, setHighlightViolations] = useState(true);
  const [showDroneCorridor, setShowDroneCorridor] = useState(true);

  const [farResult, setFarResult] = useState<any>(null);
  const [udsResult, setUdsResult] = useState<any>(null);
  const [airspaceResult, setAirspaceResult] = useState<any>(null);

  const [activeLayers, setActiveLayers] = useState({
    TRANSIT: true,
    TELECOM: true,
    WATER: true,
    GAS: true,
    SEWER: true,
  });

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [deedText, setDeedText] = useState(
    "Flat No 402 situated on the 4th Floor of Block B, with ceiling height of 3.0 meters above 4th floor slab level at elevation 12.0m to 15.0m, having carpet area of 128.5 sqm under base survey land parcel IND80219481920."
  );
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);

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
      alert("FastAPI backend connection error on port 8000.");
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
      alert("FastAPI backend connection error on port 8000.");
    }
  };

  const handleRunAirspaceAudit = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/audit/airspace-corridor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          corridor_id: "DGCA-SKYWAY-CHN-04",
          min_altitude_msl: 80.0,
          max_altitude_msl: 95.0,
          building_top_msl: 72.0,
          lightning_rod_tip_msl: 76.5,
          safety_buffer_m: 5.0
        })
      });
      const data = await res.json();
      setAirspaceResult(data);
    } catch (e) {
      alert("FastAPI backend connection error on port 8000.");
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
        alert("3D Parcel Ingested Successfully! 3D-ULPIN: " + data.generated_3d_ulpin?.ulpin_3d);
      }
    } catch (e) {
      alert("AI Ingestion service error.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <main className="h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wide">3D-BhuAadhar | National Volumetric Cadastre & Regulatory Audit Suite</h1>
            <p className="text-[11px] text-slate-400">Ministry of Rural Development & DoLR | ISO 19152 LADM II Standard</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("CROSS_SECTION")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
                viewMode === "CROSS_SECTION" ? "bg-emerald-500 text-slate-950 shadow font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Box className="w-3.5 h-3.5" /> 3D Digital Twin & Skyway
            </button>
            <button
              onClick={() => setViewMode("MAP")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
                viewMode === "MAP" ? "bg-emerald-500 text-slate-950 shadow font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" /> Geographic WebGIS
            </button>
          </div>

          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Deed Ingestor
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 min-h-0 overflow-hidden">
        <div className="lg:col-span-7 relative h-full bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
          {viewMode === "CROSS_SECTION" ? (
            <CadastreViewer3D
              onSelectItem={() => {}}
              activeLayers={activeLayers}
              highlightViolations={highlightViolations}
              showDroneCorridor={showDroneCorridor}
            />
          ) : (
            <GeoCadastreMap onSelectPlot={setActivePlot} />
          )}

          {viewMode === "CROSS_SECTION" && (
            <div className="absolute bottom-4 left-4 bg-slate-900/95 backdrop-blur border border-slate-700 p-2.5 rounded-xl shadow-xl z-10 flex items-center gap-4 text-xs">
              <label className="flex items-center gap-2 text-red-400 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={highlightViolations}
                  onChange={(e) => setHighlightViolations(e.target.checked)}
                  className="w-4 h-4 accent-red-500"
                />
                Ghost Floor Red Wireframe
              </label>
              <label className="flex items-center gap-2 text-cyan-400 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={showDroneCorridor}
                  onChange={(e) => setShowDroneCorridor(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500"
                />
                Drone Skyway Corridor (+80m)
              </label>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 flex flex-col space-y-3 h-full overflow-y-auto pr-1">
          <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("FAR_AUDIT")}
              className={`py-2 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "FAR_AUDIT" ? "bg-red-500/20 text-red-400 border border-red-500/40" : "text-slate-400 hover:text-white"
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" /> Ghost Floor & FAR
            </button>
            <button
              onClick={() => setActiveTab("UDS_FRAUD")}
              className={`py-2 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "UDS_FRAUD" ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "text-slate-400 hover:text-white"
              }`}
            >
              <Scale className="w-3.5 h-3.5" /> UDS Fraud Check
            </button>
            <button
              onClick={() => setActiveTab("AIRSPACE")}
              className={`py-2 text-[11px] font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "AIRSPACE" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" : "text-slate-400 hover:text-white"
              }`}
            >
              <Plane className="w-3.5 h-3.5" /> Drone Skyway
            </button>
          </div>

          {activeTab === "FAR_AUDIT" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4 text-red-400" /> Volumetric FAR & Tax Evasion Engine
                  </h2>
                  <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">
                    Bylaw Auditor
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Compares sanctioned 3D volume envelope against actual architectural heights to identify unapproved vertical extensions and uncollected municipal taxes.
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Sanctioned FAR</span>
                    <span className="font-semibold text-emerald-400">2.5 FSI (18.0m / 6 Floors)</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Constructed Height</span>
                    <span className="font-semibold text-red-400">24.0m (8 Floors / +2 Ghost)</span>
                  </div>
                </div>

                <button
                  onClick={handleRunFarAudit}
                  className="w-full py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition shadow-lg cursor-pointer"
                >
                  Execute Municipal FAR Audit
                </button>

                {farResult && (
                  <div className="p-3 bg-red-950/70 border border-red-500/50 rounded-xl space-y-2 text-xs">
                    <div className="font-bold text-red-400 flex items-center justify-between">
                      <span>CRITICAL BYLAW VIOLATION</span>
                      <span className="font-mono text-white">+{farResult.fsi_deviation_pct}% Excess FSI</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                      <div><strong>Ghost Floors:</strong> {farResult.unauthorized_ghost_floors} Floors</div>
                      <div><strong>Excess Built-up:</strong> {farResult.unauthorized_builtup_sqm} m²</div>
                    </div>
                    <div className="pt-2 border-t border-red-500/30">
                      <div className="text-[10px] text-slate-400">Uncollected Annual Municipal Tax:</div>
                      <div className="text-base font-mono font-bold text-emerald-400">
                        ₹{farResult.financial_audit?.annual_uncollected_property_tax_inr?.toLocaleString("en-IN")} / year
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">Compounded Structural Penalty:</div>
                      <div className="text-sm font-mono font-bold text-amber-400">
                        ₹{farResult.financial_audit?.compounded_structural_penalty_inr?.toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
                Automated Municipal Revenue Recovery System (AMRRS).
              </div>
            </div>
          )}

          {activeTab === "UDS_FRAUD" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-400" /> UDS Conservation & Mortgage Validator
                  </h2>
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    Fraud Prevention
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Enforces mathematical volumetric conservation on land parcels to prevent duplicate loan pledging and fractional over-allocation.
                </p>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs space-y-1">
                  <div className="text-[10px] text-slate-400">Registered Land Plot Share</div>
                  <div className="font-bold text-white">10,000 sq.ft Land Base</div>
                </div>

                <button
                  onClick={handleRunUdsAudit}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg transition shadow-lg cursor-pointer"
                >
                  Verify UDS Allocation Integrity
                </button>

                {udsResult && (
                  <div className="p-3 bg-amber-950/70 border border-amber-500/50 rounded-xl space-y-2 text-xs">
                    <div className="font-bold text-amber-400 flex items-center justify-between">
                      <span>UDS FRAUD DETECTED</span>
                      <span className="font-mono text-white">{udsResult.uds_allocation_percentage}% Allocated</span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      <strong>Oversold Land Share:</strong> <span className="text-red-400 font-bold">+{udsResult.illegal_oversold_uds_sqft} sq.ft</span> beyond legal plot limit.
                    </div>
                    <div className="p-2 bg-slate-950 rounded border border-amber-500/30 text-[11px] text-amber-300">
                      <strong>Multi-Bank Risk:</strong> Duplicate mortgage registrations detected across multiple banking institutions for identical land share units.
                    </div>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
                Guarantees zero fractional land inflation for sub-registrars.
              </div>
            </div>
          )}

          {activeTab === "AIRSPACE" && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <Plane className="w-4 h-4 text-cyan-400" /> Air Rights & Drone Skyway Cadastre
                  </h2>
                  <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                    A-Strata Airspace
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Demarcates rooftop 3D air rights and monitors DGCA Urban Air Mobility drone flight corridors against high-rise apex obstacles.
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Flight Skyway Altitude</span>
                    <span className="font-semibold text-cyan-400">+80.0m to +95.0m MSL</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Structure Apex</span>
                    <span className="font-semibold text-white">+76.5m (With Rod)</span>
                  </div>
                </div>

                <button
                  onClick={handleRunAirspaceAudit}
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg transition shadow-lg cursor-pointer"
                >
                  Verify Skyway Flight Clearance
                </button>

                {airspaceResult && (
                  <div className="p-3 bg-cyan-950/70 border border-cyan-500/50 rounded-xl space-y-2 text-xs">
                    <div className="font-bold text-cyan-400 flex items-center justify-between">
                      <span>{airspaceResult.airspace_status}</span>
                      <span className="font-mono text-white">{airspaceResult.vertical_clearance_meters}m Clearance</span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      <strong>Envelope:</strong> {airspaceResult.corridor_envelope_msl}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {airspaceResult.recommendation}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
                Compliant with DGCA DigitalSky & ISO 19152 Airspace Part 2.
              </div>
            </div>
          )}
        </div>
      </div>

      {isAiModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl p-6 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-base">
                <Sparkles className="w-5 h-5" /> Gemini AI Cadastral Deed Ingestor
              </div>
              <button onClick={() => setIsAiModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Paste raw sub-registrar deed text, architectural floor schedules, or municipal easements. Gemini will parse 3D elevation envelopes and compute standard 3D-ULPINs automatically.
            </p>

            <textarea
              rows={4}
              value={deedText}
              onChange={(e) => setDeedText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAiIngest}
                disabled={isAiLoading}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
              >
                {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isAiLoading ? "Parsing 3D Geometry..." : "Ingest & Generate 3D-ULPIN"}
              </button>
            </div>

            {aiResponse && (
              <div className="mt-2 p-3 bg-slate-950 border border-purple-500/40 rounded-xl text-xs space-y-2">
                <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> 3D-ULPIN Generated: <span className="font-mono text-white">{aiResponse.generated_3d_ulpin?.ulpin_3d}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-300">
                  <div><strong>Strata:</strong> {aiResponse.ai_extracted_data?.strata_type}</div>
                  <div><strong>Elevation:</strong> {aiResponse.ai_extracted_data?.z_min_meters}m to {aiResponse.ai_extracted_data?.z_max_meters}m</div>
                  <div><strong>Area:</strong> {aiResponse.ai_extracted_data?.estimated_carpet_area_sqm} m²</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
