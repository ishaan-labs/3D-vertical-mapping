from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class BuildingAuditInput(BaseModel):
    parcel_id: str
    plot_area_sqm: float
    sanctioned_fsi: float  # e.g., 2.5
    sanctioned_height_m: float  # e.g., 36.0m (12 floors)
    actual_height_m: float  # e.g., 45.0m (15 floors)
    actual_builtup_area_sqm: float  # e.g., 3200.0 sqm
    municipal_tax_rate_per_sqm_inr: float = 120.0  # Annual property tax base
    commercial_penalty_multiplier: float = 3.5

class UDSAuditInput(BaseModel):
    parcel_id: str
    total_sanctioned_uds_sqft: float  # Total plot land share (e.g., 10,000 sqft)
    registered_units: List[Dict[str, Any]]  # List of {"unit_id": str, "owner": str, "allocated_uds_sqft": float, "mortgage_bank": Optional[str]}

class AirspaceCorridorInput(BaseModel):
    corridor_id: str
    min_altitude_msl: float = 80.0  # Drone corridor lower bound
    max_altitude_msl: float = 95.0  # Drone corridor upper bound
    building_top_msl: float
    lightning_rod_tip_msl: float
    safety_buffer_m: float = 5.0

def audit_far_and_ghost_floors(data: BuildingAuditInput) -> Dict[str, Any]:
    max_permissible_area = data.plot_area_sqm * data.sanctioned_fsi
    excess_area = max(0.0, data.actual_builtup_area_sqm - max_permissible_area)
    actual_fsi = round(data.actual_builtup_area_sqm / data.plot_area_sqm, 2)
    
    height_deviation = max(0.0, data.actual_height_m - data.sanctioned_height_m)
    unauthorized_floors = int(height_deviation // 3.0) if height_deviation > 0 else 0
    
    annual_tax_evaded_inr = excess_area * data.municipal_tax_rate_per_sqm_inr
    one_time_penalty_inr = annual_tax_evaded_inr * data.commercial_penalty_multiplier

    has_violation = excess_area > 0 or unauthorized_floors > 0

    return {
        "parcel_id": data.parcel_id,
        "violation_status": "CRITICAL_VIOLATION" if has_violation else "COMPLIANT",
        "sanctioned_fsi": data.sanctioned_fsi,
        "actual_fsi": actual_fsi,
        "fsi_deviation_pct": round(((actual_fsi - data.sanctioned_fsi) / data.sanctioned_fsi) * 100, 1) if actual_fsi > data.sanctioned_fsi else 0.0,
        "unauthorized_builtup_sqm": round(excess_area, 2),
        "unauthorized_ghost_floors": unauthorized_floors,
        "height_deviation_meters": round(height_deviation, 1),
        "financial_audit": {
            "annual_uncollected_property_tax_inr": round(annual_tax_evaded_inr, 2),
            "compounded_structural_penalty_inr": round(one_time_penalty_inr, 2),
            "currency": "INR (₹)"
        }
    }

def audit_uds_conservation(data: UDSAuditInput) -> Dict[str, Any]:
    total_allocated_uds = sum(u["allocated_uds_sqft"] for u in data.registered_units)
    allocation_pct = round((total_allocated_uds / data.total_sanctioned_uds_sqft) * 100, 2)
    oversold_sqft = max(0.0, total_allocated_uds - data.total_sanctioned_uds_sqft)
    
    # Check duplicate mortgage registrations across units
    banks_pledged = [u.get("mortgage_bank") for u in data.registered_units if u.get("mortgage_bank")]
    unique_banks = set(banks_pledged)
    
    is_fraud_detected = allocation_pct > 100.0 or len(banks_pledged) > len(unique_banks)

    return {
        "parcel_id": data.parcel_id,
        "fraud_risk_score": "HIGH_FRAUD_ALERT" if is_fraud_detected else "LEGALLY_CONSERVED",
        "total_sanctioned_uds_sqft": data.total_sanctioned_uds_sqft,
        "total_allocated_uds_sqft": total_allocated_uds,
        "uds_allocation_percentage": allocation_pct,
        "illegal_oversold_uds_sqft": round(oversold_sqft, 2),
        "double_mortgage_risk": len(banks_pledged) > len(unique_banks),
        "units_count": len(data.registered_units)
    }

def audit_airspace_corridor(data: AirspaceCorridorInput) -> Dict[str, Any]:
    critical_obstacle_tip = max(data.building_top_msl, data.lightning_rod_tip_msl)
    corridor_floor_with_buffer = data.min_altitude_msl - data.safety_buffer_m
    
    is_breached = critical_obstacle_tip >= corridor_floor_with_buffer
    vertical_clearance = round(data.min_altitude_msl - critical_obstacle_tip, 2)

    return {
        "corridor_id": data.corridor_id,
        "corridor_envelope_msl": f"+{data.min_altitude_msl}m to +{data.max_altitude_msl}m",
        "structure_apex_msl": f"+{critical_obstacle_tip}m",
        "vertical_clearance_meters": vertical_clearance,
        "airspace_status": "AIRSPACE_HAZARD_BREACH" if is_breached else "CLEAR_FOR_FLIGHT",
        "recommendation": "Order mandatory obstacle beacon and lower structure tip" if is_breached else "Clearance verified under DGCA DigitalSky norms."
    }
