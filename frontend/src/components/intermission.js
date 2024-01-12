// Intermission.js

import React, { useEffect, useRef, useState } from "react";
import "./intermission.css";

function Intermission({ socket, players, roundResults, image, playerAnswers }) {
  const getPlayerAnswer = (playerId) => {
    const answerObject = playerAnswers.find((answer) => answer.player === playerId);
    return answerObject ? answerObject.answer : "";
  };

  return (
    <div className="intermission-section">
      <ul className="player-list">
        {players.map((player, index) => (
          <li key={index} className="player-item intermission">
            {player.isHost && '👑'} {player.username} - {player.score} - Answer: {getPlayerAnswer(player._id)}
          </li>
        ))}
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
