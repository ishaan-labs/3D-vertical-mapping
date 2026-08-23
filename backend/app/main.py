from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from app.core.ulpin_generator import VolumetricParcelInput, calculate_3d_ulpin, ULPIN3DResult
from app.core.collision_engine import SpatialObject3D, check_3d_spatial_conflict
from app.core.ai_cadastre_extractor import extract_3d_cadastre_from_text, ExtractedCadastreData

app = FastAPI(
    title="3D-BhuAadhar Spatial Cadastral Engine",
    description="ISO 19152 (LADM II) 3D-ULPIN Generation, Gemini AI Deed Parser & Volumetric Conflict Engine",
    version="1.1.0"
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
        "service": "3D-BhuAadhar Engine",
        "standard": "ISO 19152 (LADM II 3D Cadastre)",
        "ai_engine": "Gemini 2.5 Flash Multimodal Parser",
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
        
        # Build 3D bounding coordinates from the extracted spatial bounds
        coords_3d = [(lon, lat, cadastre_data.z_min_meters) for lon, lat in cadastre_data.bounding_coordinates]
        
        # Calculate standard 3D-ULPIN
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
