"use client";

import React, { useState } from "react";
import CadastreViewer3D from "@/components/CadastreViewer3D";
import GeoCadastreMap, { STATE_WARDS, CadastralPlot } from "@/components/GeoCadastreMap";
import { 
  Building2, ShieldCheck, FileText, CheckCircle2, AlertTriangle, 
  Sparkles, Send, X, Loader2, Globe2, Layers, 
  IndianRupee, Scale, AlertOctagon, Activity, Radio, 
  Leaf, Trees, Wind, Download, Check, MapPin, Landmark, HeartHandshake, Shield,
  UploadCloud, ArrowRight, RefreshCw
} from "lucide-react";

export default function Home() {
  const [viewMode, setViewMode] = useState<"CROSS_SECTION" | "MAP">("CROSS_SECTION");
  const [activeTab, setActiveTab] = useState<"TREE_PERSONHOOD" | "DEEDS" | "FAR_AUDIT" | "UDS_FRAUD">("TREE_PERSONHOOD");
  const [activePlot, setActivePlot] = useState<CadastralPlot>(STATE_WARDS[0].plots[0]);
  
  const [highlightViolations, setHighlightViolations] = useState(true);
  const [showGreenEcosystem, setShowGreenEcosystem] = useState(true);

  // Tree Personhood State
  const [treeRecord, setTreeRecord] = useState<any>({
    tree_ulpin: "IND338421049280-ECO0042",
    legal_status: "HERITAGE_ECOLOGICAL_PERSONHOOD",
    custodian: "Ward 114 Urban Forestry Council",
    common_name: "Heritage Neem Tree",
    botanical_name: "Azadirachta indica",
    estimated_age_years: 45,
    volumetric_envelope: {
      canopy_z_bounds: "+0.5m to +7.7m MSL",
      subsurface_root_cylinder: "0.0m to -2.8m (Radius: 3.5m)"
    },
    ecological_dividends: {
      annual_co2_sequestered_kg: 84.4,
      annual_property_tax_rebate_inr: 717
    },
    statutory_protections: {
      illegal_felling_penalty_inr: 720000,
      excavation_easement: "Trenching strictly prohibited within root cylinder under Section 8 of Tree Preservation Act."
    }
  });

  // Compensatory Afforestation State
  const [applicantType, setApplicantType] = useState<"GOVERNMENT_INFRA" | "PRIVATE_DEVELOPER">("GOVERNMENT_INFRA");
  const [applicantName, setApplicantName] = useState("Chennai Metro Rail Corp (CMRL Phase 2)");
  const [afforestationProof, setAfforestationProof] = useState<any>(null);
  const [isProcessingProof, setIsProcessingProof] = useState(false);

  const [farResult, setFarResult] = useState<any>({
    fsi_deviation_pct: 33.3,
    unauthorized_ghost_floors: 2,
    unauthorized_builtup_sqm: 1200.0,
    financial_audit: {
      annual_uncollected_property_tax_inr: 4820000,
      compounded_structural_penalty_inr: 19280000
    }
  });

  const [udsResult, setUdsResult] = useState<any>({
    uds_allocation_percentage: 118.0,
    illegal_oversold_uds_sqft: 1800.0,
    risk_level: "HIGH_MORTGAGE_FRAUD_RISK"
  });

  const [activeLayers, setActiveLayers] = useState({
    TRANSIT: true,
    TELECOM: true,
    WATER: true,
    GAS: true,
    SEWER: true,
  });

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [deedText, setDeedText] = useState("Flat No 402 situated on the 4th Floor of Block B, with ceiling height of 3.0 meters above 4th floor slab level at elevation 12.0m to 15.0m, having carpet area of 128.5 sqm under base survey land parcel IND80219481920.");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);

  const handleVerifyAfforestation = async () => {
    setIsProcessingProof(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/audit/compensatory-afforestation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parent_tree_ulpin: treeRecord.tree_ulpin,
          applicant_name: applicantName,
          applicant_type: applicantType,
          felling_reason: "Metro Tunnel Underground Station Shaft Construction",
          escrow_amount_inr: treeRecord.statutory_protections?.illegal_felling_penalty_inr || 720000,
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
    <main className="h-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-hidden select-none">
      {/* Government Header */}
      <header className="border-b border-slate-200 bg-[#0f2942] text-white px-6 py-3 flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center space-x-3.5">
          <div className="p-2 bg-white/10 rounded-lg border border-white/20">
            <Landmark className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wide uppercase">
                3D-BhuAadhar | National 3D Cadastral & Botanical Personhood Portal
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-600 text-white font-mono">
                ISO 19152 LADM II
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Ministry of Rural Development & Department of Land Resources (DoLR) | Survey of India
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex bg-slate-900/60 border border-slate-700 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode("CROSS_SECTION")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
                viewMode === "CROSS_SECTION" ? "bg-white text-slate-900 shadow font-bold" : "text-slate-300 hover:text-white"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" /> 3D Strata Digital Twin
            </button>
            <button
              onClick={() => setViewMode("MAP")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer ${
                viewMode === "MAP" ? "bg-white text-slate-900 shadow font-bold" : "text-slate-300 hover:text-white"
              }`}
            >
              <Globe2 className="w-3.5 h-3.5 text-blue-600" /> Geographic WebGIS
            </button>
          </div>

          <button
            onClick={() => setIsAiModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" /> AI Deed Ingestor
          </button>
        </div>
      </header>

      {/* Official Metrics Bar */}
      <div className="grid grid-cols-4 gap-4 px-6 py-2 bg-white border-b border-slate-200 text-xs shrink-0 shadow-sm">
        <div className="flex items-center justify-between px-3 py-1 bg-slate-50 border border-slate-200 rounded-md">
          <span className="text-slate-500 font-medium">Registered 3D Parcels:</span>
          <span className="font-bold text-slate-800 font-mono">14,892 Units</span>
        </div>
        <div className="flex items-center justify-between px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-md">
          <span className="text-emerald-800 font-medium flex items-center gap-1">
            <Trees className="w-3.5 h-3.5 text-emerald-600" /> Botanical Personhoods:
          </span>
          <span className="font-bold text-emerald-800 font-mono">3,420 Protected</span>
        </div>
        <div className="flex items-center justify-between px-3 py-1 bg-teal-50 border border-teal-200 rounded-md">
          <span className="text-teal-800 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Afforestation Escrow Pool:
          </span>
          <span className="font-bold text-teal-800 font-mono">₹1.44 Cr Locked</span>
        </div>
        <div className="flex items-center justify-between px-3 py-1 bg-blue-50 border border-blue-200 rounded-md">
          <span className="text-blue-700 font-medium">FAR Penalty Recovery:</span>
          <span className="font-bold text-blue-800 font-mono">₹4.82 Cr / yr</span>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 min-h-0 overflow-hidden">
        {/* Left Viewport (7 Cols) */}
        <div className="lg:col-span-7 relative h-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
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

          {/* Viewport Bottom Controls */}
          {viewMode === "CROSS_SECTION" && (
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur border border-slate-300 p-2.5 rounded-lg shadow-md z-10 flex items-center gap-4 text-xs">
              <label className="flex items-center gap-2 text-emerald-700 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={showGreenEcosystem}
                  onChange={(e) => setShowGreenEcosystem(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
                Tree Canopy & Root Protection Zones
              </label>
              <label className="flex items-center gap-2 text-red-700 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={highlightViolations}
                  onChange={(e) => setHighlightViolations(e.target.checked)}
                  className="w-4 h-4 accent-red-600 rounded"
                />
                FAR Ghost Floors
              </label>
            </div>
          )}
        </div>

        {/* Right Audit & Strata Panel (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-3 h-full overflow-y-auto pr-1">
          {/* Navigation Tabs */}
          <div className="grid grid-cols-4 gap-1 bg-slate-200/80 p-1 rounded-lg border border-slate-300">
            <button
              onClick={() => setActiveTab("TREE_PERSONHOOD")}
              className={`py-1.5 text-xs font-bold rounded-md transition cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === "TREE_PERSONHOOD" ? "bg-white text-emerald-800 shadow" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Leaf className="w-3.5 h-3.5 text-emerald-600" /> Tree Deed
            </button>
            <button
              onClick={() => setActiveTab("DEEDS")}
              className={`py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
                activeTab === "DEEDS" ? "bg-white text-blue-900 shadow" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Strata Deeds
            </button>
            <button
              onClick={() => setActiveTab("FAR_AUDIT")}
              className={`py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
                activeTab === "FAR_AUDIT" ? "bg-white text-red-700 shadow" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              FAR Audit
            </button>
            <button
              onClick={() => setActiveTab("UDS_FRAUD")}
              className={`py-1.5 text-xs font-bold rounded-md transition cursor-pointer ${
                activeTab === "UDS_FRAUD" ? "bg-white text-amber-700 shadow" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              UDS Fraud
            </button>
          </div>

          {/* TAB 1: Tree Personhood & Compensatory Afforestation Escrow */}
          {activeTab === "TREE_PERSONHOOD" && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3.5 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
                      Legal Botanical Personhood Entity
                    </span>
                    <h2 className="text-sm font-bold text-slate-900 mt-1">{treeRecord.common_name}</h2>
                    <p className="text-xs text-slate-500 italic">{treeRecord.botanical_name} • {treeRecord.estimated_age_years} Years Old</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Mandatory Escrow</span>
                    <span className="text-base font-bold font-mono text-red-700">₹{treeRecord.statutory_protections?.illegal_felling_penalty_inr?.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block mb-1">Volumetric Tree 3D-ULPIN</span>
                  <div className="font-mono text-xs text-emerald-800 bg-emerald-50/60 p-2 rounded-lg border border-emerald-200 font-bold break-all select-all">
                    {treeRecord.tree_ulpin}
                  </div>
                </div>

                {/* Compensatory Afforestation Action Box */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <HeartHandshake className="w-4 h-4 text-emerald-600" /> Compensatory Afforestation Escrow (1:10 Ratio)
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">Statutory Mandatory</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Applicant Sector</label>
                      <select
                        value={applicantType}
                        onChange={(e: any) => setApplicantType(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-medium"
                      >
                        <option value="GOVERNMENT_INFRA">Government Infrastructure (PSU)</option>
                        <option value="PRIVATE_DEVELOPER">Private Real Estate Developer</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-1">Executing Authority</label>
                      <input
                        type="text"
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded p-1.5 text-xs font-medium"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleVerifyAfforestation}
                    disabled={isProcessingProof}
                    className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isProcessingProof ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                    Deposit Escrow & Verify 10-Sapling Geotagged Proof
                  </button>

                  {afforestationProof && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded text-xs space-y-1.5 animate-fadeIn">
                      <div className="font-bold text-emerald-900 flex items-center justify-between">
                        <span>{afforestationProof.compliance_status}</span>
                        <span className="text-[11px] font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-200">10 Child Tokens Minted</span>
                      </div>
                      <div className="text-[11px] text-slate-600">
                        <strong>Target Zone:</strong> {afforestationProof.afforestation_audit?.target_zone} (Verified SHA-256 Hash)
                      </div>
                      <div className="text-[10px] text-emerald-800 font-mono break-all">
                        Tokens: {afforestationProof.registered_child_tree_ulpins?.slice(0, 3).join(", ")}... +7 more
                      </div>
                      <div className="text-[11px] text-slate-700 pt-1 border-t border-emerald-200">
                        {afforestationProof.registry_action}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-200 flex items-center justify-between">
                <span>Article 48A Constitution of India</span>
                <span>CAMPA Compliant</span>
              </div>
            </div>
          )}

          {/* TAB 2: Strata Deeds Registry */}
          {activeTab === "DEEDS" && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">
                      Active Cadastral Parcel
                    </span>
                    <h2 className="text-sm font-bold text-slate-900 mt-1">{activePlot.plotNumber}</h2>
                    <p className="text-xs text-slate-500">{activePlot.wardName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Total Height</span>
                    <span className="text-base font-bold font-mono text-blue-900">+{activePlot.buildingHeight}m MSL</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block mb-1">Volumetric 3D-ULPIN (ISO 19152)</span>
                  <div className="font-mono text-xs text-blue-900 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-bold break-all select-all">
                    {activePlot.ulpin3D}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Vertical Strata Ownership Registry
                  </h3>
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {activePlot.strataBreakdown.map((s, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs flex flex-col space-y-1">
                        <div className="flex items-center justify-between font-semibold text-slate-800">
                          <span>{s.floor}</span>
                          <span className="text-blue-700 font-mono text-[11px]">{s.elevation}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span><strong>Owner:</strong> {s.owner}</span>
                          <span className="font-mono text-slate-400">{s.ulpin}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FAR Audit */}
          {activeTab === "FAR_AUDIT" && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h2 className="text-xs font-bold text-red-900 uppercase tracking-wide flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4 text-red-600" /> Volumetric FAR & Tax Evasion Audit
                  </h2>
                  <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    Bylaw Auditor
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Sanctioned Limit</span>
                    <span className="font-bold text-slate-800">2.5 FSI (18.0m / 6 Floors)</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Constructed Envelope</span>
                    <span className="font-bold text-red-700">24.0m (8 Floors / +2 Ghost)</span>
                  </div>
                </div>

                <button
                  onClick={handleRunFarAudit}
                  className="w-full py-2.5 bg-red-700 hover:bg-red-600 text-white font-bold text-xs rounded-lg shadow transition cursor-pointer"
                >
                  Execute Municipal FAR Penalty Assessment
                </button>

                {farResult && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-2 text-xs">
                    <div className="font-bold text-red-800 flex items-center justify-between">
                      <span>CRITICAL BYLAW VIOLATION</span>
                      <span className="font-mono">+{farResult.fsi_deviation_pct}% Excess FSI</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700">
                      <div><strong>Ghost Floors:</strong> {farResult.unauthorized_ghost_floors} Unauthorized</div>
                      <div><strong>Excess Built-up:</strong> {farResult.unauthorized_builtup_sqm} m²</div>
                    </div>
                    <div className="pt-2 border-t border-red-200">
                      <div className="text-[11px] text-slate-600">Uncollected Annual Municipal Property Tax:</div>
                      <div className="text-base font-bold font-mono text-red-700">
                        ₹{farResult.financial_audit?.annual_uncollected_property_tax_inr?.toLocaleString("en-IN")} / year
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: UDS Fraud */}
          {activeTab === "UDS_FRAUD" && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h2 className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-amber-600" /> UDS Conservation & Multi-Mortgage Check
                  </h2>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Fraud Prevention
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                  <span className="text-[10px] text-slate-500 block">Sanctioned Base Land Share</span>
                  <span className="font-bold text-slate-800">10,000 sq.ft Total Legal Plot Area</span>
                </div>

                <button
                  onClick={handleRunUdsAudit}
                  className="w-full py-2.5 bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs rounded-lg shadow transition cursor-pointer"
                >
                  Verify UDS Allocation Integrity
                </button>

                {udsResult && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-2 text-xs">
                    <div className="font-bold text-amber-900 flex items-center justify-between">
                      <span>UDS FRAUD DETECTED</span>
                      <span className="font-mono text-red-700 font-bold">{udsResult.uds_allocation_percentage}% Allocated</span>
                    </div>
                    <div className="text-[11px] text-slate-700">
                      <strong>Illegal Oversold Share:</strong> +{udsResult.illegal_oversold_uds_sqft} sq.ft beyond legal 100% boundary.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Deed Ingestion Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-2xl shadow-xl p-6 flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-sm uppercase">
                <Sparkles className="w-4 h-4 text-emerald-600" /> AI Deed Ingestor (Gemini LADM Parser)
              </div>
              <button onClick={() => setIsAiModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              rows={4}
              value={deedText}
              onChange={(e) => setDeedText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-700 font-mono"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleAiIngest}
                disabled={isAiLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-lg shadow transition cursor-pointer"
              >
                {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isAiLoading ? "Parsing 3D Geometry..." : "Ingest & Generate 3D-ULPIN"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
