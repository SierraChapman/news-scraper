const router = require("express").Router();
const articlesController = require("../../controllers/articlesController");

// matches with /api/articles
router
  .route("/")
  .get(articlesController.findAll);

module.exports = router;
