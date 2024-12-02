const mysql = require("mysql2");
const dbInfo = require("../../../vp2024config");
const dateTime = require("../dateTime");
const asyn = require("async");

const conn = mysql.createConnection({
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: dbInfo.configData.dataBase
});

//@desc home page for gallery
//@route GET /api/gallery
//@access private

const galleryOpenPage = (req, res)=>{
	res.redirect("/gallery/1");
};

const galleryPage = (req, res)=>{
	let page = parseInt(req.params.page);
	const photoLimit = 5;
	const privacy = 3;
	let galleryLinks = "";
	
	console.log("Page: " + req.params.page);
	//kontrollin, kas on sobiv lehekülg
	if(!req.params.page < 1){
		page = 1;
	}
	
	//teeme async waterfall lähenemise, et teha gallerii lehekülje eeltööd enne ja järjest
	const galleryPageTasks = [
		function(callback){
			conn.execute("SELECT COUNT(id) as photos FROM vp2photos WHERE privacy = ? AND deleted is NULL", [privacy], (err, result)=>{
				if (err){
					return callback(err);
				}
				else {
					return callback(null, result); 
				}
			});
		},
		function(photoCount, callback){
			console.log(photoCount[0].photos)
			if(Math.floor(req.params.page -1) * photoLimit >= photoCount[0].photos){
				page = Math.ceil(photoCount[0].photos / photoLimit);
			}
			console.log("Lehekülg on: " + page);
			let galleryNav = "";
			if(page == 1){
				galleryNav = "eelmine leht &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;";
			} 
			else {
				galleryNav = '<a href="/gallery/' + (page - 1) + '">eelmine leht</a> &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;';
			}
			if(page * photoLimit < photoCount[0].photos){
				galleryNav += '<a href="/gallery/' + (page + 1) + '">järgmine leht</a>';
			}
			else {
				galleryNav += "järgmine leht";
			}
			return callback(null, galleryNav);
		}
	];
	asyn.waterfall(galleryPageTasks, (err, results)=>{
		if (err){
			throw err;
		}
		else {
			console.log(results);
			galleryLinks = results;
		}
	});
	
	let skip = (page - 1) * photoLimit;
	
	let sqlReq = "SELECT id, file_name, alt_text FROM vp2photos WHERE privacy = ? AND deleted IS NULL ORDER BY id DESC LIMIT ?, ?";
	
	let photoList = [];
	conn.execute(sqlReq, [privacy, skip, photoLimit], (err, result)=>{
		if(err){
			throw err;
		}
		else {
			console.log(result);
			for(let i = 0; i < result.length; i ++) {
				photoList.push({id: result[i].id,  href: "/gallery/thumb/", filename: result[i].file_name, alt: result[i].alt_text});
			}
			res.render("gallery", {links: galleryLinks, listData: photoList});
		}
	});
	//res.render("gallery");
};

module.exports = {
	galleryOpenPage,
	galleryPage};