//liidame express mooduli
const express = require("express");
const dateTime = require("./dateTime");
const fs = require("fs");
//et saada kõik päringust kätte
const bodyparser= require("body-parser");
//andmebaasi andmed
const dbInfo = require("../../vp2024config");
//andmebaasiga suhtlemine
const mysql = require("mysql2");
//fotode üleslaadimiseks
const multer = require("multer");
//fotode manipuleerimine
const sharp = require("sharp");
//paroolide krüpteerimiseks
const bcrypt = require("bcrypt");
//sessioonihaldur
const session = require("express-session");
//asünkroonsuse võimaldaja
const asyn = require("async");


const app = express();

//määran view mootori
app.set("view engine", "ejs");
//määran jagatavate avalike failide kausta
app.use(express.static("public"));
//kasutame bodyparserit päringute parsimiseks (kui ainult tekst, siis false, kui pildid jms, siis true)
app.use(bodyparser.urlencoded({extended: true}));
//seadistame fotode üleslaadimiseks vahevara (middleware), mis määrab kataloogid, kuhu laetakse
const upload = multer({dest: "./public/gallery/orig"});
//sessioonihaldur
app.use(session({secret: "minuAbsoluutseltSalajaneVõti", saveUninitialized: true, resave: true}));
let mySession;

//loon andmebaasiühenduse
const conn = mysql.createConnection({
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: dbInfo.configData.dataBase
});

//uudiste osa eraldi ruuteriga
const newsRouter = require("./routes/newsRouter");
app.use("/news", newsRouter); //päring news, vahevara kasutab newsRouter.js

const eestifilmRouter = require("./routes/eestifilmRouter");
app.use("/eestifilm", eestifilmRouter);

app.get("/", (req, res)=>{
	//res.send("Express läks käima!");
	res.render("index");
});

app.post("/", (req, res)=>{
	let notice = null;
	if(!req.body.emailInput || !req.body.passwordInput){
		console.log("Sisselogimise andmed pole täielikud!");
		notice = "Sisselogimise andmeid on puudu!";
		res.render("index", {notice: notice});
	}
	else {
		let sqlReq = "SELECT id, password FROM vp2users WHERE email = ?";
		conn.execute(sqlReq, [req.body.emailInput], (err, result)=>{
			if(err){
				notice = "Tehnilise vea tõttu ei saa sisse logida :( !";
				console.log(err);
				res.render("index", {notice: notice});
			}
			else {
				if(result[0] != null){
					//kontrollime, kas sisselogimisel sisestatud paroolist saaks sellise räsi nagu andmebaasis
					bcrypt.compare(req.body.passwordInput, result[0].password, (err, compareresult)=>{
						if(err){
							notice = "Tehnilise vea tõttu andmete kontrollimisel ei saa sisse logida :( !";
							console.log(err);
							res.render("index", {notice: notice});
						}
						else {
							//kui võrdlus on positiivne (bcrypt.compare)
							if(compareresult){
								notice = "Oled sisse logitud!";
								//võtame sessiooni kasutusele
								//mySession = req.session;
								//mySession.userId = result[0].id;
								req.session.userId = result[0].id;
								//res.render("index", {notice: notice});
								res.redirect("/home");
							}
							else{
								notice = "Kasutajatunnus ja/või parool on vale!";
								res.render("index", {notice: notice});
							}
						}
					});
				}
				else {
					notice = "Kasutajatunnus ja/või parool on vale!";
					res.render("index", {notice: notice});
				}
					
			}
		});
	}
	//res.render("index")
});

app.get("/logout", (req,res)=>{
	req.session.destroy();
	//mySession = null;
	res.redirect("/");
});

