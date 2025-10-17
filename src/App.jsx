import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './Dashboard';
import ModerationQueue from './ModerationQueue';
import Soundboard from './Soundboard';
import ImageEditor from './ImageEditor';
import VideoEditor from './VideoEditor';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/moderation" element={<ModerationQueue />} />
        <Route path="/soundboard" element={<Soundboard />} />
        <Route path="/image-editor" element={<ImageEditor />} />
        <Route path="/video-editor" element={<VideoEditor />} />
      </Routes>
    </Router>
  );
}
