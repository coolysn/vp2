const axios = require("axios");
const {XMLParser} = require("fast-xml-parser");


//@desc homepage for news section
//@route GET /api/news
//@access public

const weatherHome = (req, res)=>{
	axios.get("https://ilmateenistus.ee/ilma_andmed/xml/forecast.php")
	.then(response => {
		//console.log(response.data);
		const parser = new XMLParser();
		let weatherData = parser.parse(response.data);
		//console.log(weatherData);
		//console.log(weatherData.forecasts);
		//console.log(weatherData.forecasts.forecast[0]);
		//let thing = weatherData.forecasts.forecast[0];
		console.log(thing.getAttribute("forecast date"));
		console.log(weatherData.forecasts.forecast[0].day.text);
		res.render("weather");
		
	})
	.catch(error => {
		console.log(error);
		res.render("weather");
	});
	//res.render("weather");
};



module.exports = {
	weatherHome
};

//ülesanne - pane ilmateade lehele, veel parem kui erinevad kohad (nt saaremaa)