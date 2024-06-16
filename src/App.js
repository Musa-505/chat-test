import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignInUpScreen from './screens/SignInUpScreen';
import HomeScreen from './screens/HomeScreen';
import ChatScreen from './screens/ChatScreen';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignInUpScreen />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/chat/:userId" element={<ChatScreen />} />
      </Routes>
    </Router>
  );
}