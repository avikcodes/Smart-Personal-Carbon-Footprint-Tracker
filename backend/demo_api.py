from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List

# Importing individual modules
# We assume the modules are in the same directory (backend/)
try:
    from .carbon_engine import (
        calculate_transport_emissions,
        calculate_food_emissions,
        calculate_energy_emissions
    )
    from .gamification import calculate_daily_score, get_badges
    from .recommendation_engine import build_recommendation_prompt
except ImportError:
    from carbon_engine import (
        calculate_transport_emissions,
        calculate_food_emissions,
        calculate_energy_emissions
    )
    from gamification import calculate_daily_score, get_badges
    from recommendation_engine import build_recommendation_prompt

router = APIRouter()

class DemoRunRequest(BaseModel):
    transport_mode: str
    distance: float
    food_type: str
    food_quantity: float
    energy_kwh: float

@router.post("/demo-run")
async def run_integrated_demo(req: DemoRunRequest):
    """
    Computes a full demo lifecycle: emissions -> gamification -> AI recommendations.
    """
    try:
        # 1. Carbon Calculations
        transport_emission = calculate_transport_emissions(req.transport_mode, req.distance)
        food_emission = calculate_food_emissions(req.food_type, req.food_quantity)
        energy_emission = calculate_energy_emissions("electricity", req.energy_kwh)
        
        total_emission = transport_emission + food_emission + energy_emission
        
        # Breakdown for recommendation engine
        breakdown = {
            "transport": round(transport_emission, 2),
            "food": round(food_emission, 2),
            "energy": round(energy_emission, 2),
            "total": round(total_emission, 2)
        }
        
        # 2. Gamification
        daily_score = calculate_daily_score(total_emission)
        badges = get_badges(
            total_carbon_kg=total_emission,
            streak_days=1, # Mock streak for demo
            transport_kg=transport_emission,
            energy_kwh=req.energy_kwh
        )
        
        # 3. AI Recommendations (Prompt Building)
        habit_summary = f"I traveled {req.distance}km by {req.transport_mode}, consumed {req.food_quantity}kg of {req.food_type}, and used {req.energy_kwh}kWh of electricity."
        recommendation_prompt = build_recommendation_prompt(breakdown, habit_summary)
        
        # 4. Assembly
        return {
            "transport_emission": round(transport_emission, 4),
            "food_emission": round(food_emission, 4),
            "energy_emission": round(energy_emission, 4),
            "total_emission": round(total_emission, 4),
            "daily_score": daily_score,
            "badges": badges,
            "recommendation_prompt": recommendation_prompt
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
