import os
import json
from datetime import datetime

def scaffold_tier_logic(tier_name, unlocks, override=False):
    logic = {
        "tier": tier_name,
        "unlocks": unlocks,
        "override": override,
        "timestamp": datetime.utcnow().isoformat()
    }
    os.makedirs("./tier_logic", exist_ok=True)
    with open(f"./tier_logic/{tier_name}.json", "w", encoding="utf-8") as f:
        json.dump(logic, f)
    return logic
