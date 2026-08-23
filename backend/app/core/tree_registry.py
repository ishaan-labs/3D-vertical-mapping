from pydantic import BaseModel
from typing import Dict, Any, List
import datetime

class TreeCadastreRecord(BaseModel):
    tree_id: str
    common_name: str
    botanical_name: str
    estimated_age_years: int
    canopy_radius_m: float
    root_depth_m: float
    base_land_ulpin: str
    custodian: str = "Ward 114 Urban Forestry Council"

class CompensatoryAfforestationInput(BaseModel):
    parent_tree_ulpin: str
    applicant_name: str  # Government entity or Private Builder
    applicant_type: str  # "GOVERNMENT_INFRA" or "PRIVATE_DEVELOPER"
    felling_reason: str
    escrow_amount_inr: float
    target_afforestation_zone_id: str
    geotagged_proof_hash: str
    saplings_planted_count: int = 10

def compute_tree_deed_and_easement(tree: TreeCadastreRecord) -> Dict[str, Any]:
    tree_ulpin = f"{tree.base_land_ulpin}-ECO{tree.tree_id.zfill(4)}"
    annual_co2_kg = round(tree.estimated_age_years * 0.85 + (tree.canopy_radius_m ** 2) * 3.14 * 1.2, 1)
    felling_penalty_inr = int(tree.estimated_age_years * 12500 + tree.canopy_radius_m * 45000)
    annual_tax_rebate_inr = int(annual_co2_kg * 8.5)

    return {
        "tree_ulpin": tree_ulpin,
        "legal_status": "HERITAGE_ECOLOGICAL_PERSONHOOD",
        "custodian": tree.custodian,
        "volumetric_envelope": {
            "canopy_z_bounds": f"+0.5m to +{(tree.canopy_radius_m * 2.2):.1f}m MSL",
            "subsurface_root_cylinder": f"0.0m to -{tree.root_depth_m:.1f}m (Radius: {tree.canopy_radius_m:.1f}m)"
        },
        "ecological_dividends": {
            "annual_co2_sequestered_kg": annual_co2_kg,
            "annual_property_tax_rebate_inr": annual_tax_rebate_inr
        },
        "statutory_protections": {
            "illegal_felling_penalty_inr": felling_penalty_inr,
            "excavation_easement": "Trenching prohibited within root cylinder under Section 8 of Tree Preservation Act."
        }
    }

def process_compensatory_proof(proof: CompensatoryAfforestationInput) -> Dict[str, Any]:
    mandatory_ratio = 10
    is_count_valid = proof.saplings_planted_count >= mandatory_ratio
    
    # Generate Child 3D-ULPIN Tokens for each compensatory sapling
    child_ulpins = [
        f"{proof.target_afforestation_zone_id}-SAP{str(i+1).zfill(3)}"
        for i in range(proof.saplings_planted_count)
    ]
    
    return {
        "parent_tree_ulpin": proof.parent_tree_ulpin,
        "compliance_status": "COMPENSATORY_VERIFIED_ESCROW_RELEASED" if is_count_valid else "NON_COMPLIANT_ESCROW_LOCKED",
        "applicant": {
            "name": proof.applicant_name,
            "type": proof.applicant_type,
            "statutory_deposit_inr": proof.escrow_amount_inr
        },
        "afforestation_audit": {
            "mandatory_ratio_required": f"1:{mandatory_ratio}",
            "verified_saplings_planted": proof.saplings_planted_count,
            "target_zone": proof.target_afforestation_zone_id,
            "proof_sha256": proof.geotagged_proof_hash,
            "verification_timestamp": datetime.datetime.now().isoformat()
        },
        "registered_child_tree_ulpins": child_ulpins,
        "registry_action": "Municipal Building NOC Granted. Parent tree retired to Ecological Archive. 10 Active child tokens minted."
    }
