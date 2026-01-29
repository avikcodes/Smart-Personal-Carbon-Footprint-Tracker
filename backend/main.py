from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sys
import os

# Add the current directory to sys.path to import carbon_engine
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from carbon_engine import (
        calculate_transport_emissions,
        calculate_food_emissions,
        calculate_energy_emissions,
        calculate_total_footprint
    )
    from demo_api import router as demo_router
except ImportError:
    # Handle cases where the engine might be in a different path during dev
    from .carbon_engine import (
        calculate_transport_emissions,
        calculate_food_emissions,
        calculate_energy_emissions,
        calculate_total_footprint
    )
    from .demo_api import router as demo_router

app = FastAPI(title="Carbon Footprint Tracker API")

# Enable CORS for localhost frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include demo router
app.include_router(demo_router, prefix="/api", tags=["demo"])

# --- Pydantic Models ---

class TransportRequest(BaseModel):
    mode: str
    distance: float

class FoodRequest(BaseModel):
    type: str
    quantity: float

class EnergyRequest(BaseModel):
    type: str
    kwh: float

class TotalCalculationRequest(BaseModel):
    transport: List[dict] # list of {'mode': str, 'distance': float}
    food: List[dict]      # list of {'type': str, 'quantity': float}
    energy: List[dict]    # list of {'type': str, 'kwh': float}

# --- Endpoints ---

@app.post("/transport")
async def transport_emissions(req: TransportRequest):
    result = calculate_transport_emissions(req.mode, req.distance)
    return {"carbon_footprint_kg": round(result, 4)}

@app.post("/food")
async def food_emissions(req: FoodRequest):
    result = calculate_food_emissions(req.type, req.quantity)
    return {"carbon_footprint_kg": round(result, 4)}

@app.post("/energy")
async def energy_emissions(req: EnergyRequest):
    result = calculate_energy_emissions(req.type, req.kwh)
    return {"carbon_footprint_kg": round(result, 4)}

@app.post("/calculate-total")
async def total_calculation(req: TotalCalculationRequest):
    result = calculate_total_footprint(req.transport, req.food, req.energy)
    return result

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
