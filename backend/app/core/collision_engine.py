from typing import List, Dict, Any
from shapely.geometry import Polygon, LineString, box
from pydantic import BaseModel

class SpatialObject3D(BaseModel):
    id: str
    name: str
    strata_type: str  # "V" (Vertical), "U" (Underground), "S" (Surface), "A" (Air)
    z_min: float
    z_max: float
    coordinates_2d: List[List[float]]  # [[lon, lat], [lon, lat], ...]

def check_3d_spatial_conflict(obj_a: SpatialObject3D, obj_b: SpatialObject3D, buffer_meters: float = 0.0) -> Dict[str, Any]:
    """
    Performs 3D spatial intersection & proximity checks between two volumetric entities.
    """
    # 1. Check Vertical (Z-axis) Overlap
    z_overlap = not (obj_a.z_max < obj_b.z_min or obj_a.z_min > obj_b.z_max)

    # 2. Check Horizontal (X-Y) Geometric Intersection
    poly_a = Polygon(obj_a.coordinates_2d)
    
    # Check if object B is a line (utility pipe / metro line) or polygon (parcel)
    if len(obj_b.coordinates_2d) == 2:
        geom_b = LineString(obj_b.coordinates_2d)
    else:
        geom_b = Polygon(obj_b.coordinates_2d)

    if buffer_meters > 0:
        # Buffer converted to approximate degrees (~111.32 km per degree)
        buffer_deg = buffer_meters / 111320.0
        geom_b = geom_b.buffer(buffer_deg)

    xy_intersects = poly_a.intersects(geom_b)

    # 3. 3D Conflict exists only if BOTH horizontal and vertical bounds collide
    has_3d_conflict = z_overlap and xy_intersects

    return {
        "conflict_detected": has_3d_conflict,
        "z_overlap": z_overlap,
        "xy_overlap": xy_intersects,
        "object_a_id": obj_a.id,
        "object_b_id": obj_b.id,
        "severity": "CRITICAL" if has_3d_conflict else "CLEAR"
    }

if __name__ == "__main__":
    # Test Case 1: Deep Private Basement Parking (Z: -8m to -2m)
    basement_parking = SpatialObject3D(
        id="PARCEL-BASEMENT-01",
        name="Basement Level 2 Parking",
        strata_type="U",
        z_min=-8.0,
        z_max=-2.0,
        coordinates_2d=[[80.2190, 13.0480], [80.2200, 13.0480], [80.2200, 13.0490], [80.2190, 13.0490]]
    )

    # Test Case 2: Underground Metro Tunnel running at (Z: -6m to -3m) with 3-meter safety envelope
    metro_tunnel = SpatialObject3D(
        id="METRO-LINE-CORRIDOR-4",
        name="Underground Metro Corridor Phase 2",
        strata_type="U",
        z_min=-6.0,
        z_max=-3.0,
        coordinates_2d=[[80.2185, 13.0485], [80.2205, 13.0485]]
    )

    conflict = check_3d_spatial_conflict(basement_parking, metro_tunnel, buffer_meters=2.0)
    print("3D Spatial Conflict Test Result:")
    print(conflict)
