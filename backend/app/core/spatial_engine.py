from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import math
import datetime

# --- 1. UNIFIED 3D SPATIAL DATA MODEL ---

class BoundingVolume3D(BaseModel):
    x_min: float
    x_max: float
    y_min: float
    y_max: float
    z_min: float  # Depth in meters (negative = subterranean, positive = above ground)
    z_max: float

class SpatialCadastreObject(BaseModel):
    id: string = Field(..., alias="id")
    name: str
    category: str  # "BUILDING", "METRO", "WATER", "GAS", "TELECOM", "ECO_TREE", "ROAD", "FOUNDATION"
    status: str = "EXISTING"  # "EXISTING", "PROPOSED", "UNDER_CONSTRUCTION", "DECOMMISSIONED"
    bounds: BoundingVolume3D
    ulpin: str
    parcel_id: str
    owner_or_custodian: str
    attributes: Dict[str, Any] = {}

class ProposedAssetSimulationInput(BaseModel):
    project_name: str
    category: str
    status: str = "PROPOSED"
    bounds: BoundingVolume3D
    safety_buffer_radius_m: float = 2.0
    active_layers_to_check: List[str] = ["BUILDING", "METRO", "WATER", "GAS", "TELECOM", "ECO_TREE"]

# --- 2. REGISTERED BASELINE 3D DATASET ---

REGISTERED_SPATIAL_OBJECTS: List[SpatialCadastreObject] = [
    SpatialCadastreObject(
        id="BLD-01",
        name="Plot 42/A Commercial Complex",
        category="BUILDING",
        status="EXISTING",
        bounds=BoundingVolume3D(x_min=-17.5, x_max=-8.5, y_min=-9.0, y_max=-2.0, z_min=0.0, z_max=24.0),
        ulpin="IND338421049280-V000540-A1",
        parcel_id="TS-842/A",
        owner_or_custodian="Apex Commercial Estates Ltd",
        attributes={"sanctioned_floors": 6, "actual_floors": 8, "fsi_status": "EXCESS_FAR"}
    ),
    SpatialCadastreObject(
        id="BLD-02",
        name="DoLR State Cadastral Headquarters",
        category="BUILDING",
        status="EXISTING",
        bounds=BoundingVolume3D(x_min=-5.5, x_max=5.5, y_min=-9.0, y_max=-2.0, z_min=0.0, z_max=19.2),
        ulpin="IND338421049280-V000720-B2",
        parcel_id="TS-842/B",
        owner_or_custodian="Department of Land Resources",
        attributes={"sanctioned_floors": 8, "actual_floors": 8, "fsi_status": "COMPLIANT"}
    ),
    SpatialCadastreObject(
        id="MTR-01",
        name="CMRL Metro Corridor Phase 2",
        category="METRO",
        status="EXISTING",
        bounds=BoundingVolume3D(x_min=-22.0, x_max=22.0, y_min=2.2, y_max=7.8, z_min=-11.0, z_max=-8.5),
        ulpin="IND338421049280-U085110-M2",
        parcel_id="TN-CHN-MTR-002",
        owner_or_custodian="Chennai Metro Rail Ltd",
        attributes={"tunnel_diameter_m": 5.5, "structural_clearance_m": 15.0}
    ),
    SpatialCadastreObject(
        id="UTIL-WATER",
        name="Municipal 500mm Water Trunk",
        category="WATER",
        status="EXISTING",
        bounds=BoundingVolume3D(x_min=-22.0, x_max=22.0, y_min=0.0, y_max=5.0, z_min=-3.8, z_max=-3.4),
        ulpin="IND338421049280-U034038-W4",
        parcel_id="UTIL-WTR-01",
        owner_or_custodian="Chennai MetroWater Board",
        attributes={"pressure_bar": 4.5, "material": "Ductile Iron"}
    ),
    SpatialCadastreObject(
        id="UTIL-GAS",
        name="GAIL High-Pressure Gas Conduit",
        category="GAS",
        status="EXISTING",
        bounds=BoundingVolume3D(x_min=-22.0, x_max=22.0, y_min=-1.8, y_max=2.0, z_min=-5.6, z_max=-5.2),
        ulpin="IND338421049280-U052056-G9",
        parcel_id="UTIL-GAS-01",
        owner_or_custodian="GAIL (India) Limited",
        attributes={"pressure_bar": 19.0, "hazard_class": "HIGH_VOLATILITY"}
    ),
    SpatialCadastreObject(
        id="UTIL-TEL",
        name="BSNL Gigabit Optic Fiber Main",
        category="TELECOM",
        status="EXISTING",
        bounds=BoundingVolume3D(x_min=-22.0, x_max=22.0, y_min=-1.0, y_max=2.8, z_min=-2.2, z_max=-1.8),
        ulpin="IND338421049280-U018022-T1",
        parcel_id="UTIL-TEL-01",
        owner_or_custodian="Bharat Sanchar Nigam Ltd",
        attributes={"core_count": 288, "latency_tier": "CRITICAL"}
    ),
    SpatialCadastreObject(
        id="ECO-42",
        name="Heritage Neem Tree (Azadirachta indica)",
        category="ECO_TREE",
        status="EXISTING",
        bounds=BoundingVolume3D(x_min=-21.5, x_max=-16.5, y_min=-3.5, y_max=1.5, z_min=-2.8, z_max=7.7),
        ulpin="IND338421049280-ECO0042",
        parcel_id="ECO-CHN-0042",
        owner_or_custodian="Ward 114 Urban Forestry Council",
        attributes={"age_years": 45, "statutory_felling_penalty_inr": 720000, "root_radius_m": 3.5}
    )
]

