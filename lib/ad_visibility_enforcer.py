def should_display_ad(user_tier, ad_type):
    if user_tier in ["Mythic", "Standard"]:
        return False
    if ad_type == "creator" and user_tier in ["Legacy", "Supporter"]:
        return True
    if ad_type == "platform" and user_tier == "General":
        return True
    return False
