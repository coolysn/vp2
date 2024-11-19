const express = require("express");
const router = express.Router(); //suur "R" on oluline!!
const bodyparser= require("body-parser");
const general = require("../generalFnc");
const {eestifilmHome,
	filmTegelased,
	tegelaseRelations,
	addPerson,
	addRelation,
	addPersonPost} = require("../controllers/eestifilmController");
//vahevara checkLogin
router.use(general.checkLogin);

router.route("/").get(eestifilmHome);
router.route("/tegelased").get(filmTegelased);
router.route("/personrelations/:id").get(tegelaseRelations);
router.route("/addperson").get(addPerson);
router.route("/lisaseos").get(addRelation);
router.route("/addperson").post(addPersonPost);

module.exports = router;