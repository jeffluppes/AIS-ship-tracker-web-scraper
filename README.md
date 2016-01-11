## What is this?
This is a web scraping script written in TypeScript that collects JSON-data from the specified URL and converts it to GeoJSON. 
It's a purpose-built solution with prior knowledge of how the data source looked like- I expect you to need some tailoring before you may find it useful. Sorry! :(

The tool looks for a specified url, parses it to JSON, does a little bit of voodoo, and stores it on your local filesystem. If you have previously run the script it will append to the existing file. Historical data is stored in a sensor object which may be used together with an array of timestamps to reconstruct what the value was at that time in the past.

## Files
- server.ts: script
- js/server.js: compiled version of the script executable as JavaScript
- transformToLine.js: A small script to transform the point data into LineStrings, so that the travel path of each vessel becomes visible.
- ships.json: example of the resulting data
- ships_result.json: example of the resulting data after using transformToLine.js