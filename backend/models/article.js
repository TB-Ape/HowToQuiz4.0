const mongoose = require("mongoose");
const { Schema } = mongoose;
const articleSchema = new Schema({
    title:      String,
    id:         Number,
    image:      String,
    language:   String,
    category:   String
});

module.exports = mongoose.model("Article", articleSchema);