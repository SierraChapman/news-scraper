const router = require("express").Router();
const articlesController = require("../../controllers/articlesController");

// matches with /api/articles
router
  .route("/")
  .get(articlesController.findAll);

// matches with /api/articles
router
  .route("/:_id")
  .get(articlesController.find);

module.exports = router;
