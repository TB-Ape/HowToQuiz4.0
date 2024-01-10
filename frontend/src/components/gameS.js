import React, { useEffect, useState } from "react";
import './gameS.css';

function GameS(props) {
    const [answeredPlayers, setAnsweredPlayers] = useState([]);
    const [showChooseAnswerText, setShowChooseAnswerText] = useState(true);

    useEffect(() => {
        const handleAnswered = (data) => {
            console.log("data received: ", data);
            setAnsweredPlayers((prevAnsweredPlayers) => [...prevAnsweredPlayers, data.player]);
        };

        props.socket.on("answered", handleAnswered);

        // Cleanup the socket event listener when the component unmounts
        return () => {
            props.socket.off("answered", handleAnswered);
        };
    }, [props.socket]);

    // Log the updated array whenever it changes
    useEffect(() => {
        console.log("Updated array:", answeredPlayers);
        // Update the state to trigger the transition effect
        setShowChooseAnswerText(answeredPlayers.length !== props.players.length);
    }, [answeredPlayers, props.players]);

    return (
        <div className="game-container">
            <ul className="player-list">
                {props.players.map((player, index) => (
                    <li
                        key={index}
                        className={`player-item ${answeredPlayers.some(answeredPlayer => answeredPlayer.socketId === player.socketId) ? "answered" : ""}`}
                    >
                        {player.isHost && '👑'} {player.username} - {player.score}
                    </li>
                ))}
            </ul>
            <div className="game-screen-section">
                <div className="section-header">
                    <h2 className="section-title">WIKIHOW GAME</h2>
                </div>
                <div className="game-image">
                    <img className="game-image" src={props.image} alt="Game Screen" />
                    <h2 className={`instruction ${showChooseAnswerText ? "choose-answer" : "type-answer"}`}>
                        {showChooseAnswerText ?  "Type your answer on your device":"Choose an answer on your device"}
                    </h2>
                </div>
            </div>
        </div>
    );
}

export default GameS;
