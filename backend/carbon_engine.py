"""
Carbon Footprint Calculation Engine
This module provide logic to calculate CO2e emissions for different categories.
Weights are in kg CO2e per unit (km for transport, kg for food, kWh for energy).
"""

from typing import Dict, List, Optional, Union

# Default Emission Factors (kg CO2e per unit)
# Sources vary, these are representative averages.
DEFAULT_EMISSION_FACTORS = {
    "transport": {
        "car": 0.17,      # Average car (gasoline) per km
        "bus": 0.08,      # Average bus per km per passenger
        "train": 0.03,    # Average train per km per passenger
        "flight": 0.24,   # Short-haul flight per km per passenger
    },
    "food": {
        "beef": 27.0,     # per kg
        "chicken": 6.9,   # per kg
        "dairy": 1.9,     # per kg (mixed dairy)
        "vegetables": 0.4, # per kg
        "rice": 2.7,      # per kg
    },
    "energy": {
        "electricity": 0.45, # kg CO2e per kWh (depends on grid mix)
        "gas": 0.18,        # kg CO2e per kWh
    }
}

def calculate_transport_emissions(
    mode: str, 
    distance_km: float, 
    factors: Optional[Dict[str, float]] = None
) -> float:
    """Calculates transport emissions in kg CO2e."""
    if factors is None:
        factors = DEFAULT_EMISSION_FACTORS["transport"]
    
    factor = factors.get(mode.lower(), 0.0)
    return distance_km * factor

def calculate_food_emissions(
    food_type: str, 
    quantity_kg: float, 
    factors: Optional[Dict[str, float]] = None
) -> float:
    """Calculates food emissions in kg CO2e."""
    if factors is None:
        factors = DEFAULT_EMISSION_FACTORS["food"]
    
    factor = factors.get(food_type.lower(), 0.0)
    return quantity_kg * factor

def calculate_energy_emissions(
    energy_type: str, 
    kwh: float, 
    factors: Optional[Dict[str, float]] = None
) -> float:
    """Calculates energy emissions in kg CO2e."""
    if factors is None:
        factors = DEFAULT_EMISSION_FACTORS["energy"]
    
    factor = factors.get(energy_type.lower(), 0.0)
    return kwh * factor

def calculate_total_footprint(
    transport_entries: List[Dict[str, Union[str, float]]],
    food_entries: List[Dict[str, Union[str, float]]],
    energy_entries: List[Dict[str, Union[str, float]]],
    custom_factors: Optional[Dict[str, Dict[str, float]]] = None
) -> Dict[str, Union[float, Dict[str, float]]]:
    """
    Calculates total carbon footprint and provides a breakdown.
    
    transport_entries: list of {'mode': str, 'distance': float}
    food_entries: list of {'type': str, 'quantity': float}
    energy_entries: list of {'type': str, 'kwh': float}
    """
    
    t_factors = custom_factors.get("transport") if custom_factors else None
    f_factors = custom_factors.get("food") if custom_factors else None
    e_factors = custom_factors.get("energy") if custom_factors else None

    transport_total = sum(
        calculate_transport_emissions(e['mode'], e['distance'], t_factors) 
        for e in transport_entries
    )
    
    food_total = sum(
        calculate_food_emissions(e['type'], e['quantity'], f_factors) 
        for e in food_entries
    )
    
    energy_total = sum(
        calculate_energy_emissions(e['type'], e['kwh'], e_factors) 
        for e in energy_entries
    )
    
    total = transport_total + food_total + energy_total
    
    return {
        "total_kg_co2e": round(total, 4),
        "breakdown": {
            "transport": round(transport_total, 4),
            "food": round(food_total, 4),
            "energy": round(energy_total, 4)
        }
    }

if __name__ == "__main__":
    # Example usage / Simple Verification
    sample_transport = [{"mode": "car", "distance": 10}, {"mode": "flight", "distance": 100}]
    sample_food = [{"type": "beef", "quantity": 0.5}, {"type": "vegetables", "quantity": 2}]
    sample_energy = [{"type": "electricity", "kwh": 50}]
    
    result = calculate_total_footprint(sample_transport, sample_food, sample_energy)
    print(f"Total Carbon Footprint: {result['total_kg_co2e']} kg CO2e")
    print(f"Breakdown: {result['breakdown']}")
