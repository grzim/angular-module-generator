var touch = require("touch");
var fs = require('fs');
var configs = require('./generationConfigs');
var patternFolder = configs.patternsFolder;

var moduleName = process.argv[2];
var path = configs.devFilesPath;
var parent =  process.argv[3] || "";
var indent = (function(){
    var idt = "";
    for(var i=0;i<configs.indent;i++){
        idt += " ";
    }
    return idt;
})();

function create() {

    if (typeof moduleName === 'undefined') {
        // if no module name defined just update html
        return indexUpdate();
    }
    //create folder for generated module and files
    var fullPath = path + "/"+ (parent ? parent + "/" : "")  + moduleName;
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }
    fs.mkdirSync(fullPath);

    //create files in a folder
    createFiles();

    //after creation add module name to the main module
    (function updateMainModule() {
        var file = configs.coreModule;
        fs.readFile(file, 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }
            var result = data.replace("internalModules: [", "internalModules: [\n"+ indent + "'" + moduleName + configs.suffixes.module + "',");
            result = result.replace(",]", "]").replace(", ]", "]").replace(",\n"+ indent + "]", "\n"+ indent +"]");
            fs.writeFile(file, result, 'utf8', function (err) {
                if (err) return console.log(err);
                indexUpdate();
            });
        });
    })();
}

//update index.html from index.tpl.html
function indexUpdate() {
    var exec = require('child_process').exec;
    //grunt include source required
    exec('grunt includeSource -v', function (error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
}

function createFiles() {
    var name = moduleName;
    var path = configs.devFilesPath + "/" + (parent ? parent + "/" : "") + process.argv[2];
    var depthLevel = parent ? parent.split('/').length : 0;

    //get the relative path to the base.less
    var depth = (function(){
        var dots = "";
        for(var i = 0;i<depthLevel;i++){
            dots += "../"
        }
        return dots;
    })();

    var modulePath = path + "/" + name;

    console.log("\nin " + path);

    var generateFiles = function () {
        var suffixes = arguments;



        var generate = function (suffix) {
            switch (suffix) {
                case configs.suffixes.controller:
                    var data = fs.readFileSync(patternFolder + '/controller').toString();
                    return data.replace(/--name--/g, name).replace(/--namespace--/g, configs.namespace);
                case configs.suffixes.directive:
                    var data = fs.readFileSync(patternFolder + '/directive').toString();
                    return data.replace(/--name--/g, name).replace('--parent--', parent ? parent+"/" : "").replace(/--namespace--/g, configs.namespace);
                case configs.suffixes.module:
                    var data = fs.readFileSync(patternFolder + '/module').toString();
                    if(!configs.addTranslations) data = data.replace("$translatePartialLoaderProvider.addPart('--name--');", '');
                    return data.replace(/--name--/g, name).replace(/--namespace--/g, configs.namespace);
            }
        };

        var generateNgDocs = function (suffix) {
            var ngDocs = ((suffix === configs.suffixes.module) || (suffix === configs.suffixes.controller) || (suffix === configs.suffixes.service)) ? configs.suffixes.service : (suffix === configs.suffixes.directive ? "directive" : "");
            var ngName = (suffix === configs.suffixes.module) ? name + "Module" : ((suffix === configs.suffixes.service) ? name + "Module" + "." + name + configs.suffixes.service : (suffix === configs.suffixes.directive ? name + configs.suffixes.directive : (suffix === configs.suffixes.controller ? name + "Module" + ".controllers:" + name + configs.suffixes.controller : "")));
            return docs = "/**" +
            "\n*" +
            "\n* @ngdoc " + ngDocs +
            "\n* @name " + ngName +
            "\n* @description " +
            "\n*" +
            "\n* @Author: " + configs.author +
            "\n*/\n"
        };
        for (var i in suffixes) {
            (function create(i) {
                var suffix = configs.suffixes[suffixes[i]];
                var ngDocs;
                var fileName = modulePath + suffix + "." + configs.fileType;
                touch(fileName);
                console.log("---------> " + name + suffix + "." + configs.fileType);
                if(configs.addDocumentation){
                    ngDocs = generateNgDocs(suffix);
                    ngDocs = ngDocs.replace("@name:", "@name: " + name + (suffix !== configs.suffixes.directive ? (suffix !== configs.suffixes.module ? suffix : "Module") : "")) + "\n" + generate(suffix);
                }

                else{
                    ngDocs = "";
                }

                fs.writeFile(fileName, ngDocs, 'utf8', function (err) {
                    if (err) return console.log(err);
                });
            })(i);
        }
    };

    var generatePreprocessorCss = function () {
        fs.mkdirSync(path + "/" + "styles");
        console.log("---------> styles");
        touch(path + "/styles/" + name + "." + configs.preprocessorCss);
        var data = fs.readFileSync(patternFolder + '/preprocessor-css').toString();
        data = data.replace(/--base--/g, "'" + depth+configs.initialPathToCssPreprocessorMainFile + "." + configs.preprocessorCss + "'");
        var indicator = "\n" + (configs.templateIndicator === 'id' ? '#' : '.');
        data += indicator + name + "Component{\n\n}";
        fs.writeFile(path + "/styles/" + name + "." + configs.preprocessorCss, data, 'utf8', function (err) {
            if (err) return console.log(err);
        });
        console.log("--------------> " + name + configs.preprocessorCss);
    };

    var generateView = function () {
        console.log("---------> " + name + ".html");
        touch(path + "/" + name + ".html");
        var text = "<div "+configs.templateIndicator+"=\"" + name + "Component\">\n</div>";
        fs.writeFile(path + "/" + name + ".html", text, 'utf8', function (err) {
            if (err) return console.log(err);
        });
    };

    var generateTests = function () {
        console.log("---------> tests");
        var testPath = configs.testsPath;
        var suffixes = arguments;
        var name = process.argv[2];

        if (!fs.existsSync(testPath)) {
            fs.mkdirSync(testPath);
        }
        fs.mkdirSync(testPath + "/" + name);
        for (var i in suffixes) {
            var suffix = configs.suffixes[suffixes[i]];
            if (suffix === configs.suffixes.module) {
                continue;
            }
            var fileName = testPath + "/" + name + "/" + name + suffix + ".test.js";
            (function createTest(i) {
                touch(fileName);
                var data = "describe('" + name + suffix + " has no tests implemented yet" + "', function(){\n\"use strict\";\n});"
                fs.writeFile(fileName, data, 'utf8', function (err) {

                    console.log("--------------> " + name + suffix + ".test.js");
                    if (err) return console.log(err);
                });
            })(i);
        }
    };

    var generatei18n = function (langs) {
        fs.mkdirSync(path + "/" + "i18n");
        console.log("---------> i18n");
        for (var i = 0; i < langs.length; i++) {
            var lang = langs[i];
            var fileName = path + "/i18n/" + lang + ".json";
            touch(fileName);
            fs.writeFile(fileName, "{\n   \"" + name + "\": {\n\n   }\n}", 'utf8', function (err) {
                if (err) return console.log(err);
            });
            console.log("--------------> " + lang + ".json");
        }
    };

    generateFiles('controller', 'directive', 'module');
    if(configs.addTranslations) generatei18n(configs.translationLanguages);
    generatePreprocessorCss();
    generateView();
    if(configs.addTests) generateTests('controller', 'directive', 'module');
}
create();