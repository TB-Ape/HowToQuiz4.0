import React, { useEffect, useState } from "react";
import "./results.css"; // Add your CSS file for styling if needed
import { Fireworks } from 'fireworks/lib/react'



function Results(props) {
  const sortedPlayers = props.players.slice().sort((a, b) => b.score - a.score);
  return (
    <div>
    <div className="results-section">
      <h2>GAME OVER</h2>
      
    </div>
    
    <ul className="player-list-results">
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