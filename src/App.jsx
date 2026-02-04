import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Vote from './pages/Vote';
import Recovery from './pages/Recovery';

import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          <Route path="/admin" element={<Admin />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/recovery" element={<Recovery />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
