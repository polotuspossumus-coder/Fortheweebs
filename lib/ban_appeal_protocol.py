import os
import json
from datetime import datetime

def submit_ban_appeal(creator_id, reason):
    appeal = {
        "creator_id": creator_id,
        "reason": reason,
        "submitted_at": datetime.utcnow().isoformat(),
        "status": "pending",
        "reviewed_by": "Jacob"
    }
    os.makedirs("./appeals", exist_ok=True)
    with open(f"./appeals/{creator_id}.json", "w", encoding="utf-8") as f:
        json.dump(appeal, f)
    return appeal
