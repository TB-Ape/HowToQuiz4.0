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
    const [GameStarted, setGameStarted] = useState(false);
    const [roomCode, setRoomCode] = useState("");
    const params = useParams();
    const [username, setUserName] = useState("")
    const [player, setPlayer] = useState("");
    const [errorMessage, setErrorMessage] = useState('');
    const [gameOver, setGameOver] = useState(false);
    const [intermission, setIntermission] = useState(false);
   
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
        if (params.room != "" || params.room != null) {
            setRoomCode(params.room)
        }
        const unloadCallback = (event) => {
          event.preventDefault();
          event.returnValue = "";
          return "";
        };
      
        window.addEventListener("beforeunload", unloadCallback);
        return () => window.removeEventListener("beforeunload", unloadCallback);
      }, []);
    useEffect(() => {
        props.socket.on("isHost", (data) => {
            setIsHost(data.isHost);
        });
        props.socket.on("gameStart", (data) => {
            setGameStarted(true);
            setGameOver(false);
            setIntermission(false);
        });

        props.socket.on("gameOver", (data) => {
            setGameOver(true);
            setIntermission(false);
            setGameStarted(false);
            
        });
        props.socket.on("nextRound", (data) => {
            setIntermission(false);
        });

        props.socket.on("roundOver", (data) => {
            setIntermission(true);
        });

        props.socket.on("roundStarted", (data) => {
            setIntermission(false);
        });
        props.socket.on("logged_in", (data) => {
            setloggedIn(data.loggedin);
            if (data.loggedin == true)
                setPlayer(data.player);
            else
                console.error("Wrong room code");
        });
    }, []);
    if (loggedIn && isHost && !GameStarted)
    return < Host socket={props.socket} roomCode={roomCode} gameOver={gameOver} intermission={intermission}/>
    else if (loggedIn && !isHost && !GameStarted  )
            return (
                <div className="waiting-section">
                    <div className="waiting-content">
                        <p>Hang tight, the game is about to start!</p>
                        <div className="loading-spinner"></div>
                    </div>
                </div>

            );
    else if(loggedIn && GameStarted && intermission && !isHost)
            return (
                <div className="waiting-section">
                <div className="waiting-content">
                    <p>Hang tight, the next round is about to start!</p>
                    <div className="loading-spinner"></div>
                </div>
            </div>) 
    else if(((loggedIn && GameStarted && intermission)||gameOver) && isHost)
        return < Host socket={props.socket} roomCode={roomCode} gameOver={gameOver} intermission={intermission}/>
    else if (loggedIn && GameStarted)
            return <GameP username={username} roomCode={roomCode} player={player} socket={props.socket} />
    else
            return <Login socket={props.socket} roomCode={roomCode} setRoomCode={setRoomCode} username={username} setUserName={setUserName} errorMessage={errorMessage} />

}
export default Personal;