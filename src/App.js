import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToTop from "./components/ScrollToTop";
import SpeaklyLearnerRoute from "./components/speakly/SpeaklyLearnerRoute";
import PersonaLanding from "./pages/PersonaLanding";
import SpeaklyLanding from "./pages/speech-training/SpeaklyLanding";
import AssessorHome from "./pages/speech-training/AssessorHome";
import AssessSubmission from "./pages/AssessSubmission";
import PersonaSignIn from "./pages/PersonaSignIn";
import PersonaDashboard from "./pages/PersonaDashboard";
import PersonaSkillSetup from "./pages/PersonaSkillSetup";
import PersonaSkillTasks from "./pages/PersonaSkillTasks";
import PersonaAssessorPicker from "./pages/PersonaAssessorPicker";
import AssessorPortalLayout from "./pages/assessor/AssessorPortalLayout";
import AssessorOverview from "./pages/assessor/AssessorOverview";
import AssessorStudents from "./pages/assessor/AssessorStudents";
import AssessorSettings from "./pages/assessor/AssessorSettings";
import AssessorVerify from "./pages/assessor/AssessorVerify";
import SpeechTrainingForgotPassword from "./pages/SpeechTrainingForgotPassword";
import SpeechTrainingResetPassword from "./pages/SpeechTrainingResetPassword";
import SpeechTrainingRegister from "./pages/SpeechTrainingRegister";
import PersonaRegister from "./pages/PersonaRegister";
import PersonaWaitlist from "./pages/PersonaWaitlist";
import SpeechTraining from "./projects/speech-training/SpeechTraining";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path='/' element={<PersonaLanding />} />
        <Route path='/register' element={<PersonaRegister />} />
        <Route path='/login' element={<PersonaSignIn />} />
        <Route
          path='/dashboard'
          element={
            <ProtectedRoute>
              <PersonaDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path='/skills/:skillId/setup'
          element={
            <ProtectedRoute>
              <PersonaSkillSetup />
            </ProtectedRoute>
          }
        />
        <Route
          path='/skills/:skillId/assessors'
          element={
            <ProtectedRoute>
              <PersonaAssessorPicker />
            </ProtectedRoute>
          }
        />
        <Route
          path='/skills/:skillId'
          element={
            <ProtectedRoute>
              <PersonaSkillTasks />
            </ProtectedRoute>
          }
        />
        <Route
          path='/assessor/verify'
          element={
            <ProtectedRoute>
              <AssessorVerify />
            </ProtectedRoute>
          }
        />
        <Route
          path='/assessor'
          element={
            <ProtectedRoute>
              <AssessorPortalLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AssessorOverview />} />
          <Route path='students' element={<AssessorStudents />} />
          <Route path='settings' element={<AssessorSettings />} />
          <Route path='settings/:tab' element={<AssessorSettings />} />
        </Route>
        <Route path='/speakly/welcome' element={<SpeaklyLanding />} />
        {/* Legacy URL kept alive—renders the Persona sign-in. */}
        <Route path='/speakly/login' element={<PersonaSignIn />} />
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
