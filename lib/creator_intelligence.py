import os
import json
from datetime import datetime

def log_creator_activity(creator_id, action, artifact_path):
    log = {
        "creator": creator_id,
        "action": action,
        "artifact": artifact_path,
        "timestamp": datetime.utcnow().isoformat()
    }
    os.makedirs("./creator_logs", exist_ok=True)
    with open(f"./creator_logs/{creator_id}_{action}.json", "w", encoding="utf-8") as f:
        json.dump(log, f)
    return log
