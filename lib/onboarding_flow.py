import os
import json
from datetime import datetime

def initiate_onboarding(creator_id, selected_tier):
    flow = {
        "creator_id": creator_id,
        "tier": selected_tier,
        "steps": ["profile setup", "ad bubble config", "artifact vault link", "tier unlock map"],
        "timestamp": datetime.utcnow().isoformat()
    }
    os.makedirs("./onboarding", exist_ok=True)
    with open(f"./onboarding/{creator_id}.json", "w", encoding="utf-8") as f:
        json.dump(flow, f)
    return flow
