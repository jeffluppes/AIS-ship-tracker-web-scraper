"use strict";

import request = require('request');
import fs = require('fs');
import colors = require('colors');

/**
*	This is a web scraper tool to collect data from myshiptracker. The code pulls an existing JSON document
*   from the web, parses it as GeoJSON and updates it every x seconds. 
*/


//------------------------- GeoJSON --------------------

/**
 * Geojson definition (not completely used)
 */
export class FeatureCollection {
    public type: string;
    public timestamps: number[];
    public url: string;
    public features: Feature[] = [];
}
/**
 * Geojson geometry definition
 */
export class Geometry {
    public type: string;
    public coordinates: number[];
}
/**
 * Properties definition 
 */
export class Properties {
	public Name: string;
    public MMSI: string;
}
/**
 * Geojson feature definition
 */
export class Feature {
    public Id: string;
    public type: string;
    public geometry: Geometry;
    public properties: Properties;
	public sensors: Sensors;
}
/**
 * Sensor data definition
 */
export class Sensors {
    public pastCoordinates: number[][];
    public SOG: number[];
}


/**
 * Definitions for our input data
 */
export class Ships {
    public DATA: Ship[];
}

export class Ship {
    public NAME: string;
    public MMSI: any;
    public SOG: any;
    public LAT: any;
    public LNG: any;
}

//------------------ End of GeoJSON -------

export class fetchData {
	public url: string;
    public succesfulTries: number;
    public failedTries: number;
	 
	public init(url: string) {
		console.log("Initialized fetcher");
		this.url = url;
		this.fetchAndTransform();
	}
	
	public fetchAndTransform() {
		console.time("Exectime")
		console.log("GET "+ this.url);
        
        try {
	       	request(this.url, function (err, res, body) {
                var geoJSON = new FeatureCollection();
                try {
				    //try obtaining the file we created before, if it is there
				    geoJSON = JSON.parse(fs.readFileSync('ships.json', 'utf8'));
			    } catch (error) {
		      		console.log("first time encountering this data source - creating it from scratch!");
		      	}
                var ships = new Ships();
                //console.log(res.statusCode)
                var temp = JSON.parse(body);				
                ships.DATA = temp[0].DATA;
                if (geoJSON.hasOwnProperty("timestamps")) {
                    //not dealing with a fresh file, so we can assume the sensors already exist!
                    // So what would be cool to collect? How about coordinates and speed?
                    ships.DATA.forEach((s: Ship) => {
                        geoJSON.features.forEach((f: Feature) => {
                            if (s.MMSI === f.Id) {
                                f.sensors.pastCoordinates.push([Number(s.LNG), Number(s.LAT)]);
                                f.sensors.SOG.push(s.SOG);
                            }
                        });
                    });
                    geoJSON.timestamps.push(Date.now());
                } else {
                    geoJSON.url = this.url;
                    ships.DATA.forEach((s: Ship) => {
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
                fs.writeFile('ships.json', JSON.stringify(geoJSON), function(err) {
                    if (err) throw err;
                    succesfulTries++;
                    console.log("Data has been saved to disk!");
                    console.log(colors.green(geoJSON.features.length + " features were collected. Total success: "+succesfulTries+ ", total err: "+ failedTries));
                    console.timeEnd("Exectime");
                });
            });
        } catch(err) {
            console.log(err);
            failedTries++;
            console.log(colors.red("Error: failed to connect! We've had "+ failedTries+ " failures so far."))
        }
	}
}


var fetcher = new fetchData();
var url: string;
var refreshRate: number;
var succesfulTries: number;
var failedTries: number;
succesfulTries =0;
failedTries =0;
// settings
url = "http://www.myshiptracking.com/requests/vesselsonmap.php?type=json&minlat=50.5&maxlat=53.9&minlon=3.27&maxlon=7.21&zoom=9&mmsi=null&timecode=0";
refreshRate = 60000; // milliseconds

// calling init every time seems pretty silly, would rather do this inside init
fetcher.init(url);
setInterval(function() { fetcher.init(url); }, refreshRate);
