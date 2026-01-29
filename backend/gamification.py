"""
Gamification and Scoring Module
Provides logic for user engagement through scores, streaks, and badges.
"""

from typing import List, Dict, Any, Tuple

# Constants for thresholds and scoring
DAILY_CARBON_GOAL_KG = 20.0  # Threshold for a 'perfect' score
SCORE_MULTIPLIER = 5.0      # Weight for carbon reduction in score calculation
STREAK_BONUS_MILESTONES = {
    3: 50,    # 3-day streak bonus points
    7: 150,   # 7-day streak bonus points
}

LEVELS = [
    (0, "Seedling"),
    (500, "Sapling"),
    (1500, "Oak"),
    (3000, "Forest Guardian"),
    (5000, "Planet Hero")
]

BADGE_DEFINITIONS = [
    {"id": "green_traveler", "name": "Green Traveler", "description": "Transport footprint below 5kg.", "transport_max": 5.0},
    {"id": "eco_warrior", "name": "Eco Warrior", "description": "Maintain a 7-day activity streak.", "min_streak": 7},
    {"id": "low_utility", "name": "Energy Saver", "description": "Reduce daily energy use below 10kWh.", "energy_max": 10.0}
]

def calculate_daily_score(total_carbon_kg: float) -> int:
    """
    Calculates a daily score from 0 to 100 based on total carbon footprint.
    Lower footprint equals a higher score.
    """
    # Simple linear decay starting from 100
    # If carbon is 0, score is 100. If carbon >= DAILY_CARBON_GOAL_KG, score is 0.
    raw_score = 100 - (total_carbon_kg * (100 / DAILY_CARBON_GOAL_KG))
    return int(max(0, min(100, raw_score)))

def calculate_weekly_streak(active_days_count: int) -> Tuple[str, int]:
    """
    Returns streak status message and bonus points earned.
    """
    bonus = STREAK_BONUS_MILESTONES.get(active_days_count, 0)
    if active_days_count >= 7:
        status = f"🔥 Master Streak: {active_days_count} days!"
    elif active_days_count >= 3:
        status = f"✨ On Fire: {active_days_count} days!"
    else:
        status = f"Keep it up: {active_days_count} days"
    
    return status, bonus

def get_badges(
    total_carbon_kg: float, 
    streak_days: int, 
    transport_kg: float = 0.0, 
    energy_kwh: float = 0.0
) -> List[Dict[str, str]]:
    """
    Returns a list of earned badges based on current activity.
    """
    earned = []
    for badge in BADGE_DEFINITIONS:
        is_earned = True
        
        if "transport_max" in badge and transport_kg > badge["transport_max"]:
            is_earned = False
        if "min_streak" in badge and streak_days < badge["min_streak"]:
            is_earned = False
        if "energy_max" in badge and energy_kwh > badge["energy_max"]:
            is_earned = False
            
        if is_earned:
            earned.append({
                "id": badge["id"],
                "name": badge["name"],
                "description": badge["description"]
            })
            
    return earned

def get_progress_level(total_points: int) -> Dict[str, Any]:
    """
    Returns the user's current level name and level number based on total points.
    """
    current_level_name = LEVELS[0][1]
    level_num = 1
    
    for i, (threshold, name) in enumerate(LEVELS):
        if total_points >= threshold:
            current_level_name = name
            level_num = i + 1
        else:
            break
            
    return {
        "level_name": current_level_name,
        "level_number": level_num,
        "total_points": total_points
    }

if __name__ == "__main__":
    # Internal Verification
    print("--- Gamification Logic Test ---")
    
    # Test Scoring
    print(f"Score for 0kg: {calculate_daily_score(0)}")
    print(f"Score for 10kg: {calculate_daily_score(10)}")
    print(f"Score for 30kg: {calculate_daily_score(30)}")
    
    # Test Streaks
    print(f"Streak 3 days: {calculate_weekly_streak(3)}")
    print(f"Streak 7 days: {calculate_weekly_streak(7)}")
    
    # Test Badges
    print(f"Badges (Low Carbon, 7 day streak): {get_badges(10, 7, 2, 5)}")
    
    # Test Levels
    print(f"Level for 2000 points: {get_progress_level(2000)}")
