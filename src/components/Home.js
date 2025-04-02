import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Swal from 'sweetalert2';

const Home = () => {
  const navigate = useNavigate();

  const handleGameClick = (path, isAvailable) => {
    if (isAvailable) {
      navigate(path);
    } else {
      Swal.fire({
        title: 'Coming Soon!',
        text: 'This game is under development. Please try our other games!',
        icon: 'info',
        confirmButtonText: 'OK'
      });
    }
  };

  return (
    <div className="home-page">
      <Navbar />
      <div className="home-content">
        <div className="home-header">
          <h1>Welcome to GameHub</h1>
          <p>Choose and play</p>
        </div>
        <div className="games-grid">
          <div className="game-card" onClick={() => handleGameClick('/game/snake', true)}>
            <div className="game-icon">🐍</div>
            <div className="game-info">
              <h3>Snake Game</h3>
              <p>Classic snake game with modern graphics. Collect food and grow longer!</p>
            </div>
          </div>

          <div className="game-card" onClick={() => handleGameClick('/game/tictactoe', true)}>
            <div className="game-icon">⭕</div>
            <div className="game-info">
              <h3>Tic Tac Toe</h3>
              <p>Challenge our AI in this classic game of X's and O's!</p>
            </div>
          </div>

          <div className="game-card coming-soon" onClick={() => handleGameClick('/game/tetris', false)}>
            <div className="game-icon">🟦</div>
            <div className="game-info">
              <h3>Tetris</h3>
              <p>Stack and clear lines in this addictive puzzle game.</p>
            </div>
            <div className="game-status">
              <span className="coming-soon">Coming Soon</span>
            </div>
          </div>

          <div className="game-card coming-soon" onClick={() => handleGameClick('/game/pacman', false)}>
            <div className="game-icon">👻</div>
            <div className="game-info">
              <h3>Pac-Man</h3>
              <p>Navigate through mazes and avoid ghosts in this arcade classic.</p>
            </div>
            <div className="game-status">
              <span className="coming-soon">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 