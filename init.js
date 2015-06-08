/**
 *
 * @Author: Grzegorz Marzencki
 *
 */

var touch = require("touch");
var fs = require('fs');
var configs = require('./generationConfigs');
var patternFolder = configs.patternsFolder;

var moduleName = process.argv[2];
var path = configs.devFilesPath;
var parent =  process.argv[3] || "";

function init() {
    var path = configs.devFilesPath;
    var mainModulePath = path + '/main' + configs.suffixes.module + ".js";
    var indexHtmlPath = path + '/index.tpl.html';

    var mainModuleData = fs.readFileSync(patternFolder + '/main-module').toString();
    var indexHtmlData = fs.readFileSync(patternFolder + '/index-html').toString();

    mainModuleData = mainModuleData.replace(/--namespace--/g, configs.namespace).replace(/--app-name--/g ,configs.appName);
    indexHtmlData = indexHtmlData.replace(/--namespace--/g, configs.namespace).replace(/--app-name--/g ,configs.appName).replace(/--module-suffix--/g, configs.suffixes.module).replace(/--directive-suffix--/g, configs.suffixes.directive).replace(/--controller-suffix--/g, configs.suffixes.controller).replace(/--service-suffix--/g, configs.suffixes.service);

    touch(mainModulePath);
    touch(indexHtmlPath);

    fs.writeFile(mainModulePath, mainModuleData, 'utf8', function (err) {
        if (err) return console.log(err);
        else console.log('--> main' + configs.suffixes.module + ".js created")
    });
    fs.writeFile(indexHtmlPath, indexHtmlData, 'utf8', function (err) {
        if (err) return console.log(err);
        else console.log('--> index.tpl.html created')
    });
}
init();