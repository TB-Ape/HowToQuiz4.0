﻿import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import Intermission from "./intermission";
import GameS from "./gameS";
import Result from "./results";
import { useParams } from "react-router-dom";
import './lobby.css';

function Lobby(props) {
    const params = useParams();
    const [playerList, setPlayerList] = useState([]);
    const [roomCode, setRoomCode] = useState("");
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [intermission, setIntermission] = useState(false);
    const [QrUrl, setQrUrl] = useState("");
    const [roundResults,setRoundResults] = useState([]);
    const [playerAnswers, setPlayerAnswers] = useState([]);
    const [image, setImage] = useState("");
    const [currentRound, setCurrentRound] = useState('');
    const [rounds, setRounds] = useState('');
    function getRoomId() {
        setRoomCode(params.room);
        setQrUrl("game.tbape.net/" + roomCode);
        if (params.room == "" || params.room == null) {
            props.socket.emit("requestRoomCode");
        } else {
            props.socket.emit("RoomCode", { roomCode: params.room });
        }
    }

    useEffect(() => {
        getRoomId();
        const setRoundCount = (data) => {
            console.log("RoundCount received:", data);
            setCurrentRound(data.currentRound);
            setRounds(data.rounds);
        };
        props.socket.on("send_RoomCode", (data) => {
            setRoomCode(data.roomCode);
            setQrUrl("game.tbape.net/p/" + data.roomCode);
        });

        props.socket.on("updatePlayers", (data) => {
            if (Array.isArray(data.players)) {
                setPlayerList(data.players);
            } else {
                console.error("Received non-array data for players:", data.players);
            }
        });

        props.socket.on("gameStart", (data) => {
            setGameStarted(true);
            setGameOver(false);
            setIntermission(false);
        });

        props.socket.on("gameOver", (data) => {
            setGameOver(true);
            setIntermission(false);
            
        });

        props.socket.on("roundOver", (data) => {
            setIntermission(true);

            setRoundResults(data.roundResults);
        });
        props.socket.on("playerAnswers", (data) => {
            setPlayerAnswers(data.playerAnswers);
        });
        props.socket.on("roundStart", (data) => {
            setIntermission(false);
        });
        props.socket.on("nextRound",(data) =>{
            setIntermission(false);
        })
        props.socket.on("RoundCount", setRoundCount);
    }, []);
    useEffect(() => {
        props.socket.on("image", (data) => {
            setImage(data.image);
        });
    }, [props.socket]);
    useEffect(() => {
        window.history.replaceState(null, "New Page Title",  roomCode);
    }, [roomCode]);

    return (


        
            
            !gameStarted && !gameOver && !intermission ? (
                <div className="lobby-container">
                     <ul className="player-list">
                                {playerList.map((player, index) => (
                                    <li key={index} className="player-item">
                                        {player.isHost && '👑'} {player.username}
                                    </li>
                                ))}
                            </ul>
                <div className="game-info-section">
                <div>
                    <h1 className="game-title">WIKIHOW GAME</h1>
                </div>
                <div className="game-info">

                        <div className = "QRINFO" >
                            <QRCode
                                size={256}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                value={QrUrl}
                                viewBox={`0 0 256 256`}
                             />
                             <div className="room-info">
                             <h1>Scan the QR-Code<br></br> or go to <br></br> game.tbape.net/p</h1>
                             <h2>Room Code:</h2>
                            <h1 className="room-code">{roomCode}</h1>
                            </div>
                        </div>
                    </div>
                    </div>
                    </div>
            ) : (
                intermission ? (
                    <Intermission socket={props.socket} players={playerList} roundResults ={roundResults} image={image} playerAnswers ={playerAnswers} currentRound = {currentRound} rounds = {rounds} gameOver={gameOver}/>
                ) : (
                    gameOver ? (
                        <Intermission socket={props.socket} players={playerList} roundResults ={roundResults} image={image} playerAnswers ={playerAnswers} currentRound = {currentRound} rounds = {rounds} gameOver={gameOver}/>
                    ) : (
                        <GameS socket={props.socket} players={playerList} image={image} currentRound = {currentRound} rounds = {rounds}/>
                    )
                )
            )
        

        

    )
}

export default Lobby;