app.get("/home", checkLogin, (req, res)=>{
	console.log("Sisse on loginud kasutaja: " + req.session.userId);
	res.render("home");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/signup", (req, res) => {
    let notice = "Ootan andmeid";

    // Kontrollin kas andmed on olemas
    if (
        !req.body.firstNameInput ||
        !req.body.lastNameInput ||
        !req.body.birthDateInput ||
        !req.body.genderInput ||
        !req.body.emailInput ||
        req.body.passwordInput.length < 8 ||
        req.body.passwordInput !== req.body.confirmPasswordInput
    ) {
        // console.log("Andmeid puudu või paroolid ei klapi!");
        notice = "Andmeid on puudu või paroolid ei klapi!";
        return res.render("signup", { notice: notice });
    }

    // Kontrollin, kas email on juba kasutusel
    const emailCheck = "SELECT id FROM vp2users WHERE email = ?";
    conn.execute(emailCheck, [req.body.emailInput], (err, result) => {
        if (err) {
            notice = "Tehniline viga emaili kontrollimisel";
            return res.render("signup", { notice: notice });
        }

        if (result.length > 0) {
            // Kui email on juba kasutusel
            notice = "Sellise emaili aadressiga kasutaja on juba olemas!";
            return res.render("signup", { notice: notice });
        } else {
            // Kui email ei ole kasutusel, jätkab kasutaja loomisega
            notice = "Andmed korras!";
            bcrypt.genSalt(10, (err, salt) => {
                if (err) {
                    notice = "Tehniline viga, kasutajat ei loodud.";
                    return res.render("signup", { notice: notice });
                } else {
                    bcrypt.hash(req.body.passwordInput, salt, (err, pwdHash) => {
                        if (err) {
                            notice = "Tehniline viga parooli krüpteerimisel, kasutajat ei loodud.";
                            return res.render("signup", { notice: notice });
                        } else {
                            let sqlReq =
                                "INSERT INTO vp2users (first_name, last_name, birth_date, gender, email, password) VALUES(?,?,?,?,?,?)";
                            conn.execute(
                                sqlReq,
                                [
                                    req.body.firstNameInput,
                                    req.body.lastNameInput,
                                    req.body.birthDateInput,
                                    req.body.genderInput,
                                    req.body.emailInput,
                                    pwdHash,
                                ],
                                (err, result) => {
                                    if (err) {
                                        notice = "Tehniline viga andmebaasi kirjutamisel, kasutajat ei loodud.";
                                        return res.render("signup", { notice: notice });
                                    } else {
                                        notice =
                                            "Kasutaja " + req.body.emailInput + " edukalt loodud!";
                                        return res.render("signup", { notice: notice });
                                    }
                                }
                            );
                        }
                    });
                }
            });
        }
    });
});


app.get("/timenow", (req,res)=>{
	const weekdayNow = dateTime.weekDayEt();
	const dateNow = dateTime.dateFormattedEt();
	const timeNow = dateTime.currentTimeEt();
	res.render("timenow", {nowWD: weekdayNow, nowD: dateNow, nowT: timeNow});
});

app.get("/vanasonad", (req,res)=>{
	let folkWisdom = [];
	fs.readFile("public/textfiles/vanasonad.txt", "utf8", (err, data)=>{;
		if(err){
			//throw err;
			res.render("justlist", {h2: "Vanasõnad", listData: ["Ei leidnud midagi!"]});
		}
		else {
				folkWisdom = data.split(";");
				res.render("justlist", {h2: "Vanasõnad", listData: folkWisdom});
		}
	});
});

app.get("/regvisit", (req, res)=>{
	res.render("regvisit");
});

app.post("/regvisit", (req, res)=>{
	//console.log(req.body);
	//avan txt faili selliselt, et kui seda pole olemas, luuakse
	fs.open("public/textfiles/log.txt", "a", (err, file) => {
		if(err){
			throw err;
		}
		else {
			const weekdayNow = dateTime.weekDayEt();
			const dateNow = dateTime.dateFormattedEt();
			const timeNow = dateTime.currentTimeEt();
			const logEntry = req.body.firstNameInput + " " + req.body.lastNameInput + " - " + weekdayNow + ", " + dateNow + " kell " + timeNow + ";\n";
			fs.appendFile("public/textfiles/log.txt", logEntry, (err)=>{
				if(err){
					throw err;
				}
				else {
					console.log("Faili kirjutati külastus koos ajaga!");
					res.render("regvisit");
				}
			});
		}
	});
	//res.render("regvisit");
});

app.get("/visitlog", (req,res)=>{
	let visitLog = [];
	fs.readFile("public/textfiles/log.txt", "utf8", (err, data)=>{;
		if(err){
			//throw err;
			res.render("justlist", {h2: "Külastajate nimekiri", listData: ["Ei leidnud midagi!"]});
		}
		else {
				visitLog = data.split(";");
				res.render("justlist", {h2: "Külastajad:", listData: visitLog});
		}
	});
});

