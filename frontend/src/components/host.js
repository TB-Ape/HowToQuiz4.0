import { useEffect, useState } from "react";
import { TextInput } from "react"
import './host.css'
function Host(props) {
    function startGame() {
        props.socket.emit("gameStartRequest", {roomCode : props.roomCode });
        console.log("gameStart clicked");
    }
    function startNewGame() {
        props.socket.emit("NewGameStartRequest", { roomCode: props.roomCode });
        console.log("gameStart clicked");
    }
    if (!props.gameOver) {
        return (
            <div className="start-game-button">
                <button onClick={startGame}>
                    Start Game
                </button>
            </div>);
    }
    else if (props.gameOver) {
        return (
            <div className="start-game-button">
                <button onClick={startNewGame}>
                    Start New Game
                </button>
            </div>);
    }

}
export default Host;