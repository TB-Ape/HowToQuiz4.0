import { useState } from "react";
import { TextInput } from "react"
import './host.css'
function Host(props) {
    const [showRealAnswer, setShowRealAnswer] = useState(true);

    function handleCheckboxChange () {
        setShowRealAnswer(!showRealAnswer);
    };

    function startGame() {
        props.socket.emit("gameStartRequest", { roomCode: props.roomCode, showRealAnswer: showRealAnswer });
        console.log("gameStart clicked");
    }

    function startNewGame() {
        props.socket.emit("NewGameStartRequest", { roomCode: props.roomCode, showRealAnswer: showRealAnswer });
        console.log("gameStart clicked");
    }

    return (
        <div className="start-game">
        <div className="start-game-button">
        </div>
            <button className="buttons" onClick={props.gameOver ? startNewGame : startGame}>
                {props.gameOver ? "Start New Game" : "Start Game"}
            </button>
            <div>
            <spacer></spacer>
            </div>
            <label>Show Real Answer</label>
            <label className="toggle-switch">
            
                <input type="checkbox" id="show-real-answer" checked={showRealAnswer} onChange={handleCheckboxChange} />
                <div className="toggle-slider"></div>
                
            </label>
        
        </div>
    );
}

export default Host;





