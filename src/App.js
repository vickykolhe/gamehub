import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Game from './components/Game';
import TicTacToe from './components/TicTacToe';
import Scoreboard from './components/Scoreboard';

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/game/snake" 
            element={
              <PrivateRoute>
                <Game />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/game/tictactoe" 
            element={
              <PrivateRoute>
                <TicTacToe />
              </PrivateRoute>
            } 
          />
          <Route path="/scoreboard" element={<PrivateRoute><Scoreboard /></PrivateRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App; 