import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './Pages/landingPage';
import Student from './Pages/StudentPage';
import TeacherPage from './Pages/TeacherPage'; 
import TeacherPoll from './Pages/TeacherPoll';
import StudentPoll from './Pages/StudentPoll';
import KickedScreen from './Pages/KickedScreen';
import PollHistory from './components/PollHistory ';
function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/student" element={<Student />} />
        <Route path="/teacher" element={<TeacherPage />} />
        <Route path="/teacher/poll" element={<TeacherPoll />} />
        <Route path="/student/poll" element={<StudentPoll />} />
        <Route path="/kicked" element={<KickedScreen />} />
        <Route path="/teacher/history" element={<PollHistory />} />
      </Routes>
    </>
  );
}

export default App;
