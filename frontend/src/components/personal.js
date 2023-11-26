import { useEffect, useState } from "react";
import { TextInput } from "react"
import Login from "./login"
import Host from "./host"
import GameP from "./gameP"
import { useParams } from "react-router-dom"
function Personal(props) {
    const [loggedIn, setloggedIn] = useState(false);
    const [isHost, setIsHost] = useState(false);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [roomCode, setRoomCode] = useState("");
    const roomparam = useParams();
    const [username, setUserName] = useState("")
    const [player, setPlayer] = useState("");
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
            setPlayer(data.player);
        });
    }, []);
        if (loggedIn && isHost && !isGameStarted)
            return < Host socket={props.socket} roomCode={roomCode} />
        else if (loggedIn && !isHost && !isGameStarted)
            return (<div>
                <text>
                    Waiting....
                </text>
            </div>
            );
    
    else if (isGameStarted)
            return <GameP username={username} roomCode={roomCode} player={player} socket={props.socket} />
        else
            return <Login socket={props.socket} roomCode={roomCode} setRoomCode={setRoomCode} username={username} setUserName={setUserName} />

}
export default Personal;