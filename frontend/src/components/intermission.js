import React, { useEffect, useState } from "react";
import "./intermission.css";

function Intermission({ socket, players, roundResults, image, playerAnswers, currentRound, rounds, gameOver }) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const [animatedScores, setAnimatedScores] = useState([...sortedPlayers.map(player => player.score)]);
  const [winnerIndex, setWinnerIndex] = useState(null);
  const [numColumns, setNumColumns] = useState(3); // Initial number of columns

  const getPlayerAnswer = (playerId) => {
    const answerObject = playerAnswers.find((answer) => answer.player === playerId);
    return answerObject ? answerObject.answer : "";
  };

  useEffect(() => {
    const animationDuration = 1000; // Adjust as needed
    const interval = 50; // Adjust as needed
    const steps = animationDuration / interval;
    setAnimatedScores((prevScores) =>
      prevScores.map((score, index) => {
        const matchingResults = roundResults.filter((result) => result.player._id === sortedPlayers[index]._id);
        const totalPoints = matchingResults.reduce((sum, result) => sum + result.points, 0);
        return score - totalPoints;
      })
    );
    const updateScores = () => {
      setAnimatedScores((prevScores) =>
        prevScores.map((score, index) => {
          const matchingResults = roundResults.filter((result) => result.player._id === sortedPlayers[index]._id);
          const totalPoints = matchingResults.reduce((sum, result) => sum + result.points, 0);
          return score + totalPoints / steps;
        })
      );
    };

    let step = 0;
    const scoreAnimationInterval = setInterval(() => {
      if (step < steps) {
        updateScores();
        step++;
      } else {
        clearInterval(scoreAnimationInterval);
      }
    }, interval);

    return () => {
      clearInterval(scoreAnimationInterval);
    };
  }, [roundResults, players]);

  useEffect(() => {
    if (gameOver) {
      const winner = sortedPlayers[0];
      const winnerIndex = sortedPlayers.findIndex((player) => player._id === winner._id);
      setWinnerIndex(winnerIndex);
    }
  }, [gameOver, players, sortedPlayers]);

  useEffect(() => {
    // Calculate number of columns based on viewport height
    const calculateColumns = () => {
      const numPlayers = sortedPlayers.length;
      const windowHeight = window.innerHeight;
      const listItemHeight = 150; // Adjust as needed
      const maxColumns = Math.ceil(numPlayers / Math.floor(windowHeight / listItemHeight));
      setNumColumns(Math.min(maxColumns, numPlayers)); // Ensure number of columns doesn't exceed number of players
    };

    calculateColumns(); // Calculate columns initially
    window.addEventListener("resize", calculateColumns); // Recalculate on window resize
    return () => window.removeEventListener("resize", calculateColumns); // Cleanup

  }, [sortedPlayers]);

  return (
    <div className="intermission-section">
      <div className="round-container">
        <div className="round-counter">Round: {currentRound}/{rounds}</div>
      </div>
      <ul className="player-list" style={{ gridTemplateColumns: `repeat(${numColumns}, 1fr)` }}>
        {sortedPlayers.map((player, index) => {
          const matchingResults = roundResults.filter((result) => result.player._id === player._id);
          const animationClass = matchingResults.length ? "show-animation" : "";
          const winnerClass = gameOver && index === winnerIndex ? "winner" : "";

          return (
            <li key={index} className={`player-item intermission ${winnerClass}`}>
              {gameOver && (
                <>
                  {index < 3 && index === 0 && '🥇'}
                  {index < 3 && index === 1 && '🥈'}
                  {index < 3 && index === 2 && '🥉'}
                </>
              )}
              {player.isHost && '👑'} {player.username} - {Math.round(animatedScores[index])}
              <div className="answer-item">{getPlayerAnswer(player._id)}</div>
              {matchingResults.length > 0 && (
                <div>
                  {matchingResults.map((result, idx) => (
                    <div
                      className={`animation-text ${animationClass}`}
                      style={{ animationDelay: `${index + 1 * 1}s` }}
                      key={idx}
                    >
                      {' '}
                      {result.from}{' '}
                    </div>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <h1 className="round-results">{gameOver ? "GAME OVER" : "ROUND RESULTS"}</h1>
      <h2>{roundResults[0].correctAnswer}</h2>
      <div className="game-image">
        <img className="game-image" src={image} alt="Game Screen" />
      </div>
    </div>
  );
}

export default Intermission;
