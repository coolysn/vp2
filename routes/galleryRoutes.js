const express = require("express");
const router = express.Router(); //suur "R" on oluline!!!
const general = require("../generalFnc");

//kأµikidele marsruutidele ühine vahevara (middleware)
router.use(general.checkLogin);

//kontrollerid
const {
	galleryOpenPage,
	galleryPage} = require("../controllers/galleryControllers");

router.route("/").get(galleryOpenPage);

router.route("/:page").get(galleryPage);

module.exports = router;