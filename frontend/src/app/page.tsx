"use client";

import React, { useState } from "react";
import CadastreViewer3D from "@/components/CadastreViewer3D";
import { Layers, Eye, ShieldCheck, AlertTriangle, FileText, CheckCircle2 } from "lucide-react";

export default function Home() {
  const [selectedUnit, setSelectedUnit] = useState<any>({
    id: "F2",
    name: "Residential Flat 201",
    strata: "Vertical Real Estate (V)",
    zMin: 4.0,
    zMax: 7.0,
    owner: "Ishaan Srivastava",
    ulpin: "IND80219481920-V028046-C2",
    color: 0x10b981
  });

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
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide">3D-BhuAadhar Engine</h1>
            <p className="text-xs text-slate-400">ISO 19152 (LADM II) 3D Cadastral Registry & ULPIN Generator</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Backend Online (Port 8000)
          </span>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Left 2 Cols: 3D Viewport & Scene Controls */}
        <div className="lg:col-span-2 flex flex-col space-y-4">
          <div className="relative flex-1 min-h-[550px] bg-slate-900 rounded-xl border border-slate-800 p-2">
            <CadastreViewer3D onSelectUnit={setSelectedUnit} isXRay={isXRay} explodedOffset={explodedOffset} />
            
            {/* Overlay Viewport Controls */}
            <div className="absolute top-6 left-6 bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-xl shadow-xl flex flex-col space-y-3 w-64">
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
        </div>

        {/* Right 1 Col: Cadastral Inspector & Automated Audit */}
        <div className="flex flex-col space-y-4">
          {/* Selected Unit Metadata Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" /> 3D Cadastral Deed Inspector
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400">Unit Name</label>
                <div className="text-base font-bold text-white">{selectedUnit.name}</div>
              </div>
              <div>
                <label className="text-xs text-slate-400">Registered 3D-ULPIN</label>
                <div className="font-mono text-xs text-emerald-400 bg-slate-950 p-2 rounded border border-slate-800 break-all">
                  {selectedUnit.ulpin}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400">Vertical Strata</label>
                  <div className="text-xs font-semibold text-slate-200">{selectedUnit.strata}</div>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Owner / Lessee</label>
                  <div className="text-xs font-semibold text-slate-200">{selectedUnit.owner}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-xs text-slate-400">Elevation Bounds</label>
                  <div className="text-xs font-semibold text-sky-400">{selectedUnit.zMin}m to {selectedUnit.zMax}m</div>
                </div>
                <div>
                  <label className="text-xs text-slate-400">Clear Title Status</label>
                  <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3D Spatial Encroachment Engine Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex-1 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Subsurface Collision Audit
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Run automated 3D spatial intersection queries against underground utility corridors and metro buffers.
              </p>
              
              <button
                onClick={handleRunAudit}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg transition"
              >
                Execute 3D Spatial Intersect Query
              </button>

              {conflictResult && (
                <div className="mt-4 p-3 bg-red-950/60 border border-red-500/40 rounded-lg text-xs space-y-1.5">
                  <div className="font-bold text-red-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> 3D Spatial Conflict Detected!
                  </div>
                  <div className="text-slate-300">
                    <strong>Encroachment:</strong> Basement Parking collides with Metro Safety Buffer.
                  </div>
                  <div className="text-slate-400">
                    <strong>Severity:</strong> <span className="text-red-400 font-bold">{conflictResult.severity}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-800">
              Compliant with ISO 19152 (LADM II) 3D Cadastral standard.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
