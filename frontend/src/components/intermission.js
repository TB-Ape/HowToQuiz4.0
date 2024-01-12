// Intermission.js

import React, { useEffect, useRef, useState } from "react";
import "./intermission.css";

function Intermission({ socket, players, roundResults, image, playerAnswers }) {
  const [animatedScores, setAnimatedScores] = useState([...players.map(player => player.score)]);

  const getPlayerAnswer = (playerId) => {
    const answerObject = playerAnswers.find((answer) => answer.player === playerId);
    return answerObject ? answerObject.answer : "";
  };

  useEffect(() => {
    const animationDuration = 1000; // Adjust as needed
    const interval = 50; // Adjust as needed
    const steps = animationDuration / interval;

    const updateScores = () => {
      setAnimatedScores((prevScores) =>
        prevScores.map((score, index) => {
          const matchingResults = roundResults.filter((result) => result.player._id === players[index]._id);
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

  return (
    <div className="intermission-section">
      <ul className="player-list">
        {players.map((player, index) => {
          const matchingResults = roundResults.filter((result) => result.player._id === player._id);
          const animationClass = matchingResults.length ? "show-animation" : "";

          return (
            <li key={index} className="player-item intermission">
              {player.isHost && '👑'} {player.username} - {Math.round(animatedScores[index])}
              <div className="answer-item">{getPlayerAnswer(player._id)}</div>
              {matchingResults.length > 0 && (
                <div>
                  {matchingResults.map((result, idx) => (
                    <div className={`animation-text ${animationClass}`} style={{ animationDelay: `${index + 1 * 1}s` }} key={idx}> {result.from} </div>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <h1 className="round-results">Round Results</h1>
      <h2>{roundResults[0].correctAnswer}</h2>
      <div className="game-image">
        <img className="game-image" src={image} alt="Game Screen" />
      </div>
    </div>
  );
}

export default Intermission;
