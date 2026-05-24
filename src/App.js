import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import AssessSubmission from './pages/AssessSubmission';
import SpeechTraining from './projects/speech-training/SpeechTraining';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/speech-training" element={<SpeechTraining />} />
        <Route path="/assess/:shareId" element={<AssessSubmission />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