app.get("/regvisitdb", (req, res)=>{
	let notice = "";
	let firstName = "";
	let lastName = "";
	res.render("regvisitdb", {notice: notice, firstName: firstName, lastName: lastName});
});

app.post("/regvisitdb", (req, res)=>{
	let notice = "";
	let firstName = "";
	let lastName = "";
	//kontrollin, kas kõik vajalikud andmed on olemas
	if(!req.body.firstNameInput || !req.body.lastNameInput){
		//console.log("Osa andmeid puudu!");
		notice = "Osa andmeid puudu!";
		firstName = req.body.firstNameInput;
		lastName = req.body.lastNameInput;
		res.render("regvisitdb", {notice: notice, firstName: firstName, lastName: lastName});
	}
	else {
		let sqlReq = "INSERT INTO vp2visitlog (first_name, last_name) VALUES(?,?)";
		conn.query(sqlReq, [req.body.firstNameInput, req.body.lastNameInput], (err, sqlRes)=>{
			if(err){
				notice = "Tehnilistel pÃµhjustel andmeid ei salvestatud!";
				res.render("regvisitdb", {notice: notice, firstName: firstName, lastName: lastName});
				throw err;
			}
			else {
				notice = "Andmed salvestati!";
				//res.render("regvisitdb", {notice: notice, firstName: firstName, lastName: lastName});
				res.redirect("/");
			}
		});
	}
});

app.get("/visitlogdb", (req, res)=>{
	//console.log("Route /visitlogdb accessed");
	//loon andmebaasi päringu
	let sqlReq = "SELECT first_name, last_name, visit_date FROM vp2visitlog";
	conn.query(sqlReq, (err, sqlRes)=>{
		if (err){
			//console.error("Database query error:", err);
			res.render("visitlogdb",{listData: []});
			//throw err;
		}
		else{
			//console.log(sqlRes);
			res.render("visitlogdb",{listData: sqlRes});
		}
	});
});


//pildigalerii üleslaadimine
app.get("/photoupload", (req, res)=>{
	res.render("photoupload");
});

app.post("/photoupload", upload.single("photoInput"), (req, res)=>{
	console.log(req.body);
	console.log(req.file);
	const fileName = "vp_" + Date.now() + ".jpg";
	fs.rename(req.file.path, req.file.destination + "/" + fileName, (err)=>{
		console.log("Faili nime muutmise viga: " + err);
	});
	sharp(req.file.destination + "/" + fileName).resize(800,600).jpeg({quality: 90}).toFile("./public/gallery/normal/" + fileName);
	sharp(req.file.destination + "/" + fileName).resize(100,100).jpeg({quality: 90}).toFile("./public/gallery/thumb/" + fileName);
	//salvestame pildi info andmebaasi
	let sqlReq = "INSERT INTO vp2photos (file_name, orig_name, alt_text, privacy, user_id) VALUES(?,?,?,?,?)";
	const userId = 1;
	conn.query(sqlReq, [fileName, req.file.originalname, req.body.altInput, req.body.privacyInput, userId], (err, result)=>{
		if(err){
			throw(err);
		}
		else {
			res.render("photoupload");
		}
	});
});	

app.get("/gallery", (req, res)=>{
	//loon andmebaasi päringu
	let sqlReq = "SELECT id, file_name, alt_text FROM vp2photos WHERE privacy = ? AND deleted IS NULL ORDER BY id DESC";
	const privacy = 3;
	let photoList = []
	conn.execute(sqlReq, [privacy], (err, result)=>{
		if(err){
			throw err;
		}
		else {
			console.log(result);
			for(let i = 0; i < result.length; i ++) {
				photoList.push({id: result[i].id, href: "/gallery/thumb/", filename: result[i].file_name, alt: result[i].alt_text});
			}
			res.render("gallery", {listData: photoList});
		}
	});
	//res.render("gallery");
});

function checkLogin(req, res, next){
	if(req.session != null){
		if(req.session.userId){
			console.log("Login ok!");
			next();
		}
		else {
			console.log("Login not detected!");
			res.redirect("/");
		}
	}
	else {
		res.redirect("/");
	}
}

app.listen(5213);

 
