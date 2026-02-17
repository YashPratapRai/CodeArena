import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Home from './Pages/Home';
import Problems from './Pages/Problems';
import ProblemDetail from './Pages/ProblemDetail';
import Profile from './Pages/Profile';
import Leaderboard from './Pages/Leaderboard';
import Login from './Pages/Login';
import Register from './Pages/Register';
import AdminPanel from './Pages/AdminPanel';
import Contest from './Pages/Contest';
import Footer from './components/layout/Footer';
import Discuss from './Pages/Discuss';
import AboutUs from './Pages/Aboutus';
import Careers from './Pages/Careers';
import ContactUs from './Pages/ContactUs';
import TermsOfService from './Pages/TermsOfService';
import PrivacyPolicy from './Pages/PrivacyPolicy';
// import SolutionsList from './components/SolutionsList';
// import SolutionDetail from './components/SolutionDetail';
// import SolutionsList from './components/SolutionsList';
// import SolutionDetail from './components/SolutionDetail';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={
              <>
                <Navbar />
                <Home />
              </>
            } />
            
            <Route path="/problems" element={<Problems />} />
            <Route path="/problems/:id" element={<ProblemDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/contest" element={<Contest />} />
            <Route path="/discuss" element={<Discuss />} /> 
            <Route path="/about" element={<AboutUs />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            {/* <Route path="/problems/:problemId/solutions" element={<SolutionsList />} />
            <Route path="/solutions/:solutionId" element={<SolutionDetail />} /> */}
          </Routes>
          {/* <Footer /> */}
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;