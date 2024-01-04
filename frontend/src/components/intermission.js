import React from "react";
import "./intermission.css"; // Import the CSS file

function Intermission({ socket, players, roundResults, image }) {
  const firstResult = roundResults[0];
  return (
    <div className="intermission-section">
      <h1>Round Results</h1>
      <h2>{firstResult.correctAnswer}</h2>
      <div className="game-image">
        <img className="game-image" src={image} alt="Game Screen" />
      </div>
      <ul>
        {roundResults.map((result, index) => (
          <li key={index}>
            <p>{result.player.username} : {result.playerAnswer.answer} | {result.points} Pts from {result.from}</p>
          </li>
        ))}
      </ul>
      {/* Add any additional content or actions you want during intermission */}
    </div>
  );
}

export default Intermission;
