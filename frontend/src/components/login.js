import { useEffect, useState } from "react";
import { TextInput } from "react"

function Login(props) {
    console.log("Props: ",props);
    
    var roomCode;
    function joinRoom() {
        console.log("Button clicked");
        console.log("joinRoom props: ", props);
        props.socket.emit("send_credentials", { username: props.username , roomCode: props.roomCode });
    }
    

    return (
        <>
            <div>
                <label htmlFor="username">Username</label>
                <br />
                <input
                    type="text"
                    id="username"
                    value={props.username}
                    onChange={(e) => props.setUserName(e.target.value)}
                />
            </div>
            <div>
                <label>RoomCode</label>
                <br />
                <input
                    type="text"
                    id="roomCode"
                    value={props.roomCode}
                    onChange={(e) => props.setRoomCode(e.target.value)}
                />
            </div>
            <div>
                <button
                    onClick={joinRoom}
                >
                    Enter
                </button>
            </div>
        </>



    );
}
export default Login;
