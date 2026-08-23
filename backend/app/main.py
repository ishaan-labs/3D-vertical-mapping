from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from app.core.ulpin_generator import VolumetricParcelInput, calculate_3d_ulpin, ULPIN3DResult
from app.core.collision_engine import SpatialObject3D, check_3d_spatial_conflict

app = FastAPI(
    title="3D-BhuAadhar Spatial Cadastral Engine",
    description="ISO 19152 (LADM II) 3D-ULPIN Generation & Volumetric Conflict Resolution API",
    version="1.0.0"
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

@app.get("/")
def health_check():
    return {
        "service": "3D-BhuAadhar Engine",
        "standard": "ISO 19152 (LADM II 3D Cadastre)",
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
