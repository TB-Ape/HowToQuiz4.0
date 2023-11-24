import { useEffect, useState } from "react";
import { TextInput } from "react"


function GameP(props) {
    const [answer, setAnswer] = useState("");
    const [buttondis, setButtonDis] = useState(false);
    const [answers2, setAnswers2] = useState([]);
    useEffect(() => {
        props.socket.on("Answers2", (data) => {
            setAnswers2(data.answers);
        });
    }, []);
    function sendAnswer() {
        props.socket.emit("Answer", { roomCode: props.roomCode, answer: answer, player: props.player });
        setButtonDis(true);

    };
    function sendAnswer2(answer) {
        props.socket.emit("Answer2", {roomCode: props.roomCode, answer: answer, player: props.player})
    }
    if (answers2.length ===0) {
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
    else
        return(
        <div>
                {answers2.map((answer, index) => (
                    <div key={index}>
                        <button onClick={() => sendAnswer2(answer)}>{answer}</button>
                    </div>
            ))}
        </div>
        );


}
export default GameP;