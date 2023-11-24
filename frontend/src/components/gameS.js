import { useEffect, useState } from "react";
import { TextInput } from "react"


function GameS(props) {
    const [image, setImage] = useState("");
    useEffect(() => {
        props.socket.on("image", (data) => {
            setImage(data.image);
        });
    }, []);
    return (
        <div>
        <div>
            <text>
                Game Shared Screen
            </text>
        </div>
        <div>
            <img style={{ width: 500, height: 600 }} src={image}/>
        </div>
        </div>
    );

}
export default GameS;