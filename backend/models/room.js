const mongoose = require("mongoose");
const playerSchema = require("./player").schema;
const articleSchema = require("./article").schema;
const { Schema } = mongoose;

const roomSchema = new Schema({
    code: String,
    host: playerSchema,
    players: [playerSchema],
    rounds: Number,
    currentRound: Number,
    currentTurn: Number,
    currentArticle: articleSchema,
    playerAnswers: [{
        player: { type: playerSchema },
        answer: { type: String }
    }],
    playerAnswers2: [{
        player: { type: playerSchema },
        answer: { type: String }
    }]
});

module.exports = mongoose.model("Room", roomSchema);