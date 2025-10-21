import os
import json
from datetime import datetime

def transfer_to_graveyard(artifact_path, reason):
    graveyard_path = artifact_path.replace("/vault/", "/graveyard/")
    os.makedirs(os.path.dirname(graveyard_path), exist_ok=True)
    os.rename(artifact_path, graveyard_path)
    log_graveyard_entry(graveyard_path, reason)
    return graveyard_path

def log_graveyard_entry(path, reason):
    entry = {
        "artifact": path,
        "reason": reason,
        "timestamp": datetime.utcnow().isoformat()
    }
    with open(path + ".grave.json", "w", encoding="utf-8") as f:
        json.dump(entry, f)
