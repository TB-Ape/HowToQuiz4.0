import { useEffect, useState } from "react";
import { TextInput } from "react"

function Host(props) {
    function startGame() {
        props.socket.emit("gameStartRequest", {roomCode : props.roomCode });
        console.log("gameStart clicked");
    }
    return (
        <div>
            <button
                onClick={startGame}
            >
                Start Game
            </button>
        </div>
);
}
export default Host;