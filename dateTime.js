
const weekDayNamesEt = ["pühapäev", "esmaspäev", "teisipäev", "kolmapäev", "neljapäev", "reede", "laupäev"]
const monthNamesEt = ["jaanuar", "veebruar", "märts", "aprill", "mai", "juuni", "juuli", "august", "september", "oktoober", "november", "detsember"];
const dateFormattedEt = function(){
	//function dateFormatted(){
	let timeNow = new Date();
	let dateNow = timeNow.getDate();
	let monthNow = timeNow.getMonth();
	let yearNow = timeNow.getFullYear();
	return dateNow + "." + monthNamesEt[monthNow] + " " + yearNow;
}

const weekDayEt = function(){
	let timeNow = new Date();
	let dayNow = timeNow.getDay();
	return weekDayNamesEt[dayNow];
}

const currentTimeEt = function(){
	let timeNow = new Date();
	let hours = timeNow.getHours();
	let minutes = timeNow.getMinutes();
	let seconds = timeNow.getSeconds();
	return hours + ":" + minutes + ":" + seconds;
}

// OR || AND && EI ! samatüüpi === 

const partOfDay = function(){
	let dPart = "suvaline aeg";
	let dayNow = new Date().getDay();
	let hourNow = new Date().getHours();
	if(hourNow > 8 && hourNow <= 16 && dayNow >= 1 && dayNow <= 5){
		dPart = "kooliaeg";
	} else if (hourNow > 22 && hourNow <= 6) { 
		dPart = "uneaeg";
	} else if (hourNow >= 18 && hourNow <= 20) {
		dPart = "õppimise aeg";
	} else if (dayNow === 2 && hourNow === 14 && hourNow <= 16){
		dPart = "trenni aeg";
	} else {
		dPart = "vabaaeg";
	}	
	return dPart;
}
const dayD = function(){
	let wPart = "suvaline päev";
	let hPart = "Suvaline kellaaeg";
	let dayNow = new Date().getDay();
	let hourNow = new Date().getHours();
	if(dayNow === 0 || dayNow === 6){
		wPart = "nädalavahetus";
	 } else { 
		wPart = "argipäev";
	}
	return wPart;
}



//eksport
module.exports = {dateFormattedEt: dateFormattedEt, weekDayEt: weekDayEt, currentTimeEt: currentTimeEt, weekDayNamesEt: weekDayNamesEt, monthNamesEt: monthNamesEt, dayPart: partOfDay, weekPart: dayD};