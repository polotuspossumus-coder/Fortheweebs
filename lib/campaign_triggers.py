import os
import json
from datetime import datetime

def trigger_campaign(event_type, creator_id, artifact_path):
    campaign = {
        "event": event_type,
        "creator": creator_id,
        "artifact": artifact_path,
        "triggered_at": datetime.utcnow().isoformat()
    }
    os.makedirs("./campaigns", exist_ok=True)
    with open(f"./campaigns/{creator_id}_{event_type}.json", "w", encoding="utf-8") as f:
        json.dump(campaign, f)
    return campaign