# --- 3. MATHEMATICAL 3D SPATIAL KERNEL ---

def compute_box_distance_and_overlap(b1: BoundingVolume3D, b2: BoundingVolume3D) -> Dict[str, Any]:
    """Calculates true 3D separation, horizontal separation, vertical separation, and volumetric intersection."""
    dx = max(0.0, max(b1.x_min - b2.x_max, b2.x_min - b1.x_max))
    dy = max(0.0, max(b1.y_min - b2.y_max, b2.y_min - b1.y_max))
    dz = max(0.0, max(b1.z_min - b2.z_max, b2.z_min - b1.z_max))
    
    horizontal_dist = math.sqrt(dx*dx + dy*dy)
    total_3d_dist = math.sqrt(dx*dx + dy*dy + dz*dz)
    
    # Overlap volume computation
    ox = max(0.0, min(b1.x_max, b2.x_max) - max(b1.x_min, b2.x_min))
    oy = max(0.0, min(b1.y_max, b2.y_max) - max(b1.y_min, b2.y_min))
    oz = max(0.0, min(b1.z_max, b2.z_max) - max(b1.z_min, b2.z_min))
    overlap_vol = ox * oy * oz
    
    is_intersecting = (overlap_vol > 0.0)

    return {
        "is_intersecting": is_intersecting,
        "overlap_volume_m3": round(overlap_vol, 3),
        "total_3d_distance_m": round(total_3d_dist, 2),
        "horizontal_separation_m": round(horizontal_dist, 2),
        "vertical_separation_m": round(dz, 2)
    }

# --- 4. ADVANCED SPATIAL ANALYSIS IMPLEMENTATIONS ---

def execute_vertical_slice_profile(x_cut: float) -> Dict[str, Any]:
    """Intersects an infinite Y-Z slicing plane at X = x_cut against all registered 3D objects."""
    intersected_objects = []
    
    for obj in REGISTERED_SPATIAL_OBJECTS:
        if obj.bounds.x_min <= x_cut <= obj.bounds.x_max:
            intersected_objects.append({
                "id": obj.id,
                "name": obj.name,
                "category": obj.category,
                "status": obj.status,
                "z_range": f"{obj.bounds.z_min}m to {obj.bounds.z_max}m MSL",
                "y_range": f"{obj.bounds.y_min}m to {obj.bounds.y_max}m",
                "ulpin": obj.ulpin,
                "owner": obj.owner_or_custodian
            })
            
    intersected_objects.sort(key=lambda item: float(item["z_range"].split("m")[0]), reverse=True)
    
    return {
        "slice_plane": f"X = {x_cut:.1f}m Cross-Section",
        "timestamp": datetime.datetime.now().isoformat(),
        "total_intersected_assets": len(intersected_objects),
        "strata_stack": intersected_objects
    }

