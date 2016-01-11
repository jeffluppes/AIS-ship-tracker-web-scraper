"use strict";
var request = require('request');
var fs = require('fs');
var colors = require('colors');
/**
*	This is a web scraper tool to collect data from myshiptracker. The code pulls an existing JSON document
*   from the web, parses it as GeoJSON and updates it every x seconds.
*/
//------------------------- GeoJSON --------------------
/**
 * Geojson definition (not completely used)
 */
var FeatureCollection = (function () {
    function FeatureCollection() {
        this.features = [];
    }
    return FeatureCollection;
})();
exports.FeatureCollection = FeatureCollection;
/**
 * Geojson geometry definition
 */
var Geometry = (function () {
    function Geometry() {
    }
    return Geometry;
})();
exports.Geometry = Geometry;
/**
 * Properties definition
 */
var Properties = (function () {
    function Properties() {
    }
    return Properties;
})();
exports.Properties = Properties;
/**
 * Geojson feature definition
 */
var Feature = (function () {
    function Feature() {
    }
    return Feature;
})();
exports.Feature = Feature;
/**
 * Sensor data definition
 */
var Sensors = (function () {
    function Sensors() {
    }
    return Sensors;
})();
exports.Sensors = Sensors;
/**
 * Definitions for our input data
 */
var Ships = (function () {
    function Ships() {
    }
    return Ships;
})();
exports.Ships = Ships;
var Ship = (function () {
    function Ship() {
    }
    return Ship;
})();
exports.Ship = Ship;
//------------------ End of GeoJSON -------
var fetchData = (function () {
    function fetchData() {
    }
    fetchData.prototype.init = function (url) {
        console.log("Initialized fetcher");
        this.url = url;
        this.fetchAndTransform();
    };
    fetchData.prototype.fetchAndTransform = function () {
        console.time("Exectime");
        console.log("GET " + this.url);
        try {
            request(this.url, function (err, res, body) {
                var geoJSON = new FeatureCollection();
                try {
                    //try obtaining the file we created before, if it is there
                    geoJSON = JSON.parse(fs.readFileSync('ships.json', 'utf8'));
                }
                catch (error) {
                    console.log("first time encountering this data source - creating it from scratch!");
                }
                var ships = new Ships();
                //console.log(res.statusCode)
                var temp = JSON.parse(body);
                ships.DATA = temp[0].DATA;
                if (geoJSON.hasOwnProperty("timestamps")) {
                    //not dealing with a fresh file, so we can assume the sensors already exist!
                    // So what would be cool to collect? How about coordinates and speed?
                    ships.DATA.forEach(function (s) {
                        var encountered = false;
                        geoJSON.features.forEach(function (f) {
                            if (s.MMSI === f.Id) {
                                f.sensors.pastCoordinates.push([Number(s.LNG), Number(s.LAT)]);
                                f.sensors.SOG.push(s.SOG);
                                encountered = true;
                            }
                        });
                        if (!encountered) {
                            var f = new Feature();
                            f.Id = s.MMSI;
                            f.type = "Feature";
                            f.geometry = new Geometry();
                            f.properties = new Properties();
                            f.properties.Name = s.NAME;
                            f.properties.MMSI = s.MMSI;
                            f.geometry.type = "Point";
                            f.geometry.coordinates = [Number(s.LNG), Number(s.LAT)];
                            f.sensors = new Sensors();
                            f.sensors.pastCoordinates = [f.geometry.coordinates];
                            f.sensors.SOG = [s.SOG];
                            geoJSON.features.push(f);
                        }
                    });
                    geoJSON.timestamps.push(Date.now());
                }
                else {
                    geoJSON.url = this.url;
                    ships.DATA.forEach(function (s) {
                        var f = new Feature();
                        f.Id = s.MMSI;
                        f.type = "Feature";
                        f.geometry = new Geometry();
                        f.properties = new Properties();
                        f.properties.Name = s.NAME;
                        f.properties.MMSI = s.MMSI;
                        f.geometry.type = "Point";
                        f.geometry.coordinates = [Number(s.LNG), Number(s.LAT)];
                        f.sensors = new Sensors();
                        f.sensors.pastCoordinates = [f.geometry.coordinates];
                        f.sensors.SOG = [s.SOG];
                        geoJSON.features.push(f);
                    });
                    geoJSON.timestamps = [Date.now()];
                }
                fs.writeFile('ships.json', JSON.stringify(geoJSON), function (err) {
                    if (err)
                        throw err;
                    succesfulTries++;
                    console.log("Data has been saved to disk!");
                    console.log(colors.green(ships.DATA.length + " features were collected or updated. Total success: " + succesfulTries + ", total err: " + failedTries));
                    console.timeEnd("Exectime");
                });
            });
        }
        catch (err) {
            console.log(err);
            failedTries++;
            console.log(colors.red("Error: failed to connect! We've had " + failedTries + " failures so far."));
        }
    };
    return fetchData;
})();
exports.fetchData = fetchData;
var fetcher = new fetchData();
var url;
var refreshRate;
var succesfulTries;
var failedTries;
succesfulTries = 0;
failedTries = 0;
// settings
url = "http://www.myshiptracking.com/requests/vesselsonmap.php?type=json&minlat=50.5&maxlat=53.9&minlon=3.27&maxlon=7.21&zoom=9&mmsi=null&timecode=0";
refreshRate = 60000; // milliseconds
// calling init every time seems pretty silly, would rather do this inside init
fetcher.init(url);
setInterval(function () { fetcher.init(url); }, refreshRate);
//# sourceMappingURL=server.js.map