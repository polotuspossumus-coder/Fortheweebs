import os
import json
from datetime import datetime

def enforce_block_protocol(blocker_id, blocked_id):
    protocol = {
        "blocker": blocker_id,
        "blocked": blocked_id,
        "ip_tethered": True,
        "behavioral_fingerprint": True,
        "timestamp": datetime.utcnow().isoformat(),
        "status": "sealed"
    }
    os.makedirs("./blocks", exist_ok=True)
    with open(f"./blocks/{blocker_id}_vs_{blocked_id}.json", "w", encoding="utf-8") as f:
        json.dump(protocol, f)
    return protocol
