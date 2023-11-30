import "./App.css";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import Login from "./components/login"
import Lobby from "./components/lobby"
import Personal from "./components/personal"
import { render } from "react-dom";
import {
    BrowserRouter,
    Routes,
    Route,
    useParams
} from "react-router-dom";

const socket = io.connect("http://localhost:3001");
//const socket = io.connect("https://b.tbape.net");
function App() {
    let { params } = useParams();
    const [username, setUsername] = useState("");
    const [roomCode, setRoomCode] = useState("");
    function sendUsername() {
        console.log("Button clicked");
        socket.emit("send_username", { username: username});
    }
    useEffect(() => {
        
    }, []);
    return (
        <BrowserRouter>
        <Routes>
                <Route path="/" element={<Personal socket={socket} />} />
                <Route path="/:room" element={<Personal socket={socket} />} />
                <Route path="/shared" element={<Lobby socket={socket} />} />
                <Route path="/shared/:room" element={<Lobby socket={socket} params={params} />}/>
        </Routes>
        </BrowserRouter>
        )
}

export default App;