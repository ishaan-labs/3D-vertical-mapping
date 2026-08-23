"use client";

import React, { useState } from "react";
import CadastreViewer3D from "@/components/CadastreViewer3D";
import GeoCadastreMap, { STATE_WARDS, CadastralPlot } from "@/components/GeoCadastreMap";
import { 
  Layers, AlertTriangle, FileText, CheckCircle2, 
  Droplet, Flame, Waves, Radio, Train, Sparkles, Send, X, Loader2, Globe2, Box, ShieldCheck, UserCheck, Check
} from "lucide-react";

export default function Home() {
  const [viewMode, setViewMode] = useState<"MAP" | "CROSS_SECTION">("MAP");
  
  // Default selected parcel
  const [activePlot, setActivePlot] = useState<CadastralPlot>(STATE_WARDS[0].plots[0]);

  const [activeLayers, setActiveLayers] = useState({
    TRANSIT: true,
    TELECOM: true,
    WATER: true,
    GAS: true,
    SEWER: true,
  });

  const [conflictResult, setConflictResult] = useState<any>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [deedText, setDeedText] = useState(
    "Flat No 402 situated on the 4th Floor of Block B, with ceiling height of 3.0 meters above 4th floor slab level at elevation 12.0m to 15.0m, having carpet area of 128.5 sqm under base survey land parcel IND80219481920."
  );
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);

  const handleRunAudit = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/spatial/check-conflict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          object_a: {
            id: activePlot.id,
            name: activePlot.plotNumber,
            strata_type: "U",
            z_min: -8.0,
            z_max: -2.0,
            coordinates_2d: activePlot.polygon
          },
          object_b: {
            id: "METRO-LINE-CORRIDOR-4",
            name: "Underground Metro Corridor Phase 2",
            strata_type: "U",
            z_min: -6.0,
            z_max: -3.0,
            coordinates_2d: [[80.2518, 13.0608], [80.2528, 13.0618]]
          },
          safety_buffer_meters: 2.0
        })
      });
      const data = await res.json();
      setConflictResult(data);
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
      {/* Top Government Portal Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wide">3D-BhuAadhar | National 3D Cadastral & Strata Registry Portal</h1>
            <p className="text-[11px] text-slate-400">Ministry of Rural Development & Land Resources (DoLR) | ISO 19152 LADM II Standard</p>
          </div>
        </div>

        {/* Mode Switchers */}
        <div className="flex items-center space-x-3">
          <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("MAP")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                viewMode === "MAP" ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" /> Geographic WebGIS
            </button>
            <button
              onClick={() => setViewMode("CROSS_SECTION")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                viewMode === "CROSS_SECTION" ? "bg-emerald-500 text-slate-950 shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              <Box className="w-3.5 h-3.5" /> Subsurface Engineering Cross-Section
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

      {/* Main Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 min-h-0 overflow-hidden">
        {/* Left 7 Columns: Interactive Map or PLATEAU Viewport */}
        <div className="lg:col-span-7 relative h-full bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
          {viewMode === "MAP" ? (
            <GeoCadastreMap onSelectPlot={setActivePlot} />
          ) : (
            <CadastreViewer3D onSelectItem={() => {}} activeLayers={activeLayers} />
          )}
        </div>

        {/* Right 5 Columns: Cadastral Deeds, Strata Ownership Table & Subsurface Audit */}
        <div className="lg:col-span-5 flex flex-col space-y-3 h-full overflow-y-auto pr-1">
          {/* Main Selected Parcel Header Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Active Cadastral Parcel
                </span>
                <h2 className="text-base font-bold text-white mt-1">{activePlot.plotNumber}</h2>
                <p className="text-[11px] text-slate-400">{activePlot.wardName} | {activePlot.district}</p>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400">Total Height</div>
                <div className="text-lg font-mono font-bold text-sky-400">+{activePlot.buildingHeight}m MSL</div>
              </div>
            </div>

            {/* 3D-ULPIN & 2D Survey Identification */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Survey / Plot Record</span>
                <span className="font-semibold text-slate-200">{activePlot.surveyNumber}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Total Built-Up Carpet</span>
                <span className="font-semibold text-slate-200">{activePlot.carpetAreaSqm.toLocaleString()} sq.m</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 block mb-1">Volumetric 3D-ULPIN (ISO 19152)</span>
              <div className="font-mono text-xs text-emerald-400 bg-slate-950 p-2 rounded-lg border border-slate-800 break-all select-all font-bold">
                {activePlot.ulpin3D}
              </div>
            </div>
          </div>

          {/* Floor-by-Floor Vertical Strata Ownership Deeds Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-2">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" /> Vertical Strata Ownership Registry
            </h3>
            <p className="text-[11px] text-slate-400">
              Every vertical tier holds a distinct legal title and 3D elevation envelope under the base land parcel.
            </p>

            <div className="space-y-2 pt-1 max-h-52 overflow-y-auto pr-1">
              {activePlot.strataBreakdown.map((s, idx) => (
                <div key={idx} className="bg-slate-950/80 border border-slate-800 p-2.5 rounded-lg text-xs flex flex-col space-y-1 hover:border-slate-700 transition">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{s.floor}</span>
                    <span className="text-sky-400 font-mono text-[11px]">{s.elevation}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span><strong>Owner:</strong> {s.owner}</span>
                    <span className="text-slate-500 font-mono">{s.ulpin}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subsurface Multi-Utility Clearance & 3D Spatial Audit */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Subsurface Spatial Audit
              </h3>
              <button
                onClick={handleRunAudit}
                className="py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] uppercase tracking-wider rounded-lg transition cursor-pointer"
              >
                Run 3D Spatial Query
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {activePlot.subsurfaceUtilities.map((u, i) => (
                <div key={i} className="bg-slate-950 p-2 rounded border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold text-slate-200">{u.name}</div>
                    <div className="text-[10px] text-slate-400">{u.depth}</div>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: u.color }} />
                </div>
              ))}
            </div>

            {conflictResult && (
              <div className="p-2.5 bg-red-950/60 border border-red-500/40 rounded-lg text-xs space-y-1">
                <div className="font-bold text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> 3D Spatial Encroachment Flagged!
                </div>
                <div className="text-slate-300 text-[11px]">
                  Subsurface parking basement encroaches within 2.0m of the active Metro safety envelope.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Modal */}
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
