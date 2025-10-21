import mimetypes
from PIL import Image
from moviepy.editor import VideoFileClip
import librosa

def classify_media(file_path):
    mime_type, _ = mimetypes.guess_type(file_path)
    if mime_type and mime_type.startswith('image'):
        return 'image'
    elif mime_type and mime_type.startswith('video'):
        return 'video'
    elif mime_type and mime_type.startswith('audio'):
        return 'audio'
    else:
        return 'unknown'

def ingest_media(file_path):
    media_type = classify_media(file_path)
    metadata = {}
    
    if media_type == 'image':
        img = Image.open(file_path)
        metadata = {
            'dimensions': img.size,
            'mode': img.mode,
            'format': img.format
        }
    elif media_type == 'video':
        clip = VideoFileClip(file_path)
        metadata = {
            'duration': clip.duration,
            'fps': clip.fps,
            'resolution': clip.size
        }
    elif media_type == 'audio':
        y, sr = librosa.load(file_path, sr=None)
        metadata = {
            'duration': librosa.get_duration(y=y, sr=sr),
            'sample_rate': sr
        }
    
    return {
        'type': media_type,
        'metadata': metadata
    }
