import { useEffect, useState } from "react";
import { TextInput } from "react"
import Login from "./login"
import Host from "./host"
import GameP from "./gameP"
import { useParams } from "react-router-dom"
import './personal.css'
function Personal(props) {
    const [loggedIn, setloggedIn] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [roomCode, setRoomCode] = useState("");
    const roomparam = useParams();
    const [username, setUserName] = useState("")
    const [player, setPlayer] = useState("");
    const [errorMessage, setErrorMessage] = useState('');
    const [gameOver, setIsGameOver] = useState(false);

    function startNewGame() {
        props.socket.emit("startNewGame");
    }
    props.socket.on("logged_in", (data) => {
        if (data.loggedin === true) {
            setPlayer(data.player);
        } else {
            // Handle incorrect room code and set an error message
            setErrorMessage('Incorrect room code, please try again.');
        }
    });
    useEffect(() => {
        props.socket.on("isHost", (data) => {
            setIsHost(data.isHost);
        });
        props.socket.on("gameStart", (data) => {
            setIsGameStarted(true);
            console.log("game Started");
        });
        props.socket.on("logged_in", (data) => {
            setloggedIn(data.loggedin);
            if (data.loggedin == true)
                setPlayer(data.player);
            else
                console.error("Wrong room code");
        });
        props.socket.on("gameOver", (data) => {
            setIsGameStarted(false);
            setIsGameOver(true);
        });
    }, []);
    if (loggedIn && isHost && !isGameStarted)
        return < Host socket={props.socket} roomCode={roomCode} gameOver={gameOver}/>
    else if (loggedIn && !isHost && !isGameStarted  )
            return (
                <div className="waiting-section">
                    <div className="waiting-content">
                        <p>Hang tight, the game is about to start!</p>
                        <div className="loading-spinner"></div>
                    </div>
                </div>

            );
    
        else if (loggedIn && isGameStarted)
            return <GameP username={username} roomCode={roomCode} player={player} socket={props.socket} />
        else
            return <Login socket={props.socket} roomCode={roomCode} setRoomCode={setRoomCode} username={username} setUserName={setUserName} errorMessage={errorMessage}/>

}
export default Personal;