import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
import Swal from 'sweetalert2';
import Navbar from './Navbar';
import '../index.css';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: 0 };
const GAME_SPEED = 150;

function Game() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [scores, setScores] = useState([]);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const scoresQuery = query(
          collection(db, 'scores'),
          orderBy('score', 'desc'),
          limit(5)
        );
        const querySnapshot = await getDocs(scoresQuery);
        const scoresData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setScores(scoresData);
      } catch (error) {
        console.error('Error fetching scores:', error);
      }
    };

    fetchScores();
    // Set up real-time listener for score updates
    const unsubscribe = onSnapshot(
      query(collection(db, 'scores'), orderBy('score', 'desc'), limit(5)),
      (snapshot) => {
        const scoresData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setScores(scoresData);
      }
    );

    return () => unsubscribe();
  }, []);

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    setFood(newFood);
  }, []);

  const saveScore = async () => {
    try {
      await addDoc(collection(db, 'scores'), {
        userId: currentUser.uid,
        email: currentUser.email,
        score: score,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const handleKeyPress = useCallback((e) => {
    if (!gameStarted) {
      setGameStarted(true);
    }
    
    // Prevent default behavior for arrow keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }
    
    switch (e.key) {
      case 'ArrowUp':
        if (direction.y !== 1) setDirection({ x: 0, y: -1 });
        break;
      case 'ArrowDown':
        if (direction.y !== -1) setDirection({ x: 0, y: 1 });
        break;
      case 'ArrowLeft':
        if (direction.x !== 1) setDirection({ x: -1, y: 0 });
        break;
      case 'ArrowRight':
        if (direction.x !== -1) setDirection({ x: 1, y: 0 });
        break;
      case ' ':
        setIsPaused(prev => !prev);
        break;
      default:
        break;
    }
  }, [direction, gameStarted]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (gameOver || isPaused || !gameStarted) return;

    const gameLoop = setInterval(() => {
      setSnake(prevSnake => {
        const newSnake = [...prevSnake];
        const head = {
          x: newSnake[0].x + direction.x,
          y: newSnake[0].y + direction.y
        };

        // Check for collisions
        if (
          head.x < 0 || head.x >= GRID_SIZE ||
          head.y < 0 || head.y >= GRID_SIZE ||
          newSnake.some(segment => segment.x === head.x && segment.y === head.y)
        ) {
          setGameOver(true);
          saveScore();
          Swal.fire({
            title: 'Game Over!',
            text: `Your score: ${score}`,
            icon: 'info',
            confirmButtonText: 'Play Again'
          }).then(() => {
            setSnake(INITIAL_SNAKE);
            setDirection(INITIAL_DIRECTION);
            setScore(0);
            setGameOver(false);
            setGameStarted(false);
            generateFood();
          });
          return prevSnake;
        }

        newSnake.unshift(head);

        // Check for food
        if (head.x === food.x && head.y === food.y) {
          setScore(prev => prev + 10);
          generateFood();
          return newSnake;
        }

        newSnake.pop();
        return newSnake;
      });
    }, GAME_SPEED);

    return () => clearInterval(gameLoop);
  }, [direction, food, gameOver, isPaused, generateFood, score, gameStarted]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className="game-page">
      <Navbar />
      <div className="game-layout">
        <div className="game-main">
          <div className="game-header">
            <button 
              className="back-home-btn"
              onClick={() => navigate('/')}
            >
              ← Back to Home
            </button>
            <div className="score">
              Score: {score}
            </div>
          </div>
          <div className="game-board">
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
              const x = index % GRID_SIZE;
              const y = Math.floor(index / GRID_SIZE);
              const isSnake = snake.some(segment => segment.x === x && segment.y === y);
              const isFood = food.x === x && food.y === y;

              return (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    left: x * CELL_SIZE,
                    top: y * CELL_SIZE,
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    backgroundColor: isSnake ? '#4CAF50' : isFood ? '#FF5722' : '#ddd',
                    border: '1px solid #999'
                  }}
                />
              );
            })}
          </div>
          <div className="game-controls">
            <p>Use arrow keys to move</p>
            <p>Space to pause</p>
            {!gameStarted && <p className="start-message">Press any arrow key to start!</p>}
          </div>
        </div>
        <div className="scoreboard-sidebar">
          <h3>Top Players</h3>
          <div className="scoreboard-table">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score, index) => (
                  <tr key={score.id}>
                    <td>{index + 1}</td>
                    <td>{score.email}</td>
                    <td>{score.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Game; 