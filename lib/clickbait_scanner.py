import json
from datetime import datetime

def scan_for_clickbait(content_text, creator_id):
    violations = ["like and subscribe", "follow for part 2", "sponsored by", "ad break", "buy now"]
    for phrase in violations:
        if phrase.lower() in content_text.lower():
            trigger_auto_ban(creator_id, reason=f"Clickbait/ad detected: '{phrase}'")
            return True
    return False

def trigger_auto_ban(creator_id, reason):
    ban_record = {
        "creator_id": creator_id,
        "reason": reason,
        "timestamp": datetime.utcnow().isoformat(),
        "appealable_by": "Jacob"
    }
    log_ban(ban_record)

def log_ban(ban_record):
    import os
    os.makedirs("./bans", exist_ok=True)
    with open(f"./bans/{ban_record['creator_id']}.json", "w", encoding="utf-8") as f:
        json.dump(ban_record, f)
