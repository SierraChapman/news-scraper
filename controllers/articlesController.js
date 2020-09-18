const db = require("../models");

// helper functions
function scrapeWashingtonPost() {
  const homepage = "https://www.washingtonpost.com/";
  const articles = [];

  console.log(`Scraping articles from ${homepage}...`);

  return articles;
}

// controller
module.exports = {
  findAll: function(req, res) {
    const washPostArticles = scrapeWashingtonPost();
    console.log(washPostArticles);

    db.Article.find({})
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(500).json(err));
  },
};
