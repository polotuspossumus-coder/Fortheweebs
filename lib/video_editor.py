from moviepy.editor import VideoFileClip, AudioFileClip, TextClip, CompositeVideoClip

def edit_video(video_path, audio_path=None, text_overlay=None):
    clip = VideoFileClip(video_path)
    layers = [clip]

    if audio_path:
        audio = AudioFileClip(audio_path)
        clip = clip.set_audio(audio)

    if text_overlay:
        txt = TextClip(text_overlay, fontsize=70, color='white').set_position('center').set_duration(clip.duration)
        layers.append(txt)

    final = CompositeVideoClip(layers)
    output_path = video_path.replace(".mp4", "_edited.mp4")
    final.write_videofile(output_path)
    return output_path
