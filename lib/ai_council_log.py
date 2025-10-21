import os
import json
from datetime import datetime

def log_council_action(action_type, target_id, details):
    log = {
        "action": action_type,
        "target": target_id,
        "details": details,
        "timestamp": datetime.utcnow().isoformat(),
        "proposed_by": "AI Council",
        "approved_by": "Jacob"
    }
    os.makedirs("./council_logs", exist_ok=True)
    with open(f"./council_logs/{action_type}_{target_id}.json", "w", encoding="utf-8") as f:
        json.dump(log, f)
    return log
