import { useEffect, useState } from "react";
import { TextInput } from "react"


function Results(props) {
    const [image, setImage] = useState("");
    const sortedPlayers = props.players.slice().sort((a, b) => b.score - a.score);

    useEffect(() => {
        props.socket.on("image", (data) => {
            setImage(data.image);
        });
        props.socket.on("updateScore", (data) => {

        });
    }, []);
    return (
        <div>
            <div>
            </div>
            <ul>
                {sortedPlayers.map((player, index) => (
                    <li key={index}>
                        {index < 3 && index === 0 && '🥇'}
                        {index < 3 && index === 1 && '🥈'}
                        {index < 3 && index === 2 && '🥉'}
                        {player.isHost && '👑'} {player.username} - {player.score}
                    </li>
                ))}
            </ul>
        </div>
    );

}
export default Results;