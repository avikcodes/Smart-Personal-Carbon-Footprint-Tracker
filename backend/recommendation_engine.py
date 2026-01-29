from typing import Dict, Any

def build_recommendation_prompt(carbon_breakdown: Dict[str, float], activity_summary: str) -> str:
    """
    Constructs a structured prompt for an LLM to provide sustainability recommendations.
    
    carbon_breakdown: {'transport': float, 'food': float, 'energy': float, 'total': float}
    activity_summary: A short text description of the user's recent habits.
    """
    
    # Identify highest emission category
    categories = {k: v for k, v in carbon_breakdown.items() if k != 'total'}
    highest_category = max(categories, key=categories.get) if categories else "N/A"
    highest_value = categories.get(highest_category, 0)
    
    prompt = f"""
Act as a Sustainability Expert and Carbon Footprint Consultant.
Your goal is to analyze a user's carbon footprint data and provide actionable, realistic, and prioritized recommendations to reduce their environmental impact.

### User Carbon Footprint Data (kg CO2e):
- **Total Footprint**: {carbon_breakdown.get('total', 0):.2f}
- **Transport**: {carbon_breakdown.get('transport', 0):.2f}
- **Food**: {carbon_breakdown.get('food', 0):.2f}
- **Energy**: {carbon_breakdown.get('energy', 0):.2f}

### User's Recent Activity Summary:
"{activity_summary}"

### Analysis:
- The highest contributor to the user's footprint is **{highest_category.capitalize()}** ({highest_value:.2f} kg CO2e).

### Task:
Please provide 5–7 specific and realistic recommendations to reduce this carbon footprint. 
For each recommendation, include:
1. **Action**: A clear, actionable step.
2. **Priority**: High, Medium, or Low (based on potential impact and ease of implementation).
3. **Rationale**: A brief explanation of why this helps.

### Output Style:
- Use a professional yet encouraging tone.
- Use clear bullet points.
- Ensure recommendations are tailored to the provided data and habits.
- Do not use generic advice; keep it specific to the identified problem areas.

Recommendations:
"""
    return prompt.strip()

if __name__ == "__main__":
    # Example usage / Verification
    sample_breakdown = {
        'transport': 45.5,
        'food': 12.2,
        'energy': 30.0,
        'total': 87.7
    }
    sample_summary = "I drive to work every day, eat meat three times a week, and leave my computer on overnight."
    
    generated_prompt = build_recommendation_prompt(sample_breakdown, sample_summary)
    print("--- GENERATED PROMPT ---")
    print(generated_prompt)
