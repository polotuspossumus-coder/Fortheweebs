def detect_circumvention(blocker_id, blocked_id, interaction_log):
    if blocked_id in interaction_log.get("attempts", []):
        trigger_auto_ban(blocked_id, reason="Circumvention of block protocol")
        return True
    return False
