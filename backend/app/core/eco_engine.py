from pydantic import BaseModel
from typing import List, Dict, Any

class EcoParcelInput(BaseModel):
    parcel_id: str
    plot_area_sqm: float
    builtup_footprint_sqm: float
    green_cover_sqm: float
    tree_count: int
    rooftop_solar_green_sqm: float

def compute_eco_cadastre(data: EcoParcelInput) -> Dict[str, Any]:
    # Biotope Area Ratio (BAR)
    permeable_ratio = (data.green_cover_sqm + (0.5 * data.rooftop_solar_green_sqm)) / data.plot_area_sqm
    min_mandatory_bar = 0.20  # 20% mandatory green ratio under MoEFCC norms
    
    is_eco_compliant = permeable_ratio >= min_mandatory_bar
    
    # Approx 22 kg CO2 sequestered per mature urban tree per year
    annual_co2_sequestered_kg = data.tree_count * 22.5
    oxygen_generation_kg_yr = annual_co2_sequestered_kg * 1.08
    
    # ESG Green Score out of 100
    eco_score = min(100, int((permeable_ratio / min_mandatory_bar) * 60 + (data.tree_count * 5)))

    return {
        "parcel_id": data.parcel_id,
        "eco_status": "ESG_CARBON_POSITIVE" if is_eco_compliant else "URBAN_HEAT_RISK",
        "biotope_area_ratio": round(permeable_ratio, 3),
        "mandatory_ratio_target": min_mandatory_bar,
        "eco_score_index": eco_score,
        "carbon_metrics": {
            "annual_co2_absorbed_kg": round(annual_co2_sequestered_kg, 1),
            "annual_oxygen_generated_kg": round(oxygen_generation_kg_yr, 1),
            "tree_canopy_count": data.tree_count
        },
        "root_protection_zone": "Active 3.0m radial subsurface root easement enforced against utility excavation."
    }
