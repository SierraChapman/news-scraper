// import dependencies
const express = require("express");
const mongoose = require("mongoose");

// create the app
const app = express();
const PORT = process.env.PORT || 8080;

// parse JSON in request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// send public file
// app.use(express.static("./public"));

// connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/news-scraper", { 
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

// add routes
app.use(require("./routes"));

// listen
app.listen(PORT, () => {
  console.log("App now listening at http://localhost:" + PORT);
});