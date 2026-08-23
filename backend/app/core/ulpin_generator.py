import hashlib
import math
from typing import List, Tuple
from pydantic import BaseModel, Field

class VolumetricParcelInput(BaseModel):
    parcel_name: str
    strata_type: str = Field(..., description="One of S (Surface), V (Vertical/Flat), U (Underground), A (Air-rights)")
    base_2d_ulpin: str = Field(..., description="Standard 14-digit Indian 2D ULPIN")
    coordinates_3d: List[Tuple[float, float, float]] = Field(..., description="List of (lon, lat, elevation_meters)")

class ULPIN3DResult(BaseModel):
    ulpin_3d: str
    strata_type: str
    z_min: float
    z_max: float
    volume_cbm: float
    centroid_3d: Tuple[float, float, float]

def calculate_3d_ulpin(data: VolumetricParcelInput) -> ULPIN3DResult:
    coords = data.coordinates_3d
    if not coords or len(coords) < 3:
        raise ValueError("At least 3 3D coordinates required to define a spatial boundary.")

    lons = [pt[0] for pt in coords]
    lats = [pt[1] for pt in coords]
    elevs = [pt[2] for pt in coords]

    z_min = min(elevs)
    z_max = max(elevs)
    
    centroid_lon = sum(lons) / len(lons)
    centroid_lat = sum(lats) / len(lats)
    centroid_z = sum(elevs) / len(elevs)

    # 2.5D prism volume approximation using shoelace formula
    area_2d = 0.5 * abs(sum(lons[i]*lats[(i+1)%len(lons)] - lons[(i+1)%len(lons)]*lats[i] for i in range(len(lons))))
    area_sqm = area_2d * 111320 * (111320 * math.cos(math.radians(centroid_lat)))
    height_delta = max(0.1, z_max - z_min)
    volume_cbm = round(area_sqm * height_delta, 2)

    # Elevation encoding in decimeters
    z_min_dm = max(-999, min(9999, int(round(z_min * 10))))
    z_max_dm = max(-999, min(9999, int(round(z_max * 10))))
    z_token = f"{abs(z_min_dm):03X}{abs(z_max_dm):03X}"

    # Geometry hash
    coord_string = ",".join(f"{round(x,5)},{round(y,5)},{round(z,1)}" for x, y, z in coords)
    geom_hash = hashlib.sha256(coord_string.encode()).hexdigest()[:2].upper()

    strata_code = data.strata_type.upper()[0]
    base_id = data.base_2d_ulpin[:14].ljust(14, "0")
    ulpin_3d = f"{base_id}-{strata_code}{z_token}-{geom_hash}"

    return ULPIN3DResult(
        ulpin_3d=ulpin_3d,
        strata_type=strata_code,
        z_min=round(z_min, 2),
        z_max=round(z_max, 2),
        volume_cbm=volume_cbm,
        centroid_3d=(round(centroid_lon, 6), round(centroid_lat, 6), round(centroid_z, 2))
    )

if __name__ == "__main__":
    sample_flat = VolumetricParcelInput(
        parcel_name="Flat 402, Ganga Heights",
        strata_type="V",
        base_2d_ulpin="IND802194819201",
        coordinates_3d=[
            (80.21948, 13.04819, 12.0),
            (80.21958, 13.04819, 12.0),
            (80.21958, 13.04829, 15.0),
            (80.21948, 13.04829, 15.0)
        ]
    )
    result = calculate_3d_ulpin(sample_flat)
    print("3D-ULPIN Output Token:", result.ulpin_3d)
    print("Details:", result.model_dump_json(indent=2))
