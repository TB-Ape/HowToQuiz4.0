import { useState } from "react";
import './host.css';

function Host(props) {
    const [showRealAnswer, setShowRealAnswer] = useState(true);
    const [rounds, setRounds] = useState(5); // Default number of rounds is 1
    const [buttondis, setButtondis] =useState(false);
    function handleCheckboxChange() {
        setShowRealAnswer(!showRealAnswer);
    }
    function startnewRound(){
        setButtondis(true);
        props.socket.emit("newRoundRequest",{ roomCode: props.roomCode});
    }
    function handleRoundsChange(event) {
        const newRounds = parseInt(event.target.value, 10);
        setRounds(newRounds);
    }

    function startGame() {
        props.socket.emit("gameStartRequest", { roomCode: props.roomCode, showRealAnswer: showRealAnswer, rounds: rounds });
        console.log("gameStart clicked");
    }

    function startNewGame() {
        props.socket.emit("NewGameStartRequest", { roomCode: props.roomCode, showRealAnswer: showRealAnswer, rounds: rounds });
        console.log("gameStart clicked");
    }
    if(!props.intermission)
        return (
        <div className="start-game">
            <div className="start-game-button">
                {/* Your button content goes here */}
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
            <div>
                <label>Number of Rounds:</label>
                <input type="number" className="round-selector" value={rounds} onChange={handleRoundsChange} min="1"/>
            </div>
        </div>
    )
    else 
        return (
        <div>
            <button onClick={startnewRound} disabled={buttondis}>"Start new Round</button> 
        </div>)
        
}

export default Host;
