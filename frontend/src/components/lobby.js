import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import GameS from "./gameS"
import Result from "./results"
import { useParams } from "react-router-dom";
import './lobby.css'
function Lobby(props) {
    const params = useParams();
    const [playerList, setPlayerList] = useState([]);
    const [roomCode, setRoomCode] = useState("");
    
    const [gameStarted, setGameStarted] = useState(false);
    const [image, setImage] = useState("");
    const [gameOver, setGameOver] = useState(false);

    function getRoomId() {
        setRoomCode(params.room);
        if (params.room == "" || params.room == null) {
            props.socket.emit("requestRoomCode");
        }
        else {
            props.socket.emit("RoomCode", { roomCode: params.room });
        }
            
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
            setGameOver(false);
        });

        props.socket.on("gameOver", (data) => {
            console.log("gameOver");
            setGameOver(true);
        });
    }, []);
    return(
        <div className="game-info-section">
            
            {!gameStarted && !gameOver ? (
                <><div>
                    <h1 className="game-title">WIKIHOW GAME</h1>
                </div>
                <div className="game-info">

                        <div className="room-info">
                            <h2>Room Code:</h2>
                            <h1 className="room-code">{roomCode}</h1>
                        </div>
                        <div className="players-info">
                            <h2>Players:</h2>
                            <ul>
                                {playerList.map((player, index) => (
                                    <li key={index}>
                                        {player.isHost && '👑'} {player.username}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div></>
            ) : (
                gameOver ? (
                    <Result socket={props.socket} players={playerList} />
                ) : (
                    <GameS socket={props.socket} players={playerList} />
                )
            )}
        </div>

    )
}

export default Lobby;
