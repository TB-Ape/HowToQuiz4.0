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
const { platform } = require("os");

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
    Player = await playerModel.findOne({socketId: socketid});
    if(Player){
    delplayer = await playerModel.deleteOne({ socketId: socketid });
    Rooms = await roomModel.find({ "players": { $in: [Player._id] } });
    for (const Room of Rooms) {
        Room.players.pull(Player._id); // Use Player._id directly
        await Room.save(); // Save the modified room
    }
    if(Rooms.length >= 1){
        return Rooms[0].roomCode;
    }
    else
    {
        return null;
    }
}
return null;
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
    socket.to(roomCode).emit("RoundCount",{currentRound:room.currentRound,rounds: room.rounds})
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
    const pointDetails  = [];
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
            //Right Answer
            console.log('entry2: ', entry2);
            const Winner = await room.players.find(player => player._id.equals(entry2.player._id));
            console.log('winner: ', Winner);
            Winner.score = await Winner.score + 10;
            await room.save();
            await Winner.save();
            const playerAnswer = await findPlayerAnswer(roomCode,Winner._id);
            console.log(entry2.answer + " is the right answer?")
            pointDetails.push({ player: Winner, answer: entry2.answer, points: 10, playerAnswer: playerAnswer, from: "correct Answer",correctAnswer: room.currentArticle.title });
            
        }
        else {
            //Player Answer
            console.log('match: ', match);
            const Winner = await room.players.find(player => player._id.equals(match.player._id));
            console.log('winner: ', Winner);
            Winner.score = await Winner.score + 10;
            await room.save();
            await Winner.save();
            const playerAnswer = await findPlayerAnswer(roomCode,Winner._id);
            const giver = await room.players.find(player => player._id.equals(entry2.player._id));
            console.log(Winner.username + " gets 10 Points from", giver.username +" ?");
            pointDetails.push({ player: Winner, answer: entry2.answer, points: 10, playerAnswer: playerAnswer, from: giver.username, correctAnswer: room.currentArticle.title});

        }
    }
    return pointDetails;
}
async function getArticleById(articleId) {
    try {
      // Validate that the provided articleId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(articleId)) {
        throw new Error('Invalid ObjectId');
      }
  
      // Find the article by ObjectId
      const article = await articleModel.findById(articleId);
  
      if (!article) {
        throw new Error('Article not found');
      }
  
      return article;
    } catch (error) {
      console.error('Error getting article by ObjectId:', error);
      throw error;
    }
  }
  
  // Example usage
  const articleId = '63d989413b704cbfb9e7511f';
  getArticleById(articleId)
    .then((article) => {
      console.log('Found Article:', article);
    })
    .catch((error) => {
      console.error('Error:', error.message);
    });
async function findPlayerAnswer(roomCode, playerId) {
    try {
      const room = await getRoom(roomCode);
      
      if (!room) {
        return null; // Room not found
      }
  
      const playerAnswer = room.playerAnswers.find(answer => answer.player.equals(playerId));
  
      return playerAnswer;
    } catch (error) {
      console.error('Error finding player answer:', error);
      return null;
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
async function startNextRound(socket,roomCode)
{
    io.to(roomCode).emit("nextRound");
    await prepareNewRound(socket, roomCode);
    
}
function handleConnection(socket){
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
        var nRoomCode = nanoid(5);
        RoomCode = nRoomCode.toUpperCase();
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
            socket.join(roomCode);
            socket.emit("send_RoomCode", { roomCode: room.code });
        }
    });

    socket.on('disconnect', async() => {
        var Players;
        console.log(`🔥: ${socket.id} disconnected`);
        roomCode = await removePlayerbyS(socket.id);
        if(roomCode != null)
        {
            Players = await getPlayers(roomCode);
            socket.to(roomCode).emit("updatePlayers", { players: Players });
        }
        
        
       
    });
    socket.on("Answer", async (data) => {
        console.log("Answer:", data);
        await insertAnswer(data.roomCode, data.player, data.answer);

        AnswerCount = await getPlayerAnswersCount(data.roomCode);
        PlayerCount = await getPlayersCount(data.roomCode);

        if (0 === PlayerCount - AnswerCount){
            prepareTurn2(socket, data.roomCode);
        }
        socket.to(data.roomCode).emit("answered",{player: data.player});
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
            const roundResults = await calcPoints(socket, data.roomCode);
            const Players = await getPlayers(data.roomCode);
            console.log(Players);
            socket.to(data.roomCode).emit("updatePlayers", { players: Players });
            if (room.rounds == room.currentRound) {
                console.log("GAME OVER");
                socket.to(data.roomCode).emit("roundOver",{roundResults: roundResults});
                socket.emit("roundOver",{roundResults: roundResults});
                socket.to(data.roomCode).emit("gameOver");
                socket.emit("gameOver");
                
            }
            else {
                const playerAnswers = await room.playerAnswers;
                socket.to(data.roomCode).emit("playerAnswers",{playerAnswers: playerAnswers});
                socket.to(data.roomCode).emit("roundOver",{roundResults: roundResults});
                socket.emit("roundOver",{roundResults: roundResults});

            }
        }
        socket.to(data.roomCode).emit("answered2",{player: data.player});
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
    socket.on("NewRoundStartRequest", async (data)=> {
        socket.emit(data.roomCode).emit("roundStart");
    });  
    socket.on("gameStartRequest", async (data) => {
        console.log("gameStart");
        io.in(data.roomCode).emit("gameStart");
        setRounds(data.rounds,data.roomCode);
        await setShowRealAnswer(data.roomCode,data.showRealAnswer);
        await prepareNewRound(socket,data.roomCode);

    });
    socket.on("newRoundRequest", async (data) =>{
        console.log("start new round");
        startNextRound(socket,data.roomCode);
    });
}
io.on('connection', handleConnection);

server.listen(3001,'0.0.0.0', () => {
    console.log("listening on *:3001");
});