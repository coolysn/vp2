//liidame express mooduli
const express = require("express");
const dateTime = require("./dateTime");
const fs = require("fs");
//et saada kõik päringust kätte
const bodyparser= require("body-parser");

const app = express();

//määran view mootori
app.set("view engine", "ejs");
//määran jagatavate avalike failide kausta
app.use(express.static("public"));
//kasutame bodyparserit päringute parsimiseks (kui ainult tekst, siis false, kui pildid jms, siis true)
app.use(bodyparser.urlencoded({extended: false}));

app.get("/", (req, res)=>{
	//res.send("Express läks käima!");
	res.render("index");
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
app.listen(5213);

//sul muidu 5213
//vaja kellaaeg ja kuupäev salvestada (kui regvisit)
 
