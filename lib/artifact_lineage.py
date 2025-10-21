import os
import json
from datetime import datetime

def track_lineage(original_path, new_path, action, actor_id):
    lineage = {
        "original": original_path,
        "new": new_path,
        "action": action,
        "actor": actor_id,
        "timestamp": datetime.utcnow().isoformat()
    }
    os.makedirs("./lineage", exist_ok=True)
    with open(f"./lineage/{actor_id}_{action}.json", "w", encoding="utf-8") as f:
        json.dump(lineage, f)
    return lineage
