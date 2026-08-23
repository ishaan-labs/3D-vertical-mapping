"use client";

import React, { useState } from "react";
import CadastreViewer3D, { SAMPLE_UNITS, UnitData } from "@/components/CadastreViewer3D";
import { Layers, Eye, ShieldCheck, AlertTriangle, FileText, CheckCircle2 } from "lucide-react";

export default function Home() {
  const [selectedUnit, setSelectedUnit] = useState<UnitData>(SAMPLE_UNITS[3]);
  const [isXRay, setIsXRay] = useState(true);
  const [explodedOffset, setExplodedOffset] = useState(0.8);
  const [conflictResult, setConflictResult] = useState<any>(null);

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
      alert("Ensure FastAPI backend is running on http://localhost:8000");
    }
  };

  return (
    <main className="h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-wide">3D-BhuAadhar Engine</h1>
            <p className="text-[11px] text-slate-400">ISO 19152 (LADM II) 3D Cadastral Registry & ULPIN Generator</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Backend Online (Port 8000)
          </span>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-5 p-5 min-h-0 overflow-hidden">
        {/* Left 2 Cols: 3D Viewport */}
        <div className="lg:col-span-2 relative h-full bg-slate-900 rounded-xl border border-slate-800 p-2 overflow-hidden shadow-2xl flex flex-col">
          <CadastreViewer3D onSelectUnit={setSelectedUnit} isXRay={isXRay} explodedOffset={explodedOffset} />
          
          {/* Overlay Controls */}
          <div className="absolute top-5 left-5 bg-slate-900/90 backdrop-blur border border-slate-700 p-3.5 rounded-xl shadow-xl flex flex-col space-y-3 w-60 z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300 flex items-center gap-2">
                <Eye className="w-4 h-4 text-sky-400" /> Subsurface X-Ray
              </span>
              <input
                type="checkbox"
                checked={isXRay}
                onChange={(e) => setIsXRay(e.target.checked)}
                className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
              />
            </div>
            <div className="flex flex-col space-y-1">
              <div className="flex justify-between text-xs text-slate-300 font-medium">
                <span>Floor Slicer (Explode)</span>
                <span className="text-sky-400">{explodedOffset.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={explodedOffset}
                onChange={(e) => setExplodedOffset(parseFloat(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right 1 Col: Cadastral Inspector & Collision Audit */}
        <div className="flex flex-col space-y-4 h-full overflow-y-auto pr-1">
          {/* Unit Details Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" /> 3D Cadastral Deed Inspector
            </h2>
            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] text-slate-400">Unit Name</label>
                <div className="text-sm font-bold text-white">{selectedUnit.name}</div>
              </div>
              <div>
                <label className="text-[11px] text-slate-400">Registered 3D-ULPIN</label>
                <div className="font-mono text-xs text-emerald-400 bg-slate-950 p-2 rounded border border-slate-800 break-all">
                  {selectedUnit.ulpin}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] text-slate-400">Vertical Strata</label>
                  <div className="font-semibold text-slate-200">{selectedUnit.strata}</div>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">Owner / Lessee</label>
                  <div className="font-semibold text-slate-200">{selectedUnit.owner}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <label className="text-[11px] text-slate-400">Elevation Bounds</label>
                  <div className="font-semibold text-sky-400">{selectedUnit.zMin}m to {selectedUnit.zMax}m</div>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400">Clear Title Status</label>
                  <div className="font-semibold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conflict Audit Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex-1 flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Subsurface Collision Audit
              </h2>
              <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                Execute 3D spatial intersection queries against underground utility corridors and metro buffers.
              </p>
              
              <button
                onClick={handleRunAudit}
                className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg transition cursor-pointer"
              >
                Execute 3D Spatial Intersect Query
              </button>

              {conflictResult && (
                <div className="mt-3 p-2.5 bg-red-950/60 border border-red-500/40 rounded-lg text-xs space-y-1">
                  <div className="font-bold text-red-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> 3D Spatial Conflict Detected!
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    Basement Parking collides with Metro Safety Buffer.
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
    </main>
  );
}
