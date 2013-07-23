#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

+cheerio
  - https://github.com/MatthewMueller/cheerio
  - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
  - http://maxodgen.com/scraping-with-node.html

+commander.js
  - https://github.com/visionmedia/commander.js
  - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

+JSON
  - http://en.wikipedia.org/wiki/JSON
  - https://developer.mozilla.org/en-US/docs/JSON
  - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var rest = require('restler');
var program = require('commander');
var cheerio = require('cheerio');
var util = require('util');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile){
	var instr = infile.toString();
	// check if path exists
	if(!fs.existsSync(instr)){
		console.log("%s does not exist. Exiting.", instr);
		// quit failure process
		process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
	}
	return instr;
}

// cheerio load the DOM - like jQuery for backend
var cheerioHtmlFile = function(htmlfile){
	return cheerio.load(fs.readFileSync(htmlfile));
	// readFileSync returns content of the file passed in buffer format(default)
};

var loadChecks = function(checksfile){
	// parse the string as JSON format
	return JSON.parse(fs.readFileSync(checksfile));
};

var performCheck = function(checksfile, $) {
	var checks = loadChecks(checksfile).sort();
	var out = {};
	for(var ii in checks){
		var present = $(checks[ii]).length > 0;
		out[checks[ii]] = present;
	}
	return out;
};

var checkHtmlFile = function(htmlfile, checksfile){
	$ = cheerioHtmlFile(htmlfile);
	return performCheck(checksfile, $);
};

var checkUrl = function(html, checksfile){
	$ = cheerio.load(html);
	return performCheck(checksfile, $);
}

// clone function
var clone = function(fn) {
	// Workaround for commander.js issue
	// http://stackoverflow.com/a/6772648
	return fn.bind({});
};

var output = function(checkJson) {
	var outJson = JSON.stringify(checkJson, null, 4);
	fs.writeFile('output.txt', outJson, function(err){
		if(err){
			console.log(err);
		} else {
			console.log('The file was saved!');
		}
	});
};

// check if the script is run directly or called via another script.
// If no, export the file to a module for other script to use
// If yes take input from command line and perform class check for html file
if(require.main == module) {
	program
		.option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
		.option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
		.option('-u, --url <url_file>', 'Path to url.html')
		.parse(process.argv);

	if (program.url) {
		var url = ('%s', program.url);
		rest.get(url).on('complete', function(result){
			var checkJson = checkUrl(result, program.checks);
			output(checkJsonuit );
		})
	} else {
		var checkJson = checkHtmlFile(program.file, program.checks);
		output(checkJson);
	}
} else {
	exports.checkHtmlFile = checkHtmlFile;
}