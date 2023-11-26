import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import GameS from "./gameS"
import { useParams } from "react-router-dom"
function Lobby(props) {
    const [playerList, setPlayerList] = useState([]);
    const [roomCode, setRoomCode] = useState([]);
    
    const [gameStarted, setGameStarted] = useState(false);
    const [image, setImage] = useState("");

    const roomparam = useParams();

    function getRoomId() {
        props.socket.emit("requestRoomCode");
    }

    useEffect(() => {
        getRoomId();

        props.socket.on("send_RoomCode", (data) => {
            setRoomCode(data.roomCode);
        });

        props.socket.on("updatePlayers", (data) => {
            console.log(data.players);

            // Check if data.players is an array before mapping
            if (Array.isArray(data.players)) {
                setPlayerList(data.players);
            } else {
                // Handle the case where data.players is not an array
                console.error("Received non-array data for players:", data.players);
            }
        });
        props.socket.on("gameStart", (data) => {
            console.log("gameStart");
            setGameStarted(true);
        });

    }, []);
    if (!gameStarted) 
        return (
            <>
                <h1>Room Code:</h1>
                <h1>{roomCode}</h1>
                <h1>Players:</h1>
                <ul>
                    {playerList.map((players, index) => (
                        <li key={index}>{players}</li>
                    ))}
                </ul>
            </>
        );
    else
        return <GameS socket={props.socket} />
}

export default Lobby;
