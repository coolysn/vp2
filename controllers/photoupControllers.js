const mysql = require("mysql2");
const dbInfo = require("../../../vp2024config");
const fs = require("fs");
//pildimanipalulatsiooniks (suuruse muutmine)
const sharp = require("sharp");


const conn = mysql.createConnection({
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: dbInfo.configData.dataBase
});

//@desc home page for photoupload
//@route GET /photoupload
//@access private

const photouploadPage = (req, res)=>{
	res.render("photoupload");
};

//@desc photouploading
//@route POST /photoupload
//@access private

const photouploading = (req, res)=>{
	console.log(req.body);
	console.log(req.file);
	//genereerime oma failinime
	const fileName = "vp_" + Date.now() + ".jpg";
	//nimetame أ¼leslaetud faili ümber
	fs.rename(req.file.path, req.file.destination + fileName, (err)=>{
		console.log(err);
	});
	//teeme 2 erisuurust
	sharp(req.file.destination + fileName).resize(800,600).jpeg({quality: 90}).toFile("./public/gallery/normal/" + fileName);
	sharp(req.file.destination + fileName).resize(100,100).jpeg({quality: 90}).toFile("./public/gallery/thumb/" + fileName);
	//salvestame andmebaasi
	let sqlReq = "INSERT INTO vp2photos (file_name, orig_name, alt_text, privacy, user_id) VALUES(?,?,?,?,?)";
	const userId = 1;
	conn.query(sqlReq, [fileName, req.file.originalname, req.body.altInput, req.body.privacyInput, userId], (err, result)=>{
		if(err){
			throw err;
		}
		else {
			res.render("photoupload");
		}
	});
	//res.render("photoupload");
};


module.exports = {
	photouploadPage,
	photouploading
};