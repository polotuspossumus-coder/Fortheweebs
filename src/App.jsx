import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './Dashboard';
import ModerationQueue from './ModerationQueue';
import Soundboard from './Soundboard';
import ImageEditor from './ImageEditor';
import VideoEditor from './VideoEditor';
import ResponsiveContainer from './ResponsiveContainer';
import HelpOverlay from './HelpOverlay';
import FeedbackToast from './FeedbackToast';
import ErrorBoundary from './ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ResponsiveContainer>
          <HelpOverlay />
          <FeedbackToast message="Welcome to Fortheweebs!" />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/moderation" element={<ModerationQueue />} />
            <Route path="/soundboard" element={<Soundboard />} />
            <Route path="/image-editor" element={<ImageEditor />} />
            <Route path="/video-editor" element={<VideoEditor />} />
          </Routes>
        </ResponsiveContainer>
      </Router>
    </ErrorBoundary>
  );
}
