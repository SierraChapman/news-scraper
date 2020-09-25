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

    console.log(`Collected data on ${articles.length} articles.`);
    return articles;
  }).catch(err => console.log(err));
}

// controller
module.exports = {
  findAll: function (req, res) {
    const newArticlesPromise = scrapeWashingtonPost();
    const oldArticlesPromise = db.Article.find({}).then(articleData => {
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
      let articlesToSave = newArticles.filter(article => !articleUrls[article.url]);
      // add missing fields
      articlesToSave = articlesToSave.map(article => ({ ...article, date: Date.now(), comments: [] }));
      // save
      return db.Article.insertMany(articlesToSave);
    }).then(savedArticles => {
      console.log(`Saved ${savedArticles.length} new articles.`);
      return db.Article.find({});
    }).then(dbModel => {
      return res.json(dbModel);
    }).catch(err => {
      return res.status(500).json(err)
    });
  },
};
