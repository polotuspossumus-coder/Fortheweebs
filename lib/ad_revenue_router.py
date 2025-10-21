def route_ad_revenue(ad_type, amount, creator_id=None):
    if ad_type == "platform":
        return {"jacob": amount}
    elif ad_type == "creator" and creator_id:
        split = amount / 2
        return {"jacob": split, creator_id: split}
    else:
        raise ValueError("Invalid ad type or missing creator ID.")
