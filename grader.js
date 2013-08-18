#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var rest = require('restler');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFileContent = function(content, checksfile) {
    //console.log("Working on content: %s", content);
    $ = cheerio.load(content);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var checkHtmlFile = function(htmlFile, checksfile) {
    return checkHtmlFileContent(fs.readFileSync(htmlFile), checksfile);
};

var checkFileByUrl = function(url, checksfile) {
    rest.get(url).on('complete', function(data) {
        var checkJson = checkHtmlFileContent(data, checksfile);
        var outJson = JSON.stringify(checkJson, null, 4);
        console.log(outJson);
    });
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file [html_file]', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url [file_url]', 'URL of the file to check')
        .parse(process.argv);
    var file = program.file;
    var checkJson = undefined;
    if (program.url !== undefined) {
        //console.log("Working on URL %s", program.url);
        checkJson = checkFileByUrl(program.url, program.checks);
    } else if (program.file !== undefined) {
        //console.log("Working on File %s", program.file);
        checkJson = checkHtmlFile(program.file, program.checks);
        var outJson = JSON.stringify(checkJson, null, 4);
        console.log(outJson);
    } else {
        console.log("Either --file or --url must be specified. Exiting...");
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }

} else {
    exports.checkHtmlFile = checkHtmlFile;
}


