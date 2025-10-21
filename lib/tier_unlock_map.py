def get_tier_unlocks(tier):
    unlocks = {
        "Mythic": ["AI Generation", "CGI", "Unlimited Export", "Remix Protocol", "Graveyard Monetization", "Governance Override"],
        "Standard": ["Video Editor", "Podcast Fusion", "Folderizer"],
        "Legacy": ["Prompt-to-Image", "Export Engine", "Profile Ad Bubble"],
        "Supporter": ["Folderizer", "Voice Synthesis", "Meme Generator"],
        "General": ["Profile Ad Bubble", "Clickbait Enforcement"]
    }
    return unlocks.get(tier, [])
