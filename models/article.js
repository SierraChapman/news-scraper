const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const articleSchema = new Schema({
  headline: String,
  byline: String,
  url: String,
  summary: String,
  date: Date,
  comments: [{
    author: String,
    body: String,
    date: { type: Date, default: Date.now },
    id: Number,
  }],
  commentCount: { type: Number, default: 0 },
});

const Article = mongoose.model("Article", articleSchema);

module.exports = Article;
