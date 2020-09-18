const axios = require("axios");
const cheerio = require("cheerio");
const db = require("../models");

// helper functions
function scrapeWashingtonPost() {
  const homepage = "https://www.washingtonpost.com/";
  console.log(`Scraping articles from ${homepage}...`);

  return axios.get(homepage)
    .then(response => {
      const articles = [];
      const $ = cheerio.load(response.data);
      console.log($(".font--headline").length);

      return articles;
    })
    .catch(err => console.log(err));
}

// controller
module.exports = {
  findAll: function(req, res) {
    scrapeWashingtonPost()
      .then(articles => {
        console.log(articles);

        return db.Article.find({});
      })
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(500).json(err));
  },
};
