const express = require("express");
const router = express.Router(); //suur "R" on oluline!!

//kontrollerid
const {weatherHome} = require("../controllers/weatherController");


//marsruudid , app asemel router
//kuna kõik nkn "/news" siis lihtsalt "/"
//kuna tahame kasutada ka controllereid, siis .get tuleb järgi
router.route("/").get(weatherHome);
//controllerid uues failis


module.exports = router;

