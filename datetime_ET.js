const monthNamesET = ["Jaanuar", "Veebruar", "Märts", "April", "Mai", "Juuni", "Juuli", "August", "September", "Oktoober", "November", "Detsember"];

const dateNowET = function(){
	let timeNow = new Date();
	return timeNow.getDate() + ". " + monthNamesET[timeNow.getMonth()] + " " + timeNow.getFullYear();
}

const timeNowET = function(){
	let timeNow = new Date();
	let minutes = timeNow.getMinutes();
	let seconds = timeNow.getSeconds();
	if (minutes < 10){
		minutes = "0" + minutes;
	}
	if (seconds < 10){
		seconds = "0" + seconds;
	} 
	return timeNow.getHours() + ":" + minutes + ":" + seconds;
}
//Ülalolev kood lisab 0 minutite ja sekundite algusesse, kui need on 10st väiksemad eestetika eesmärgil.
const timeOfDayET = function(){
	let dayPart = "mingi aeg";
	const hourNow = new Date().getHours();
	
	if (hourNow >= 6 && hourNow < 12){
		dayPart = "hommik";
	}
	else if (hourNow >= 12 && hourNow < 14){
		dayPart = "keskpäev";
	}	
	else if (hourNow >= 14 && hourNow < 18){
		dayPart = "pärastlõuna";
	}		
	else if (hourNow >= 18 && hourNow < 24){
		dayPart = "õhtu";
	}
	else if (hourNow >= 24 && hourNow < 3){
		dayPart = "öö";
	}
	else if (hourNow >= 3 && hourNow < 6){
		dayPart = "varahommik";
	}
	return dayPart;
	
}


//moodul ekspordib need asjad
module.exports = {dateNowET: dateNowET, timeNowET: timeNowET, monthsET: monthNamesET, timeOfDayET: timeOfDayET};