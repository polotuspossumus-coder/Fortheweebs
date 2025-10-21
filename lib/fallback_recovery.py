import json
from datetime import datetime
import os

def recover_from_crash(context, last_known_state):
    recovery_log = {
        "context": context,
        "last_known_state": last_known_state,
        "timestamp": datetime.utcnow().isoformat(),
        "status": "recovery initiated"
    }
    os.makedirs("./recovery", exist_ok=True)
    with open("./recovery/recovery_log.json", "w", encoding="utf-8") as f:
        json.dump(recovery_log, f)
    return "Recovery protocol initiated. Resume from last known state."
