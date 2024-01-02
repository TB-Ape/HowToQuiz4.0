const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
var { nanoid } = require("nanoid")
app.use(cors());
app.set('trust proxy', true);
console.log(process.version)
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/wikihow2", {
    useNewUrlParser: true,
   useUnifiedTopology: true,
});
const roomModel = require("../models/room");
const articleModel = require("../models/article");
const playerSchema= require("../models/player");
const room = require("../models/room");

const playerModel = mongoose.model('player', playerSchema.schema);
var Rounds = 5;

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
});


async function insertRoom(RoomCode) {
    newRoom = new roomModel({
        code: RoomCode,
        host: null,
        players: [],
        rounds: Rounds,
        currentRound: 0,
        currentTurn: -1,
        currentArticle: new articleModel(),
        showRealAnswer: true,
        playerAnswers: [],
        playerAnswers2: []
    });
    await newRoom.save();
    return newRoom;
}
async function insertNewPlayer(Username,socketid) { 
    newPlayer = new playerModel({
        username: Username,
        socketId: socketid,
        score: 0,
        present: true,
        isHost: false
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
async function getPlayersUsernames(roomCode) {
    var room = await getRoom(roomCode);
    const usernames = await room.players.map(player => player.username);
    return usernames;
}
async function getPlayers(roomCode) {
    var room = await getRoom(roomCode);
    const players = await room.players;
    return players;
}
async function addPlayerToRoom(username, roomCode, socket) {
    Room = await await getRoom(roomCode);
    if (Room == null) {
        return ("Room not found");
    }
    newPlayer = await insertNewPlayer(username, socket.id);
    console.log(newPlayer);
    
    if (Room.host == null) {
        console.log("setHost", newPlayer.username);
        Room.host = newPlayer;
        socket.emit("isHost", { isHost: true });
        newPlayer.isHost = true;

    }
    await Room.players.push(newPlayer._id);
    await Room.save();
    await newPlayer.save();
    return newPlayer;
}

async function prepareNewRound(socket,roomCode) {
    //getArticle 
    await clearAnswers(roomCode);
    const article = await getRandomArticle();
    console.log(article);
    var room = await getRoom(roomCode);
    room.currentArticle = article;
    room.currentTurn = 1;
    room.currentRound = room.currentRound + 1;
    await room.save();
    socket.to(roomCode).emit("image", { image: article.image });
    
   //sendFormularToPersonalScreen
}

function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}
async function getRandomArticle() {
    articles = await articleModel.aggregate(
        [{ $sample: { size: 1 } }]
    )
    console.log(articles);
    return articles[0];
}
async function insertAnswer(roomCode, player,answer) {
    var room = await getRoom(roomCode);
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
async function getPlayerAnswers2Count(roomCode) {
    try {
        const result = await roomModel.aggregate([
            { $match: { code: roomCode } },
            { $project: { playerAnswers2Count: { $size: "$playerAnswers2" } } }
        ]);

        if (result.length > 0) {
            return result[0].playerAnswers2Count;
        } else {
            // Room not found
            return 0;
        }
    } catch (error) {
        console.error("Error getting player answers2 count:", error);
        throw error;
    }
}
async function prepareTurn2(socket, roomCode) {
    //getPlayerAnswers
    var room = await getRoom(roomCode);

    playerAnswers = room.playerAnswers;
    room.currentTurn = 2;
    var article =  room.currentArticle;
    const players = await room.players;
    for (const player of players) {
        var answersToShow = [];
        for (answer of playerAnswers) {
            if (answer.player != player.id) { answersToShow.push(answer.answer) }
        }
        if(room.showRealAnswer == true){
            answersToShow.push(article.title);
        }
        console.log('socket.id: ', socket.id);
        console.log('socketid: ', player.socketId);
        shuffledAnswers = await shuffle(answersToShow);
        io.to(player.socketId).emit("Answers2", { answers: shuffledAnswers });
    }
}
async function insertAnswers2(roomCode,player,answer) {
    var room = await getRoom(roomCode);
    await room.playerAnswers2.push({ player: player, answer: answer });
    await room.save();
}

async function getRoom(roomCode) {
    var room = await roomModel.findOne({ 'code': roomCode }).populate('players').exec();
    return room;
}
async function calcPoints(socket, roomCode) {
    const room = await getRoom(roomCode);
    const players = room.players;
    const playerAnswers = room.playerAnswers;
    const playerAnswers2 = room.playerAnswers2;

    for (const entry2 of playerAnswers2) {
        var match = null;
        // Loop through each entry in playerAnswers
        for (const entry1 of playerAnswers) {
            // Compare the answers
            if (entry1.answer === entry2.answer) {
                // Do something when there's a match
                console.log(`Match found: ${entry1.answer}`);
                match = entry1;
            }
        }
        console.log('match: ', match);
        if (match === null) {
            console.log('entry2: ', entry2);
            const Winner = await room.players.find(player => player._id.equals(entry2.player._id));
            console.log('winner: ', Winner);
            Winner.score = await Winner.score + 10;
            await room.save();
            await Winner.save();
        }
        else {
            console.log('match: ', match);
            const Winner = await room.players.find(player => player._id.equals(match.player._id));
            console.log('winner: ', Winner);
            Winner.score = await Winner.score + 10;
            await room.save();
            await Winner.save();
        }
    }
}
async function setShowRealAnswer(roomCode,show)
{
    var room = await getRoom(roomCode);
    room.showRealAnswer = show;
    await room.save();
}
async function clearAnswers(roomcode)
{
    var room = await getRoom(roomcode);
    room.playerAnswers = [];
    room.playerAnswers2 = [];
    await room.save();
}

async function resetRounds(roomcode) {
    var room = await getRoom(roomcode);
    room.currentRound = 0;
    await room.save();
}
async function resetScores(roomcode) {
    var room = await getRoom(roomcode);
    var players = room.players;

    // Loop through all players and set their score to 0
    for (var player of players) {
        player.score = 0;
        await player.save();
    }

    // Save the updated room with reset scores
    
    await room.save();
}
async function setRounds(rounds, roomCode){
    var room = await getRoom(roomCode);
    room.rounds = rounds;
    await room.save();
}

io.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    socket.on("send_credentials", async (data) => {
        console.log("Credentials: ", data);
        player = await addPlayerToRoom(data.username, data.roomCode, socket);
        
        
        if (player != "Room not found") {
            socket.join(data.roomCode);
            socket.emit("logged_in", { loggedin: true, player: player });
            console.log("data: ", data);
            const Players = await getPlayers(data.roomCode);
            console.log("PlayerList", { Players });
            socket.to(data.roomCode).emit("updatePlayers", { players: Players });
        }
        else {
            socket.emit("logged_in", { loggedin: false, player:  "Room not found" });
        }
    });
    socket.on("requestRoomCode", (data) => {
        RoomCode = nanoid(5);
        insertRoom(RoomCode);
        socket.join(RoomCode);
        socket.emit("send_RoomCode", { roomCode: RoomCode });
        console.log("room code: ", RoomCode);
    });
    socket.on("RoomCode",async (data) => {
        roomCode = data.roomCode;
        const room = await getRoom(roomCode);
        if (room === null) {
            socket.emit("send_RoomCode", { roomCode: "Wrong Room Code" });
        }
        else {
            socket.join(RoomCode);
            socket.emit("send_RoomCode", { roomCode: room.code });
        }
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

        if (0 === PlayerCount - AnswerCount)
            prepareTurn2(socket, data.roomCode);
    });
    socket.on("Answer2", async (data) => {
        console.log("answer2 recieved", data);
        await insertAnswers2(data.roomCode, data.player, data.answer);
        var room = await getRoom(data.roomCode);
        AnswerCount = await getPlayerAnswers2Count(data.roomCode);
        console.log("Answer2 count:", AnswerCount);
        PlayerCount = await getPlayersCount(data.roomCode);
        console.log("Player count:", PlayerCount);
        if (0 === PlayerCount - AnswerCount) {
            await calcPoints(socket, data.roomCode);
            const Players = await getPlayers(data.roomCode);
            console.log(Players);
            socket.to(data.roomCode).emit("updatePlayers", { players: Players });
            if (room.rounds == room.currentRound) {
                console.log("GAME OVER");
                socket.to(data.roomCode).emit("gameOver");
                socket.emit("gameOver");
                
            }
            else {
                await prepareNewRound(socket, data.roomCode);
                io.to(data.roomCode).emit("nextRound");
            }
        }
    });
    socket.on("NewGameStartRequest", async (data) => {
        console.log('start new Game');
        await resetRounds(data.roomCode);
        io.in(data.roomCode).emit("gameStart");
        await resetScores(data.roomCode);
        const Players = await getPlayers(data.roomCode);
        socket.to(data.roomCode).emit("updatePlayers", { players: Players });
        setRounds(data.rounds,data.roomCode);
        await setShowRealAnswer(data.roomCode,data.showRealAnswer);
        await prepareNewRound(socket, data.roomCode);


    });
        
    socket.on("gameStartRequest", async (data) => {
        console.log("gameStart");
        io.in(data.roomCode).emit("gameStart");
        setRounds(data.rounds,data.roomCode);
        await setShowRealAnswer(data.roomCode,data.showRealAnswer);
        await prepareNewRound(socket,data.roomCode);

    });
});
server.listen(3001,'0.0.0.0', () => {
    console.log("listening on *:3001");
});