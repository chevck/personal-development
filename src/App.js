import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import SpeaklyLearnerRoute from "./components/speakly/SpeaklyLearnerRoute";
import PersonaLanding from "./pages/PersonaLanding";
import SpeaklyLanding from "./pages/speech-training/SpeaklyLanding";
import AssessorHome from "./pages/speech-training/AssessorHome";
import AssessSubmission from "./pages/AssessSubmission";
import SpeechTrainingSignIn from "./pages/SpeechTrainingSignIn";
import SpeechTrainingForgotPassword from "./pages/SpeechTrainingForgotPassword";
import SpeechTrainingResetPassword from "./pages/SpeechTrainingResetPassword";
import SpeechTrainingRegister from "./pages/SpeechTrainingRegister";
import PersonaWaitlist from "./pages/PersonaWaitlist";
import SpeechTraining from "./projects/speech-training/SpeechTraining";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path='/' element={<PersonaLanding />} />
        <Route path='/speakly/welcome' element={<SpeaklyLanding />} />
        <Route path='/speakly/login' element={<SpeechTrainingSignIn />} />
        <Route path='/speakly/forgot-password' element={<SpeechTrainingForgotPassword />} />
        <Route path='/speakly/reset-password' element={<SpeechTrainingResetPassword />} />
        <Route path='/speakly/register' element={<SpeechTrainingRegister />} />
        <Route path='/waitlist' element={<PersonaWaitlist />} />
        <Route path='/speakly/waitlist' element={<Navigate to='/waitlist' replace />} />
        <Route
          path='/speakly'
          element={
            <ProtectedRoute>
              <SpeaklyLearnerRoute>
                <SpeechTraining />
              </SpeaklyLearnerRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path='/speakly/assessor'
          element={
            <ProtectedRoute>
              <AssessorHome />
            </ProtectedRoute>
          }
        />
        <Route
          path='/speakly/recordings/:daySegment/:recordingNum'
          element={<AssessSubmission />}
        />
        <Route path='/assess/:shareId' element={<AssessSubmission />} />
        <Route
          path='/:userCode/:daySegment/:recordingSegment'
          element={<AssessSubmission />}
        />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
