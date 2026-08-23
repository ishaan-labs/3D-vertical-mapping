"use client";

import React, { useState } from "react";
import CadastreViewer3D, { UtilityItem } from "@/components/CadastreViewer3D";
import { 
  Layers, AlertTriangle, FileText, CheckCircle2, 
  Droplet, Flame, Waves, Radio, Train, Sparkles, Send, X, Loader2 
} from "lucide-react";

export default function Home() {
  const [selectedItem, setSelectedItem] = useState<UtilityItem>({
    id: "TUNNEL-METRO-L3",
    name: "Metro Transit Corridor Phase 2",
    category: "TRANSIT",
    depth: "-7.0m to -12.0m (MSL)",
    status: "ACTIVE",
    ulpin: "IND80219481920-U070120-M9",
    details: "Reinforced concrete underground transit box with 5.0m vertical clearance and automated vibration dampening buffers."
  });

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

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handleRunAudit = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/spatial/check-conflict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          object_a: {
            id: "PARCEL-BASEMENT-01",
            name: "Basement Level 2 Parking",
            strata_type: "U",
            z_min: -8.0,
            z_max: -2.0,
            coordinates_2d: [[80.2190, 13.0480], [80.2200, 13.0480], [80.2200, 13.0490], [80.2190, 13.0490]]
          },
          object_b: {
            id: "METRO-LINE-CORRIDOR-4",
            name: "Underground Metro Corridor Phase 2",
            strata_type: "U",
            z_min: -6.0,
            z_max: -3.0,
            coordinates_2d: [[80.2185, 13.0485], [80.2205, 13.0485]]
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
        setSelectedItem({
          id: "AI-NEW-PARCEL",
          name: data.ai_extracted_data.property_name,
          category: "BUILDING",
          depth: `+${data.ai_extracted_data.z_min_meters}m to +${data.ai_extracted_data.z_max_meters}m`,
          status: "ACTIVE",
          ulpin: data.generated_3d_ulpin.ulpin_3d,
          details: `AI-Ingested Parcel: Carpet Area ${data.ai_extracted_data.estimated_carpet_area_sqm} sqm. Strata Type: ${data.ai_extracted_data.strata_type}`
        });
      }
    } catch (e) {
      alert("AI Ingestion service error.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <main className="h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wide">3D-BhuAadhar | Urban Cadastre & Subsurface Twin</h1>
            <p className="text-[11px] text-slate-400">ISO 19152 (LADM II) 3D Volumetric Rights & Gemini Multimodal Cadastre Engine</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg transition"
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Deed Ingestion
          </button>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Spatial Engine Active
          </span>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 min-h-0 overflow-hidden">
        {/* Left 3 Columns: 3D Scene */}
        <div className="lg:col-span-3 relative h-full bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
          <CadastreViewer3D onSelectItem={setSelectedItem} activeLayers={activeLayers} isCutaway={true} />
          
          {/* Subsurface Layer Toggles */}
          <div className="absolute top-4 left-4 bg-slate-900/95 backdrop-blur border border-slate-700 p-3.5 rounded-xl shadow-xl flex flex-col space-y-2.5 z-10 w-64">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
              Subsurface Infrastructure
            </div>
            
            <div className="space-y-1.5 text-xs">
              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 cursor-pointer">
                <span className="flex items-center gap-2 text-pink-400"><Radio className="w-3.5 h-3.5" /> Telecom Conduit</span>
                <input type="checkbox" checked={activeLayers.TELECOM} onChange={() => toggleLayer("TELECOM")} className="w-4 h-4 accent-pink-500" />
              </label>
              
              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 cursor-pointer">
                <span className="flex items-center gap-2 text-lime-400"><Droplet className="w-3.5 h-3.5" /> Water Network</span>
                <input type="checkbox" checked={activeLayers.WATER} onChange={() => toggleLayer("WATER")} className="w-4 h-4 accent-lime-500" />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 cursor-pointer">
                <span className="flex items-center gap-2 text-amber-400"><Flame className="w-3.5 h-3.5" /> Natural Gas Mains</span>
                <input type="checkbox" checked={activeLayers.GAS} onChange={() => toggleLayer("GAS")} className="w-4 h-4 accent-amber-500" />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 cursor-pointer">
                <span className="flex items-center gap-2 text-sky-400"><Waves className="w-3.5 h-3.5" /> Storm Drainage</span>
                <input type="checkbox" checked={activeLayers.SEWER} onChange={() => toggleLayer("SEWER")} className="w-4 h-4 accent-sky-500" />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 cursor-pointer">
                <span className="flex items-center gap-2 text-purple-400"><Train className="w-3.5 h-3.5" /> Metro Rail Tunnel</span>
                <input type="checkbox" checked={activeLayers.TRANSIT} onChange={() => toggleLayer("TRANSIT")} className="w-4 h-4 accent-purple-500" />
              </label>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Inspector */}
        <div className="flex flex-col space-y-3 h-full overflow-y-auto pr-1">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" /> Volumetric Asset Inspector
            </h2>
            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] text-slate-400">Demarcation Title</label>
                <div className="text-sm font-bold text-white">{selectedItem.name}</div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Registered 3D-ULPIN</label>
                <div className="font-mono text-xs text-emerald-400 bg-slate-950 p-2 rounded border border-slate-800 break-all">
                  {selectedItem.ulpin}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400">Strata Category</label>
                  <div className="font-semibold text-slate-200">{selectedItem.category}</div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Vertical Envelope</label>
                  <div className="font-semibold text-sky-400">{selectedItem.depth}</div>
                </div>
              </div>
              <div className="pt-1">
                <label className="text-[10px] text-slate-400">Spatial Specification</label>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2 rounded border border-slate-800/80">
                  {selectedItem.details}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex-1 flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> 3D Spatial Collision Auditor
              </h2>
              <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                Execute automated 3D spatial buffer queries between private foundations and underground corridors.
              </p>
              
              <button
                onClick={handleRunAudit}
                className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg transition cursor-pointer"
              >
                Execute 3D Spatial Query
              </button>

              {conflictResult && (
                <div className="mt-3 p-2.5 bg-red-950/60 border border-red-500/40 rounded-lg text-xs space-y-1">
                  <div className="font-bold text-red-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> 3D Spatial Breach Detected!
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    Basement Level 2 intersects Metro safety buffer zone.
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    <strong>Severity:</strong> <span className="text-red-400 font-bold">{conflictResult.severity}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
              Compliant with ISO 19152 (LADM II) 3D Cadastral standard.
            </div>
          </div>
        </div>
      </div>

      {/* AI Deed Ingestion Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl p-6 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-base">
                <Sparkles className="w-5 h-5" /> Gemini AI Cadastral Deed Ingestor
              </div>
              <button onClick={() => setIsAiModalOpen(false)} className="text-slate-400 hover:text-white">
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
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAiIngest}
                disabled={isAiLoading}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
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
EOFcd ~/projects/3d-bhuaadhar-sih2026/frontend

cat << 'EOF' > src/app/page.tsx
"use client";

import React, { useState } from "react";
import CadastreViewer3D, { UtilityItem } from "@/components/CadastreViewer3D";
import { 
  Layers, AlertTriangle, FileText, CheckCircle2, 
  Droplet, Flame, Waves, Radio, Train, Sparkles, Send, X, Loader2 
} from "lucide-react";

export default function Home() {
  const [selectedItem, setSelectedItem] = useState<UtilityItem>({
    id: "TUNNEL-METRO-L3",
    name: "Metro Transit Corridor Phase 2",
    category: "TRANSIT",
    depth: "-7.0m to -12.0m (MSL)",
    status: "ACTIVE",
    ulpin: "IND80219481920-U070120-M9",
    details: "Reinforced concrete underground transit box with 5.0m vertical clearance and automated vibration dampening buffers."
  });

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

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handleRunAudit = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/spatial/check-conflict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          object_a: {
            id: "PARCEL-BASEMENT-01",
            name: "Basement Level 2 Parking",
            strata_type: "U",
            z_min: -8.0,
            z_max: -2.0,
            coordinates_2d: [[80.2190, 13.0480], [80.2200, 13.0480], [80.2200, 13.0490], [80.2190, 13.0490]]
          },
          object_b: {
            id: "METRO-LINE-CORRIDOR-4",
            name: "Underground Metro Corridor Phase 2",
            strata_type: "U",
            z_min: -6.0,
            z_max: -3.0,
            coordinates_2d: [[80.2185, 13.0485], [80.2205, 13.0485]]
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
        setSelectedItem({
          id: "AI-NEW-PARCEL",
          name: data.ai_extracted_data.property_name,
          category: "BUILDING",
          depth: `+${data.ai_extracted_data.z_min_meters}m to +${data.ai_extracted_data.z_max_meters}m`,
          status: "ACTIVE",
          ulpin: data.generated_3d_ulpin.ulpin_3d,
          details: `AI-Ingested Parcel: Carpet Area ${data.ai_extracted_data.estimated_carpet_area_sqm} sqm. Strata Type: ${data.ai_extracted_data.strata_type}`
        });
      }
    } catch (e) {
      alert("AI Ingestion service error.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <main className="h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wide">3D-BhuAadhar | Urban Cadastre & Subsurface Twin</h1>
            <p className="text-[11px] text-slate-400">ISO 19152 (LADM II) 3D Volumetric Rights & Gemini Multimodal Cadastre Engine</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg transition"
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Deed Ingestion
          </button>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Spatial Engine Active
          </span>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 p-4 min-h-0 overflow-hidden">
        {/* Left 3 Columns: 3D Scene */}
        <div className="lg:col-span-3 relative h-full bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
          <CadastreViewer3D onSelectItem={setSelectedItem} activeLayers={activeLayers} isCutaway={true} />
          
          {/* Subsurface Layer Toggles */}
          <div className="absolute top-4 left-4 bg-slate-900/95 backdrop-blur border border-slate-700 p-3.5 rounded-xl shadow-xl flex flex-col space-y-2.5 z-10 w-64">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
              Subsurface Infrastructure
            </div>
            
            <div className="space-y-1.5 text-xs">
              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 cursor-pointer">
                <span className="flex items-center gap-2 text-pink-400"><Radio className="w-3.5 h-3.5" /> Telecom Conduit</span>
                <input type="checkbox" checked={activeLayers.TELECOM} onChange={() => toggleLayer("TELECOM")} className="w-4 h-4 accent-pink-500" />
              </label>
              
              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 cursor-pointer">
                <span className="flex items-center gap-2 text-lime-400"><Droplet className="w-3.5 h-3.5" /> Water Network</span>
                <input type="checkbox" checked={activeLayers.WATER} onChange={() => toggleLayer("WATER")} className="w-4 h-4 accent-lime-500" />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 cursor-pointer">
                <span className="flex items-center gap-2 text-amber-400"><Flame className="w-3.5 h-3.5" /> Natural Gas Mains</span>
                <input type="checkbox" checked={activeLayers.GAS} onChange={() => toggleLayer("GAS")} className="w-4 h-4 accent-amber-500" />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 cursor-pointer">
                <span className="flex items-center gap-2 text-sky-400"><Waves className="w-3.5 h-3.5" /> Storm Drainage</span>
                <input type="checkbox" checked={activeLayers.SEWER} onChange={() => toggleLayer("SEWER")} className="w-4 h-4 accent-sky-500" />
              </label>

              <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-800 cursor-pointer">
                <span className="flex items-center gap-2 text-purple-400"><Train className="w-3.5 h-3.5" /> Metro Rail Tunnel</span>
                <input type="checkbox" checked={activeLayers.TRANSIT} onChange={() => toggleLayer("TRANSIT")} className="w-4 h-4 accent-purple-500" />
              </label>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Inspector */}
        <div className="flex flex-col space-y-3 h-full overflow-y-auto pr-1">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" /> Volumetric Asset Inspector
            </h2>
            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] text-slate-400">Demarcation Title</label>
                <div className="text-sm font-bold text-white">{selectedItem.name}</div>
              </div>
              <div>
                <label className="text-[10px] text-slate-400">Registered 3D-ULPIN</label>
                <div className="font-mono text-xs text-emerald-400 bg-slate-950 p-2 rounded border border-slate-800 break-all">
                  {selectedItem.ulpin}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400">Strata Category</label>
                  <div className="font-semibold text-slate-200">{selectedItem.category}</div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Vertical Envelope</label>
                  <div className="font-semibold text-sky-400">{selectedItem.depth}</div>
                </div>
              </div>
              <div className="pt-1">
                <label className="text-[10px] text-slate-400">Spatial Specification</label>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2 rounded border border-slate-800/80">
                  {selectedItem.details}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex-1 flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> 3D Spatial Collision Auditor
              </h2>
              <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                Execute automated 3D spatial buffer queries between private foundations and underground corridors.
              </p>
              
              <button
                onClick={handleRunAudit}
                className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg transition cursor-pointer"
              >
                Execute 3D Spatial Query
              </button>

              {conflictResult && (
                <div className="mt-3 p-2.5 bg-red-950/60 border border-red-500/40 rounded-lg text-xs space-y-1">
                  <div className="font-bold text-red-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> 3D Spatial Breach Detected!
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    Basement Level 2 intersects Metro safety buffer zone.
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    <strong>Severity:</strong> <span className="text-red-400 font-bold">{conflictResult.severity}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
              Compliant with ISO 19152 (LADM II) 3D Cadastral standard.
            </div>
          </div>
        </div>
      </div>

      {/* AI Deed Ingestion Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl p-6 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-base">
                <Sparkles className="w-5 h-5" /> Gemini AI Cadastral Deed Ingestor
              </div>
              <button onClick={() => setIsAiModalOpen(false)} className="text-slate-400 hover:text-white">
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
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAiIngest}
                disabled={isAiLoading}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
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
