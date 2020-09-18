const db = require("../models");

module.exports = {
  findAll: function(req, res) {
    db.Article.find({})
      .then(dbModel => res.json(dbModel))
      .catch(err => res.status(500).json(err));
  },
};
