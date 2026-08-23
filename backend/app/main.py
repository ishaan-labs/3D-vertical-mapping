from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from app.core.ulpin_generator import VolumetricParcelInput, calculate_3d_ulpin, ULPIN3DResult
from app.core.collision_engine import SpatialObject3D, check_3d_spatial_conflict
from app.core.ai_cadastre_extractor import extract_3d_cadastre_from_text
from app.core.audit_engine import (
    BuildingAuditInput, UDSAuditInput, AirspaceCorridorInput,
    audit_far_and_ghost_floors, audit_uds_conservation, audit_airspace_corridor
)

app = FastAPI(
    title="3D-BhuAadhar Regulatory & Strata Cadastral Engine",
    description="ISO 19152 (LADM II) 3D-ULPIN, Volumetric FAR/FSI Auditor, UDS Multi-Mortgage Detector & Air Rights Engine",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConflictCheckRequest(BaseModel):
    object_a: SpatialObject3D
    object_b: SpatialObject3D
    safety_buffer_meters: float = 0.0

class DeedIngestRequest(BaseModel):
    raw_deed_text: str

@app.get("/")
def health_check():
    return {
        "service": "3D-BhuAadhar Engine V2",
        "standard": "ISO 19152 (LADM II 3D Cadastre)",
        "modules": [
            "FAR & Ghost Floor Auditor",
            "UDS Multi-Mortgage Fraud Detector",
            "Air Rights & Drone Sky Corridor",
            "Subsurface Spatial Intersection"
        ],
        "status": "operational"
    }

@app.post("/api/v1/ulpin3d/generate", response_model=ULPIN3DResult)
def api_generate_ulpin(parcel: VolumetricParcelInput):
    try:
        return calculate_3d_ulpin(parcel)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/spatial/check-conflict")
def api_check_conflict(req: ConflictCheckRequest):
    try:
        return check_3d_spatial_conflict(req.object_a, req.object_b, req.safety_buffer_meters)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/cadastre/ai-ingest")
def api_ai_ingest_deed(req: DeedIngestRequest):
    try:
        cadastre_data = extract_3d_cadastre_from_text(req.raw_deed_text)
        coords_3d = [(lon, lat, cadastre_data.z_min_meters) for lon, lat in cadastre_data.bounding_coordinates]
        parcel_input = VolumetricParcelInput(
            parcel_name=cadastre_data.property_name,
            strata_type=cadastre_data.strata_type,
            base_2d_ulpin=cadastre_data.base_2d_ulpin,
            coordinates_3d=coords_3d
        )
        ulpin_result = calculate_3d_ulpin(parcel_input)
        return {
            "success": True,
            "ai_extracted_data": cadastre_data,
            "generated_3d_ulpin": ulpin_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/audit/far-violation")
def api_audit_far(req: BuildingAuditInput):
    try:
        return audit_far_and_ghost_floors(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/audit/uds-conservation")
def api_audit_uds(req: UDSAuditInput):
    try:
        return audit_uds_conservation(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/v1/audit/airspace-corridor")
def api_audit_airspace(req: AirspaceCorridorInput):
    try:
        return audit_airspace_corridor(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

from app.core.eco_engine import EcoParcelInput, compute_eco_cadastre

@app.post("/api/v1/audit/eco-cadastre")
def api_audit_eco(req: EcoParcelInput):
    try:
        return compute_eco_cadastre(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

from app.core.tree_registry import TreeCadastreRecord, compute_tree_deed_and_easement

@app.post("/api/v1/audit/tree-deed")
def api_tree_deed(req: TreeCadastreRecord):
    try:
        return compute_tree_deed_and_easement(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

from app.core.tree_registry import CompensatoryAfforestationInput, process_compensatory_proof

@app.post("/api/v1/audit/compensatory-afforestation")
def api_compensatory_afforestation(req: CompensatoryAfforestationInput):
    try:
        return process_compensatory_proof(req)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
