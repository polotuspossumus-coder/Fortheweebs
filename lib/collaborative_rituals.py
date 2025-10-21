import os
import json
from datetime import datetime

def initiate_collab(project_name, creator_ids, media_type):
    collab_folder = f"./collabs/{project_name}/"
    os.makedirs(collab_folder, exist_ok=True)
    ledger = {
        "project": project_name,
        "creators": creator_ids,
        "media_type": media_type,
        "started_at": datetime.utcnow().isoformat()
    }
    with open(os.path.join(collab_folder, "ledger.json"), "w", encoding="utf-8") as f:
        json.dump(ledger, f)
    return collab_folder
