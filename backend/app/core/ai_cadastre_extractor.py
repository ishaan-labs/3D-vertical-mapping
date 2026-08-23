import os
from pydantic import BaseModel, Field
from typing import List, Tuple
from google import genai
from google.genai import types

class ExtractedCadastreData(BaseModel):
    property_name: str = Field(description="Name or title of the property/unit/infrastructure")
    strata_type: str = Field(description="'V' for vertical flat/office, 'U' for underground utility/parking/metro, 'A' for air rights, 'S' for surface parcel")
    base_2d_ulpin: str = Field(description="14-digit base land parcel ULPIN, e.g. IND80219481920")
    z_min_meters: float = Field(description="Lower elevation bound in meters relative to ground (Z=0)")
    z_max_meters: float = Field(description="Upper elevation bound in meters relative to ground (Z=0)")
    estimated_carpet_area_sqm: float = Field(description="Extracted carpet/operational area in square meters")
    bounding_coordinates: List[Tuple[float, float]] = Field(description="List of [lon, lat] 2D footprint coordinates")

def extract_3d_cadastre_from_text(deed_text: str) -> ExtractedCadastreData:
    """
    Uses Gemini Structured Outputs to convert unstructured legal deeds / engineering specs into ISO 19152 3D cadastre bounds.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        # Fallback realistic dummy data if API key not exported during local demo testing
        return ExtractedCadastreData(
            property_name="Residential Flat Unit 402",
            strata_type="V",
            base_2d_ulpin="IND80219481920",
            z_min_meters=12.0,
            z_max_meters=15.0,
            estimated_carpet_area_sqm=128.5,
            bounding_coordinates=[[80.2190, 13.0480], [80.2200, 13.0480], [80.2200, 13.0490], [80.2190, 13.0490]]
        )

    client = genai.Client(api_key=api_key)

    prompt = f"""
    You are an expert GIS & Land Administration Cadastral Parser adhering to the ISO 19152 (LADM II 3D Cadastre) standard.
    Extract the exact 3D spatial boundaries, vertical strata category (V, U, A, S), elevation bounds (Z_min and Z_max relative to ground level in meters), 
    and base land parcel identifier from the following property deed or infrastructure specification text.

    Deed / Specification Text:
    \"\"\"{deed_text}\"\"\"
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=ExtractedCadastreData,
            temperature=0.1
        )
    )

    return ExtractedCadastreData.model_validate_json(response.text)
