const mongoose = require("mongoose");
const { Schema } = mongoose;
const playerSchema = new Schema({
    username: String,
    socketId: String,
    score: Number,
    present: Boolean,
    isHost: Boolean
});

module.exports = mongoose.model("Player", playerSchema);