import { useEffect, useState } from "react";
import { TextInput } from "react"


function GameP(props) {
    const [answer, setAnswer] = useState("");
    const [buttondis, setButtonDis] = useState(false);
    function sendAnswer() {
        props.socket.emit("Answer", { roomCode: props.roomCode, answer: answer, player: props.player });
        setButtonDis(true);
    };
        return (<div>
            <text>
                <div>
                    <label htmlFor="answer">Answer</label>
                    <br />
                    <input
                        type="text"
                        id="answer"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                    />
                </div>
                <div>
                    <button disabled={buttondis}
                        onClick={sendAnswer}
                    >
                        Enter
                    </button>
                </div>
            </text>
        </div>
        );

}
export default GameP;