const axios = require("axios");
const cheerio = require("cheerio");
const db = require("../models");

// helper functions
function scrapeWashingtonPost() {
  const homepage = "https://www.washingtonpost.com/";
  console.log(`Scraping articles from ${homepage}...`);

  return axios.get(homepage).then(response => {
    const articles = [];
    const $ = cheerio.load(response.data);
    const $headlines = $(".font--headline");

    // save articles from top of page last in the database
    // so that most recent and important articles are at the end
    for (let i = $headlines.length - 1; i >= 0; i--) {
      const $headline = $headlines.eq(i);

      const headline = $headline.text();
      const byline = $headline.parent().siblings(".byline").text().replace(/[0-9]+\s[a-z]+\sago/, ""); // gets rid of timestamp in byline, e.g. 28 minutes ago
      const url = $headline.find("a").attr("href");
      const summary = $headline.parent().siblings(".bb").text();

      // articles must have headline and url at a minimum
      if (headline && url) {
        articles.push({ headline, byline, url, summary });
      }
    }

    console.log(`Collected data on ${articles.length} articles.`);
    return articles;
  }).catch(err => console.log(err));
}

// controller
module.exports = {
  findAll: function (req, res) {
    const newArticlesPromise = scrapeWashingtonPost();
    const oldArticlesPromise = db.Article.find({}, "url").then(articleData => {
      // make an object containing each url in the database
      const articleUrls = {};
      articleData.forEach(article => {
        articleUrls[article.url] = true;
      });

      return articleUrls;
    });

    // proceed after old and new articles have been retrieved
    Promise.all([newArticlesPromise, oldArticlesPromise]).then(([newArticles, articleUrls]) => {
      // filter out articles that are already saved
      let articlesToSave = newArticles.filter(article => {
        if (articleUrls[article.url]) {
          return false;
        } else {
          articleUrls[article.url] = true;
          return true;
        }
      });
      // add missing fields
      articlesToSave = articlesToSave.map(article => ({ ...article, date: Date.now(), comments: [] }));
      // save
      return db.Article.insertMany(articlesToSave);
    }).then(savedArticles => {
      console.log(`Saved ${savedArticles.length} new articles.`);
      return db.Article.find({}, "_id headline byline summary commentCount");
    }).then(dbModel => {
      return res.json(dbModel);
    }).catch(err => {
      return res.status(500).json(err)
    });
  },
  find: function(req, res) {
    db.Article.findById(req.params._id).then(dbModel => {
      res.json(dbModel);
    }).catch(err => {
      return res.status(500).json(err)
    });
  }
};
