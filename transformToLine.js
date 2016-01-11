// works its way through a JSON file and creates a LineString out of historical data
var fs = require('fs');

var source = "ships.json";
// resultfile name/folder
var result = "ships_result.json";

// read in
var geoJSON = JSON.parse(fs.readFileSync(source, 'utf8'));
var counter = 0;
var a = [];

geoJSON.features.forEach(function(element) {
    element.geometry.coordinates = element.sensors.pastCoordinates;
    element.geometry.type = "LineString";
    element.type = "Feature";
    counter++;     
    delete element.sensors;
});

fs.writeFile(result, JSON.stringify(geoJSON), function(err) {
      if (err) throw err;
      console.log("Renamed "+counter + " entries.");
      console.log('file written.');
      //console.log(a)
});
