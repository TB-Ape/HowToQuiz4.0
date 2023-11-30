import { useEffect, useState } from "react";
import { TextInput } from "react"
import './login.css'
function Login(props) {
    console.log("Props: ",props);
    
    var roomCode;
    function joinRoom() {
        console.log("Button clicked");
        console.log("joinRoom props: ", props);
        props.socket.emit("send_credentials", { username: props.username , roomCode: props.roomCode });
    }
  


    return (
            
        
        <div className="join-form">
            {props.errorMessage && <p style={{ color: 'red' }}>{props.errorMessage}</p>}
            <div className="form-group">
                <label htmlFor="username">1. Choose a Username</label>
                <br />
                <input
                    type="text"
                    id="username"
                    value={props.username}
                    onChange={(e) => props.setUserName(e.target.value)}
                    placeholder="Enter your username"
                />
            </div>
            <div className="form-group">
                <label>2. Enter Room Code</label>
                <br />
                <input
                    type="text"
                    id="roomCode"
                    value={props.roomCode}
                    onChange={(e) => props.setRoomCode(e.target.value)}
                    placeholder="Enter the room code"
                />
            </div>
            <div className="form-group">
                <button onClick={joinRoom}>3. Join the Room</button>
            </div>
        </div>
    );
}
export default Login;
