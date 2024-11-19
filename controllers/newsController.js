const dbInfo = require("../../../vp2024config");
const mysql = require("mysql2");

const conn = mysql.createConnection({
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: dbInfo.configData.dataBase
});

//@desc homepage for news section
//@route GET /api/news
//@access private

const newsHome = (req, res)=>{
	res.render("news");
};

//@desc page for adding news
//@route GET /api/news
//@access private

const addNews = (req, res)=>{
	res.render("addnews");
};

//@desc adding news
//@route POST /api/news
//@access private

const addingNews = (req, res)=>{
	if(!req.body.titleInput || !req.body.contentInput || !req.body.expireInput){
		console.log('Uudisega jama');
		notice = 'Andmeid puudu!';
		res.render('addnews', {notice: notice});
	}
	else {
			let sql = 'INSERT INTO vp2news (news_title, news_text, expire_date, user_id) VALUES(?,?,?,?)';
				//andmebaasi osa
			conn.execute(sql, [req.body.titleInput, req.body.contentInput, req.body.expireInput, req.session.userId], (err, result)=>{
				if(err) {
					throw err;
					notice = 'Uudise salvestamine ebaõnnestus!';
					res.render('addnews', {notice: notice});
				} else {
					notice = 'Uudis edukalt salvestatud!';
					res.render('addnews', {notice: notice});
				}
			});	
				//andmebaasi osa lõppeb
	}
};

//@desc for reading news headings
//@route POST /api/news
//@access private

const newsList = (req, res)=>{
	let sql = "SELECT id, news_title FROM vp2news WHERE expire_date > ? ORDER BY id DESC";
		//let userid = 1;
		//andmebaasi osa
		conn.execute(sql, [new Date()], (err, result)=>{
			if(err) {
				//throw err;
				const news = [{id: 0, news_title: "Uudiseid pole!"}];
				notice = 'Uudiste lugemine ebaõnnestus!' + err;
				res.render('readnews', {news: news});
			} else {
				notice = 'Uudis edukalt salvestatud!';
				res.render('readnews', {news: result});
			}
		});
	//res.render("readnews");

};

module.exports = {
	newsHome,
	addNews,
	addingNews,
	newsList
};