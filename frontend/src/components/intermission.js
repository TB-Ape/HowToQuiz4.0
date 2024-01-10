// Intermission.js

import React, { useEffect, useRef, useState } from "react";
import "./intermission.css";

function Intermission({ socket, players, roundResults, image }) {
  const [pointsAnimations, setPointsAnimations] = useState([]);

  const animatePoints = () => {
    const animations = [];

    roundResults.forEach((result, index) => {
      const pointsText = `${result.points} Pts from ${result.from}`;

      animations.push(
        setTimeout(() => {
          setPointsAnimations((prevAnimations) => [
            ...prevAnimations,
            { username: result.player.username, pointsText },
          ]);
        }, index * 2000) // 2000ms (2 seconds) delay between animations
      );
    });

    // Clear timeouts when component unmounts
    return () => animations.forEach((animation) => clearTimeout(animation));
  };

  useEffect(() => {
    // Trigger animation for point details after component mounts
    animatePoints();

    // Cleanup function to clear timeouts when component unmounts
    return () => setPointsAnimations([]);
  }, []);

  return (
    <div className="intermission-section">
      <h1 className="round-results">Round Results</h1>
      <h2>{roundResults[0].correctAnswer}</h2>
      <div className="game-image">
        <img className="game-image" src={image} alt="Game Screen" />
      </div>
      <ul className="player-details">
        {roundResults.map((result, index) => (
          <li key={index} className="player-item">
            <p>
              <span className="point-details">
                {result.player.username}
              </span>
            </p>
            {pointsAnimations.map((animation, animationIndex) =>
              animationIndex === index ? (
                <div
                  key={animationIndex}
                  className="point-popup animate-points"
                >
                  +{animation.pointsText}
                </div>
              ) : null
            )}
          </li>
        ))}
      </ul>
      {/* Add any additional content or actions you want during intermission */}
    </div>
  );
}

export default Intermission;
