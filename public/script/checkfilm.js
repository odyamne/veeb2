//console.log('töötab');
let roll="näitleja";
window.onload=function()
{
	//document.getElementById("photoSubmit");
	document.querySelector("#personSubmit").disabled=true;
	//document.querySelector("#infoPlace").innerHTML="Pilti pole valitud";
	document.querySelector("#positionInput").addEventListener("change",checkRoll);
}

function checkRoll()
{
	if(document.querySelector("#filmPersonInput").value==roll) //kui on näitleja
	{
		document.querySelector("#filmPersonInput").disabled=false;
		document.querySelector("#infoPlace").innerHTML="";
	}
	else
	{
		document.querySelector("#filmPersonInput").disabled=true;
		document.querySelector("#infoPlace").innerHTML="roll on rezisöör";
	}
	//console.log(document.querySelector("#photoInput").files[0].size);
	//console.log('töötab');
}