const express = require("express");
const router = express.Router(); //suur "R" on oluline!!
const bodyparser= require("body-parser");
const general = require("../generalFnc");
const {newsHome,
	addNews,
	addingNews,
	newsList,
	newsReader} = require("../controllers/newsController");

//kõikidele marsruutidele vahevara checkLogin
router.use(general.checkLogin);

//marsruudid , app asemel router
//kuna kõik nkn "/news" siis lihtsalt "/"
//kuna tahame kasutada ka controllereid, siis .get tuleb järgi
router.route("/").get(newsHome);
//controllerid uues failis
router.route("/add").get(addNews);

router.route("/add").post(addingNews);

router.route("/read").get(newsList);

router.route("/read/:id").get(newsReader);

module.exports = router;

//uudiste täiendamine uudiste lugemisega
//newsList näidata vaid uudiste pealkirju linkidena, kujul: /news/read/:id (nt. /news/read/54)
// /news/read/:id lehel näidata valitud uudist suure pealkirja, sisu, lisamise aja + autori nimi
//Selle dünaamilise (sõltub parameetrist) marsruudi jaoks võib teha teise view