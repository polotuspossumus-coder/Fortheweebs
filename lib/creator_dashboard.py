def get_creator_dashboard(creator_id):
    dashboard = {
        "vault": f"./vault/{creator_id}/",
        "tier": get_creator_tier(creator_id),
        "ad_bubble": get_ad_bubble(creator_id),
        "artifact_count": count_artifacts(creator_id),
        "profit": calculate_profit(creator_id)
    }
    return dashboard
