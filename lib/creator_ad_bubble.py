def validate_creator_ad(ad_text):
    if len(ad_text.split()) > 20:
        raise ValueError("Ad bubble must be short and nonintrusive.")
    return True
