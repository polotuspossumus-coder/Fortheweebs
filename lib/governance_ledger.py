import os
import json
from datetime import datetime

def log_protocol_change(change_type, details):
    os.makedirs("./ledger", exist_ok=True)
    entry = {
        "change_type": change_type,
        "details": details,
        "timestamp": datetime.utcnow().isoformat()
    }
    with open(f"./ledger/{change_type}_{entry['timestamp']}.json", "w", encoding="utf-8") as f:
        json.dump(entry, f)
