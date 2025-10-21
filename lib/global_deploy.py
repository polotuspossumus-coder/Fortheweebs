import os
import json
from datetime import datetime

def deploy_protocol(protocol_name, scope="global"):
    deploy_log = {
        "protocol": protocol_name,
        "scope": scope,
        "deployed_at": datetime.utcnow().isoformat()
    }
    os.makedirs("./deployments", exist_ok=True)
    with open(f"./deployments/{protocol_name}.json", "w", encoding="utf-8") as f:
        json.dump(deploy_log, f)
    return deploy_log
