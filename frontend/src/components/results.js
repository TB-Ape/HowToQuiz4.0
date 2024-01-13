import React, { useEffect, useState } from "react";
import "./results.css"; // Add your CSS file for styling if needed
import { Fireworks } from 'fireworks/lib/react'



function Results(props) {
    let fxProps = {
        count: 3,
        interval: 200,
        canvasWidth: 400,
        canvasHeight: 400,
        colors: ['#cc3333', '#4CAF50', '#81C784'],
        calc: (props, i) => ({
          ...props,
          x: (i + 1) * (window.innerWidth / 3) - (i + 1) * 100,
          y: 200 + Math.random() * 100 - 50 + (i === 2 ? -80 : 0)
        })
    }
  const sortedPlayers = props.players.slice().sort((a, b) => b.score - a.score);
  return (
    <div className="results-section">
        <Fireworks {...fxProps} />
      <h2>GAME OVER</h2>
      <ul className="player-list">
        {sortedPlayers.map((player, index) => (
          <li key={index} className="player-item results">
            {index < 3 && index === 0 && "🥇"}
            {index < 3 && index === 1 && "🥈"}
            {index < 3 && index === 2 && "🥉"}
            {player.isHost && "👑"} {player.username} - {player.score}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Results;