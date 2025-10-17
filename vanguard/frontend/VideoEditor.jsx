import { Player } from '@remotion/player';
import MyVideo from './MyVideo';

export default function VideoEditor() {
  return (
    <div style={{ maxWidth: 1280, margin: '2rem auto' }}>
      <Player
        component={MyVideo}
        durationInFrames={300}
        fps={30}
        compositionWidth={1280}
        compositionHeight={720}
        controls
      />
    </div>
  );
}
