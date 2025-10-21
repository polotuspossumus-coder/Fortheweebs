def validate_profile_ad(ad_text):
    if len(ad_text.split()) > 20:
        raise ValueError("Profile ad bubble must be short and non-intrusive.")
    return True
