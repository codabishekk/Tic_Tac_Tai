import React, { useEffect, useState } from "react";
import ScoreBoard from "./components/ScoreBoard";
import GameBoard from "./components/GameBoard";
import { checkWinner } from "./utils/Winner";
import { getAIMoveFromOpenRouter } from "./utils/aiOpenRouter";

const App = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [score, setScore] = useState({ X: 0, O: 0 });

  const handleClick = (i) => {
    if (!isPlayerTurn || board[i] || winner) return;

    const newBoard = [...board];
    newBoard[i] = "X";
    setBoard(newBoard);
    setIsPlayerTurn(false);
  };

  useEffect(() => {
    if (winner) return;

    const result = checkWinner(board);

    if (result?.winner) {
      setWinner(result.winner);

      if (result.winner === "X" || result.winner === "O") {
        setScore((prev) => ({
          ...prev,
          [result.winner]: prev[result.winner] + 1,
        }));
      }

      return; // stop effect once winner found
    }

    // AI TURN
    if (!isPlayerTurn && !winner) {
      const aiTurn = async () => {
        const move = await getAIMoveFromOpenRouter(board);

        if (move !== null && board[move] === null) {
          const newBoard = [...board];
          newBoard[move] = "O";
          setBoard(newBoard);
          setIsPlayerTurn(true);
        }
      };

      const timeout = setTimeout(aiTurn, 600);
      return () => clearTimeout(timeout);
    }
  }, [board, isPlayerTurn, winner]);

  const restartGame = () => {
    setBoard(Array(9).fill(null)); // FIXED
    setIsPlayerTurn(true);
    setWinner(null);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Tic Tac Toe</h1>

      <ScoreBoard score={score} />

      <GameBoard board={board} handleClick={handleClick} />

      {winner && (
        <div className="mt-4 px-4 py-2 bg-[#38BDF8] text-black rounded hover:bg-[#0EA5E9]">
          {winner === "Draw" ? "It's a draw" : `${winner} wins!`}

          <button
            className="ml-4 px-2 py-1 bg-black text-white rounded"
            onClick={restartGame}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
