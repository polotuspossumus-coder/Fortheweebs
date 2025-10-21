import os
import json
from datetime import datetime

def enrich_metadata(file_path, creator_id, tags=None, tier="Mythic"):
    if tags is None:
        tags = []
    metadata = {
        "filename": os.path.basename(file_path),
        "creator": creator_id,
        "created_at": datetime.utcnow().isoformat(),
        "tags": tags,
        "tier": tier,
        "sealed": True
    }
    with open(file_path + ".meta.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f)
    return metadata

def folderize(file_path, media_type):
    folder = f"./vault/{media_type}/"
    os.makedirs(folder, exist_ok=True)
    new_path = os.path.join(folder, os.path.basename(file_path))
    os.rename(file_path, new_path)
    return new_path
