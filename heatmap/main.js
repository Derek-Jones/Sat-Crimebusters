var medWidth = 1000;
var medHeight = 265;
var medArray = genMedArray();
var transmissions = [];
var lastKnownPositions = {};

$(document).ready(function() {
	$.ajax({
		type: "GET",
		url: "data.txt",
		dataType: "text",
		success: function(data) {processRawData(data);}
	});
});

function processData(allText) {
	var allTextLines = allText.split(/\r\n|\n/);

	for (var i=1; i<allTextLines.length; i++) {
		var data = allTextLines[i].split(',');
	}

	shipData = data;
}

function processRawData(rawData) {
	var data = rawData.trim();

	var rows = data.split("\n");
	var headers = rows[0].split(',');

	transmissions = [];

	for (var i = 1; i < rows.length; i++) {
		var d = rows[i].split(',');

//		for (var j = 0; j < d.length; j++) {
//			d[j] = d[j].replace('"', '');
//		}

		transmissions.push({
			mmsi: d[0],
			time: d[1],
			sog: d[2],
			lon: parseFloat(d[3]),
			lat: parseFloat(d[4]),
			cog: d[5]
		});
	}

	var timeStart = transmissions[1].time;
	var timeEnd = transmissions[transmissions.length - 1].time;

	console.log("Start time: " + timeStart + ', timeEnd: ' + timeEnd);

//	genVesselList(timeStart, timeEnd);
}

function genHeatMap(){
	for(var i = 1; i < transmissions.length; i++){
		if(isMmsiInLastKnownPositions(transmissions[i].mmsi))
		{

		}
	}
}

function isMmsiInLastKnownPositions(){

}

function parseTransmissions(){
	/*

	for each transmission
		if alreadySeen(mmsi) {
			removeLastLocation();
		}
	 	addCurrentLocation();


	*/
}

function genMedArray(){
	var medArrayLocal = new Array(medHeight);

	for(var i = 0; i < medHeight; i++){
		medArrayLocal[i] = new Array(medWidth);
	}

	for(var i = 0; i < medHeight; i++){
		for( var j = 0; j < medWidth; j++)
		{
			medArrayLocal[i][j] = {};
		}
	}
	return medArrayLocal;
}

function medArrayIndex(lat, lng){
//	min/max latitude 29.80 46.04:  16.24
//	min/max longitude: -5.68 36.81:  42.49

	var normLat = (lat - 29.8) / 16.24;
	var normLng = (lng + 5.68) / 42.49;

	var x = medWidth * normLat ;
	var y = medHeight * normLng;

	return {x: truncate(x), y: truncate(y)};
}

function truncate(n) {
	return Math[n > 0 ? "floor" : "ceil"](n);
}
