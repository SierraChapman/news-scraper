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
      const $headlines = $(".font--headline");

      for (let i = 0; i < $headlines.length; i++) {
        const $headline = $headlines.eq(i);

        const headline = $headline.text();
        const byline = $headline.parent().siblings(".byline").text();
        const url = $headline.find("a").attr("href");
        const summary = $headline.parent().siblings(".bb").text();
        
        // articles must have headline and url at a minimum
        if (headline && url) {
          articles.push({ headline, byline, url, summary });
        }
      }

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
