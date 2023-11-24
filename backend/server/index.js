const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
var { nanoid } = require("nanoid")
app.use(cors());
console.log(process.version)
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/wikihow2", {
    useNewUrlParser: true,
   useUnifiedTopology: true,
});
const roomModel = require("../models/room");
const articleModel = require("../models/article");
const playerModel = require("../models/player");
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "http://localhost:3000", methods: ["GET", "POST"] },
});


async function insertRoom(RoomCode) {
    newRoom = new roomModel({
        code: RoomCode,
        host: null,
        players: [],
        rounds: -1,
        currentRound: -1,
        currentTurn: -1,
        currentArticle: null,
        playerAnswers: []
    });
    await newRoom.save();
    return newRoom;
}
async function insertNewPlayer(Username,socketid) { 
    newPlayer = new playerModel({
        username: Username,
        socketId: socketid,
        score: 0,
        present: true
    });
    return await newPlayer.save();  
}
async function removePlayerbyS(socketid) {
    Player = await playerModel.deleteOne({ socketId: socketid });
    Rooms = await roomModel.find({ "players.socketId": socketid });
    for (const Room of Rooms) {
        Room.players.pull({ socketId: socketid });
    }
}
async function getPlayers(roomCode) {
    room = await roomModel.findOne({ code: roomCode });
    const usernames = await room.players.map(player => player.username);
    return usernames;
}
async function addPlayerToRoom(username, roomCode,socket) {
    Room = await roomModel.findOne({ 'code': roomCode });
    newPlayer = await insertNewPlayer(username,socket.id);
    console.log(newPlayer);
    Room.players.push(newPlayer);
    if (Room.host == null) {
        console.log("setHost", newPlayer.username);
        Room.host = newPlayer;
        socket.emit("isHost", { isHost: true });
    }
    await Room.save();
    return newPlayer;
}

async function prepareNewRound(socket,roomCode) {
    //getArticle 
    socket.to()
    const article = await getRandomArticle();
    console.log(article);
    socket.to(roomCode).emit("image", { image: article.image });
    
   //sendFormularToPersonalScreen
}
async function getRandomArticle() {
    articles = await articleModel.aggregate(
        [{ $sample: { size: 1 } }]
    )
    console.log(articles);
    return articles[0];
}
async function insertAnswer(roomCode, player,answer) {
    room = await roomModel.findOne({ code: roomCode });
    await room.playerAnswers.push({ player: player, answer: answer });
    await room.save();
}

async function getPlayerAnswersCount(roomCode) {
  try {
    const result = await roomModel.aggregate([
      { $match: { code: roomCode } },
      { $project: { playerAnswersCount: { $size: "$playerAnswers" } } }
    ]);

    if (result.length > 0) {
      return result[0].playerAnswersCount;
    } else {
      // Room not found
      return 0;
    }
  } catch (error) {
    console.error("Error getting player answers count:", error);
    throw error;
  }
}
async function getPlayersCount(roomCode) {
    try {
        const result = await roomModel.aggregate([
            { $match: { code: roomCode } },
            { $project: { playersCount: { $size: "$players" } } }
        ]);

        if (result.length > 0) {
            return result[0].playersCount;
        } else {
            // Room not found
            return 0;
        }
    } catch (error) {
        console.error("Error getting players count:", error);
        throw error;
    }
}
io.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    socket.on("send_credentials", async (data) => {
        console.log("Credentials: ", data);
        player = await addPlayerToRoom(data.username, data.roomCode,socket);
        socket.join(data.roomCode);
        socket.emit("logged_in", { loggedin: "true", player: player});
        console.log("data: ", data);
        const Players = await getPlayers(data.roomCode);
        console.log("PlayerList", { Players });
        socket.to(data.roomCode).emit("updatePlayers", { players: Players });
    });
    socket.on("requestRoomCode", (data) => {
        RoomCode = nanoid(5);
        insertRoom(RoomCode);
        socket.join(RoomCode);
        socket.emit("send_RoomCode", { roomCode: RoomCode });
        console.log("room code: ", RoomCode);
    });
    socket.on("gameStartRequest", async (data) => {
        console.log("gameStart");
        io.in(data.roomCode).emit("gameStart");
        await prepareNewRound(socket,data.roomCode);
    });
    socket.on('disconnect', () => {
     //   removePlayerbyS(socket.id);
        console.log(`🔥: ${socket.id} disconnected`);
    });
    socket.on("Answer", async (data) => {
        console.log("Answer:", data);
        await insertAnswer(data.roomCode, data.player, data.answer);

        AnswerCount = await getPlayerAnswersCount(data.roomCode);
        PlayerCount = await getPlayersCount(data.roomCode);

        if (0 <= PlayerCount - AnswerCount)
            console.log("start turn2");
    })
});
server.listen(3001, () => {
    console.log("listening on *:3001");
});