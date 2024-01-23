import React, { useEffect, useState } from "react";
import './gameS.css';

import answeredSound from '../sounds/answer.wav'; // replace with the actual path

import answered2Sound from '../sounds/answer2.wav'; // replace with the actual path

function GameS(props) {
    const sortedPlayers = [...props.players].sort((a, b) => b.score - a.score);
    const [answeredPlayers, setAnsweredPlayers] = useState([]);
    const [answered2Players, setAnswered2Players] = useState([]);
    const [showChooseAnswerText, setShowChooseAnswerText] = useState(true);

    const playAnsweredSound = () => {
        const audio = new Audio(answeredSound);
        audio.play();
    };
    const playAnswered2Sound = () => {
        const audio = new Audio(answered2Sound);
        audio.play();
    };
    useEffect(() => {
        const handleAnswered = (data) => {
            console.log("answer received: ", data);
            setAnsweredPlayers((prevAnsweredPlayers) => [...prevAnsweredPlayers, data.player]);
            playAnsweredSound(); // Play sound when player answers
        };

        const handleAnswered2 = (data) => {
            console.log("answer2 received: ", data);
            setAnswered2Players((prevAnswered2Players) => [...prevAnswered2Players, data.player]);
            playAnswered2Sound(); // Play sound when player answers
        };

        props.socket.on("answered", handleAnswered);
        props.socket.on("answered2", handleAnswered2);

        // Cleanup the socket event listeners when the component unmounts
        return () => {
            props.socket.off("answered", handleAnswered);
            props.socket.off("answered2", handleAnswered2);
        };

    }, [props.socket]);

    // Log the updated arrays whenever they change
    useEffect(() => {
        console.log("Updated answeredPlayers array:", answeredPlayers);
        setShowChooseAnswerText(answeredPlayers.length !== props.players.length);
    }, [answeredPlayers, props.players]);

    useEffect(() => {
        console.log("Updated answered2Players array:", answered2Players);
        // Update the state to trigger the transition effect
        setShowChooseAnswerText(answered2Players.length !== props.players.length);
    }, [answered2Players, props.players]);

    return (
        <div className="game-container">
            <ul className="player-list">
                {sortedPlayers.map((player, index) => (
                    <li
                        key={index}
                        className={`player-item ${answeredPlayers.some(answeredPlayer => answeredPlayer.socketId === player.socketId) ? "answered" : ""} ${answered2Players.some(answered2Player => answered2Player.socketId === player.socketId) ? "answered2" : ""}`}
                    >
                        {player.isHost && '👑'} {player.username} - {player.score}
                    </li>
                ))}
            </ul>
            <div className="round-container">
                <div className="round-counter">Round: {props.currentRound}/{props.rounds}</div>
            </div>
            <div className="game-screen-section">
                <div className="section-header">
                    <h2 className="section-title">WIKIHOW GAME</h2>
                </div>
                <div className="game-image">
                    <img className="game-image" src={props.image} alt="Game Screen" />
                    <h2 className={`instruction ${showChooseAnswerText ? "choose-answer" : "type-answer"}`}>
                        {showChooseAnswerText ? "Type your answer on your device" : "Choose an answer on your device"}
                    </h2>
                </div>
            </div>
        </div>
    );
}

export default GameS;
