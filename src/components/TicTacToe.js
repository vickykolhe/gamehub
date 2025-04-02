import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import Navbar from './Navbar';
import Scoreboard from './Scoreboard';
import Swal from 'sweetalert2';

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerNext, setIsPlayerNext] = useState(true);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [topScores, setTopScores] = useState([]);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Fetch top scores
  useEffect(() => {
    const fetchTopScores = async () => {
      try {
        const scoresRef = collection(db, 'tictactoe-scores');
        const q = query(scoresRef, orderBy('score', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        const scores = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTopScores(scores);
      } catch (error) {
        console.error('Error fetching scores:', error);
      }
    };

    fetchTopScores();
  }, []);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }

    return squares.every(square => square !== null) ? 'draw' : null;
  };

  const minimax = (squares, depth, isMaximizing) => {
    const winner = calculateWinner(squares);

    if (winner === 'X') return -10 + depth;
    if (winner === 'O') return 10 - depth;
    if (winner === 'draw') return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < squares.length; i++) {
        if (squares[i] === null) {
          squares[i] = 'O';
          const score = minimax(squares, depth + 1, false);
          squares[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < squares.length; i++) {
        if (squares[i] === null) {
          squares[i] = 'X';
          const score = minimax(squares, depth + 1, true);
          squares[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const findBestMove = (squares) => {
    let bestScore = -Infinity;
    let bestMove = null;

    for (let i = 0; i < squares.length; i++) {
      if (squares[i] === null) {
        squares[i] = 'O';
        const score = minimax(squares, 0, false);
        squares[i] = null;

        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }

    return bestMove;
  };

  const handleClick = (index) => {
    if (gameOver || board[index] || !isPlayerNext) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsPlayerNext(false);
  };

  const saveScore = async () => {
    try {
      await addDoc(collection(db, 'tictactoe-scores'), {
        userId: currentUser.uid,
        email: currentUser.email,
        score: score,
        timestamp: new Date()
      });
      // Refresh top scores after saving
      const scoresRef = collection(db, 'tictactoe-scores');
      const q = query(scoresRef, orderBy('score', 'desc'), limit(10));
      const querySnapshot = await getDocs(q);
      const scores = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTopScores(scores);
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const handleGameEnd = (winner) => {
    setGameOver(true);
    let message = '';
    
    if (winner === 'X') {
      setScore(prev => prev + 10);
      message = 'Congratulations! You won! 🎉';
    } else if (winner === 'O') {
      message = 'AI wins! Better luck next time! 🤖';
    } else {
      message = "It's a draw! 🤝";
    }

    Swal.fire({
      title: 'Game Over!',
      text: message,
      icon: winner === 'X' ? 'success' : winner === 'O' ? 'error' : 'info',
      confirmButtonText: 'Play Again'
    }).then(() => {
      setBoard(Array(9).fill(null));
      setIsPlayerNext(true);
      setGameOver(false);
      if (winner === 'X') {
        saveScore();
      }
    });
  };

  useEffect(() => {
    const winner = calculateWinner(board);
    if (winner) {
      handleGameEnd(winner);
      return;
    }

    if (!isPlayerNext && !gameOver) {
      const timer = setTimeout(() => {
        const bestMove = findBestMove([...board]);
        if (bestMove !== null) {
          const newBoard = [...board];
          newBoard[bestMove] = 'O';
          setBoard(newBoard);
          setIsPlayerNext(true);
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [board, isPlayerNext, gameOver]);

  const renderSquare = (index) => {
    return (
      <button
        className="tictactoe-square"
        onClick={() => handleClick(index)}
      >
        {board[index] === 'X' && <span className="x-mark">X</span>}
        {board[index] === 'O' && <span className="o-mark">O</span>}
      </button>
    );
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
          <div className="tictactoe-board">
            <div className="board-row">
              {renderSquare(0)}
              {renderSquare(1)}
              {renderSquare(2)}
            </div>
            <div className="board-row">
              {renderSquare(3)}
              {renderSquare(4)}
              {renderSquare(5)}
            </div>
            <div className="board-row">
              {renderSquare(6)}
              {renderSquare(7)}
              {renderSquare(8)}
            </div>
          </div>
          <div className="game-controls">
            <p>You are X, AI is O</p>
            <p>Click any square to start!</p>
            {!isPlayerNext && !gameOver && (
              <p className="ai-thinking">AI is thinking... 🤔</p>
            )}
          </div>
        </div>
        <div className="scoreboard-sidebar">
          <h3>Top Players</h3>
          <div className="scoreboard-table">
            <table>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {topScores.map((score, index) => (
                  <tr key={score.id}>
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
};

export default TicTacToe; 