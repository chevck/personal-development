import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import AssessSubmission from './pages/AssessSubmission';
import SpeechTrainingLogin from './pages/SpeechTrainingLogin';
import SpeechTraining from './projects/speech-training/SpeechTraining';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/speech-training/login" element={<SpeechTrainingLogin />} />
        <Route
          path="/speech-training"
          element={
            <ProtectedRoute>
              <SpeechTraining />
            </ProtectedRoute>
          }
        />
        <Route path="/assess/:shareId" element={<AssessSubmission />} />
        <Route
          path="/:userCode/:daySegment/:recordingSegment"
          element={<AssessSubmission />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
