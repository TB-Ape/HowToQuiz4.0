import { useEffect, useState } from "react";
import { TextInput } from "react"
import './gameP.css'

function GameP(props) {
    const [answer, setAnswer] = useState("");
    const [buttondis, setButtonDis] = useState(false);
    const [answers2, setAnswers2] = useState([]);
    useEffect(() => {
        props.socket.on("Answers2", (data) => {
            setAnswers2(data.answers);
            setButtonDis(false);
        });
        props.socket.on("nextRound", (data) => {
            setAnswers2([]);
            setButtonDis(false);
        });
    }, []);
    function sendAnswer() {
        setButtonDis(true);
        props.socket.emit("Answer", { roomCode: props.roomCode, answer: answer, player: props.player });
    };
    function sendAnswer2(answer) {
        setButtonDis(true);
        props.socket.emit("Answer2", { roomCode: props.roomCode, answer: answer, player: props.player })
        
    }
    return(
    <div className="answer-section">
        {answers2.length === 0 ? (
            <div className="answer-input">
                <label htmlFor="answer">Answer</label>
                <br />
                <input
                    type="text"
                    id="answer"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                />
                <br />
                <button disabled={buttondis} onClick={sendAnswer}>
                    Submit Answer
                </button>
            </div>
        ) : (
            <div className="answer-options">
                {answers2.map((answer, index) => (
                    <div key={index}>
                        <button
                            disabled={buttondis}
                            onClick={() => sendAnswer2(answer)}
                        >
                            {answer}
                        </button>
                    </div>
                ))}
            </div>
        )}
    </div>
    )

}
export default GameP;