def execute_proximity_query(target_id: str, radius_m: float) -> Dict[str, Any]:
    """Returns all spatial assets within an exact 3D Euclidean radial envelope of the target object."""
    target = next((o for o in REGISTERED_SPATIAL_OBJECTS if o.id == target_id), None)
    if not target:
        return {"error": f"Object {target_id} not found."}

    nearby_assets = []
    for candidate in REGISTERED_SPATIAL_OBJECTS:
        if candidate.id == target.id:
            continue
        rel = compute_box_distance_and_overlap(target.bounds, candidate.bounds)
        if rel["total_3d_distance_m"] <= radius_m or rel["is_intersecting"]:
            nearby_assets.append({
                "id": candidate.id,
                "name": candidate.name,
                "category": candidate.category,
                "distance_3d_m": rel["total_3d_distance_m"],
                "vertical_separation_m": rel["vertical_separation_m"],
                "horizontal_separation_m": rel["horizontal_separation_m"],
                "is_intersecting": rel["is_intersecting"],
                "elevation_envelope": f"{candidate.bounds.z_min}m to {candidate.bounds.z_max}m"
            })

    nearby_assets.sort(key=lambda x: x["distance_3d_m"])
    return {
        "target_entity": target.name,
        "search_radius_3d_m": radius_m,
        "assets_within_radius_count": len(nearby_assets),
        "nearby_assets": nearby_assets
    }

def run_project_simulation_clash(proposed: ProposedAssetSimulationInput) -> Dict[str, Any]:
    """Performs full 3D clash and proximity hazard analysis for a proposed infrastructure or construction asset."""
    conflicts = []
    
    for existing in REGISTERED_SPATIAL_OBJECTS:
        if existing.category not in proposed.active_layers_to_check:
            continue
            
        rel = compute_box_distance_and_overlap(proposed.bounds, existing.bounds)
        
        # Conflict Criterion 1: Direct Physical 3D Intersection
        if rel["is_intersecting"]:
            conflicts.append({
                "conflicting_object": existing.name,
                "category": existing.category,
                "status": existing.status,
                "severity": "CRITICAL_COLLISION",
                "overlap_volume_m3": rel["overlap_volume_m3"],
                "horizontal_separation_m": 0.0,
                "vertical_separation_m": 0.0,
                "explanation": f"Proposed {proposed.project_name} directly penetrates {existing.name} by {rel['overlap_volume_m3']} m³. Immediate structural hazard."
            })
        # Conflict Criterion 2: Safety Exclusion Buffer Breach
        elif rel["total_3d_distance_m"] <= proposed.safety_buffer_radius_m:
            severity = "HIGH" if existing.category in ["GAS", "METRO"] else "MEDIUM"
            conflicts.append({
                "conflicting_object": existing.name,
                "category": existing.category,
                "status": existing.status,
                "severity": severity,
                "total_3d_distance_m": rel["total_3d_distance_m"],
                "horizontal_separation_m": rel["horizontal_separation_m"],
                "vertical_separation_m": rel["vertical_separation_m"],
                "explanation": f"Proposed excavation approaches within {rel['total_3d_distance_m']}m of {existing.name}. Breaches {proposed.safety_buffer_radius_m}m statutory buffer."
            })

    return {
        "simulation_id": f"SIM-{datetime.datetime.now().strftime('%Y%m%d-%H%M%S')}",
        "proposed_project": proposed.project_name,
        "proposed_bounds": proposed.bounds.dict(),
        "total_conflicts_detected": len(conflicts),
        "is_cleared_for_construction": (len(conflicts) == 0),
        "conflict_matrix": conflicts
    }
