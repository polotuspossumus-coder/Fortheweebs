from datetime import datetime
import os, json

# Assumes all required modules are available in the same directory or installed in the environment
from access_control import check_access
from prompt_to_anything import generate_artifact
from media_metadata import enrich_metadata, folderize
from video_editor import edit_video
from artifact_exporter import export_artifact

def unified_creator_pipeline(prompt, media_type, creator_id, user_tier, tags=None, audio_path=None, text_overlay=None):
    if tags is None:
        tags = []
    check_access(user_tier, media_type)
    artifact = generate_artifact(prompt, media_type, user_tier)
    enriched = enrich_metadata(artifact, creator_id, tags, user_tier)
    folderized = folderize(artifact, media_type)

    if media_type == "video":
        folderized = edit_video(folderized, audio_path=audio_path, text_overlay=text_overlay)

    final = export_artifact(folderized, file_format="mp4", watermark="Fortheweebs", seal=True)
    return final
