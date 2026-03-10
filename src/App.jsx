import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Vote from './pages/Vote';
import VoteSuccess from './pages/VoteSuccess';
import HelpPage from './pages/HelpPage';

import { AuthProvider } from './context/AuthContext';

import { Auth } from './utils/auth';

function App() {
  useEffect(() => {
    const fetchKey = async () => {
      try {
        const fetchUrl = `${Auth.API_URL}/api/election/public-key`;
        const urlToUse = Auth.API_URL.endsWith('/api') ? `${Auth.API_URL}/election/public-key` : fetchUrl;
        const response = await fetch(urlToUse);
        if (response.ok) {
          const key = await response.json();
          sessionStorage.setItem('election_public_key', JSON.stringify(key));
          console.log("Election Key Cached");
        }
      } catch (e) {
        console.error("Failed to cache election key", e);
      }
    };
    fetchKey();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          <Route path="/admin" element={<Admin />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/vote-success" element={<VoteSuccess />} />
          <Route path="/help" element={<HelpPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
