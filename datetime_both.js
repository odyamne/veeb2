const monthNamesET = ["Jaanuar", "Veebruar", "Märts", "April", "Mai", "Juuni", "Juuli", "August", "September", "Oktoober", "November", "Detsember"];
const monthNamesEN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const dateNowEN = function(){
	let timeNow = new Date();
	//return timeNow.getDate() + "." + (timeNow.getMonth() + 1) + "." + timeNow.getFullYear();
	return monthNamesEN[timeNow.getMonth()] + " " + timeNow.getDate() + " " + timeNow.getFullYear();
}

const dateNowENShort = function(){
	let timeNow = new Date();
	return (timeNow.getMonth() + 1) + "/" + timeNow.getDate() + "/" + timeNow.getFullYear();
}

const timeNowEN = function(){
	let timeNow = new Date();
	return timeNow.getHours() + ":" + timeNow.getMinutes() + ":" + timeNow.getSeconds();
}

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

const convertDateFormat = function(date, format){
    let dateParts = date.split('/');
    let month = parseInt(dateParts[0]);
    let day = parseInt(dateParts[1]);
    let year = parseInt(dateParts[2]);

    if (format === "ET"){
        return day + "." + month + "." + year;
    } else if (format === "EN"){
        return month + " " + day + " " + year;
    } else if (format === "EN_SHORT"){
        return month + "/" + day + "/" + year;
    }
};

//	Allolev kuunimedega
// const convertDateFormat = function(date, format){
//     let dateParts = date.split("/");
//     let monthIndex = monthNamesEN.indexOf(dateParts[0]);
//     let day = parseInt(dateParts[1]);
//     let year = parseInt(dateParts[2]);

//     if (format === "ET"){
//         return day + ". " + monthNamesET[monthIndex] + " " + year;
//     } else if (format === "EN"){
//         return monthNamesEN[monthIndex] + " " + day + " " + year;
//     } else if (format === "EN_SHORT"){
//         return (monthIndex + 1) + "/" + day + "/" + year;
//     }
// }



//moodul ekspordib need asjad
module.exports = {convertDate: convertDateFormat, dateNowET: dateNowET, timeNowET: timeNowET, monthsET: monthNamesET, timeOfDayET: timeOfDayET, dateNowEN: dateNowEN, timeNowEN: timeNowEN, dateNowENShort: dateNowENShort, monthsEN: monthNamesEN};
