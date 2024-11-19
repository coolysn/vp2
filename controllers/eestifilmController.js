const dbInfo = require("../../../vp2024config");
const mysql = require("mysql2");
const asyn = require("async");

const conn = mysql.createConnection({
	host: dbInfo.configData.host,
	user: dbInfo.configData.user,
	password: dbInfo.configData.passWord,
	database: dbInfo.configData.dataBase
});

//@desc homepage for eestifilm
//@route GET /api/eestifilm
//@access private
const eestifilmHome = (req, res)=>{
	res.render("eestifilm");
};

//@desc filmitegelased for eestifilm
//@route GET /api/eestifilm
//@access private
const filmTegelased = (req, res)=>{
	//loon andmebaasipäringu
	let sqlReq = "SELECT id, first_name, last_name, birth_date FROM person";
	conn.query(sqlReq, (err, sqlRes)=>{
		if(err){
			res.render("tegelased", {persons: []});
			//throw err;
		}
		else {
			//console.log(sqlRes);
			res.render("tegelased", {persons: sqlRes});
		}
	});
};

const tegelaseRelations = (req, res)=>{
	console.log(req.params);
	res.render("personrelations");
};

const addPerson = (req, res)=>{
	res.render("addperson");
};

const addRelation = (req,res)=>{
	//kasutades async moodulit, panen mitu andmebaasi päringut paralleelselt toimima
	//loon SQL päringute (lausa tegevuste ehk funktsioonide)loendi
	const myQueries = [
		function(callback){
			conn.execute("SELECT id, first_name, last_name, birth_date FROM person", (err, result)=>{
				if(err){
					return callback(err);
				}
				else{
					return callback(null, result);
				}
			});
		},
		function(callback){
			conn.execute("SELECT id, title, production_year FROM movie", (err, result)=>{
				if(err){
					return callback(err);
				}
				else{
					return callback(null, result);
				}
			});
		},
		function(callback){
			conn.execute("SELECT id, position_name FROM position", (err, result)=>{
				if(err){
					return callback(err);
				}
				else{
					return callback(null, result);
				}
			});
		}
	];
	//paneme need tegevused paralleelselt tööle, tulemuse saab siis, kui kõik tehtud
	//väljundiks üks koondlist
	asyn.parallel(myQueries, (err, results)=>{
		if(err){
			throw err;
		}
		else{
			console.log(results);
			res.render("addrelations", {personList: results[0], movieList: results[1], positionList: results[2]});
		}
	});
	/* let sqlReq = "SELECT id, first_name, last_name, birth_date FROM person";
	conn.execute(sqlReq, (err, result)=>{
		if(err){
			throw err;
		}
		else {
			console.log(result);
			res.render("addrelations", {personList: result});
		}
	}); */
	//res.render("addrelations");
};

const addPersonPost =  (req, res)=>{
	let notice = "";
	
	if (req.body.filmSubmit){
		const filmName = req.body.filmInput;
        console.log("Lisatud film:", filmName);
        notice = `Lisatud film: ${filmName}`;

	}
	else if (req.body.roleSubmit){
		const roleName = req.body.roleInput;
        console.log("Lisatud roll:", roleName);
        notice = `Lisatud roll: ${roleName}`;
	}
	else {
		const firstName = req.body.firstNameInput;
        const lastName = req.body.lastNameInput;    
        console.log("Lisatud filmitegelane:", firstName, lastName);
        notice = `Lisatud filmitegelane: ${firstName} ${lastName}`;
	}
	return res.render("addperson", {notice: notice});
	
};

module.exports = {
	eestifilmHome,
	filmTegelased,
	tegelaseRelations,
	addPerson,
	addRelation,
	addPersonPost
};