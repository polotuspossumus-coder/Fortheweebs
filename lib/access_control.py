def check_access(user_tier, feature):
    mythic_only = ["AI Generation", "CGI", "Unlimited Export"]
    if feature in mythic_only and user_tier != "Mythic":
        raise PermissionError(f"{feature} is exclusive to Mythic Founders.")
    return True
