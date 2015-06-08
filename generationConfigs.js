/**
 *
 * @Author: Grzegorz Marzencki
 *
 */

module.exports = (function () {
    var configs = {
        author: 'Grzegorz Marzencki',
        appName: 'app',
        namespace: 'myNamespace',
        devFilesPath: 'scripts',
        patternsFolder: 'files',
        //path to the file that holds variables, mixins used accross other files
        initialPathToCssPreprocessorMainFile: '../../../styles/base',
        //the indicator for component's template html (either class or id)
        templateIndicator: 'id',
        //number of spaces/indent that is used across the app
        indent: 8,
        preprocessorCss: 'less',
        addTranslations: true,
        translationLanguages: ['pl','en'],
        addDocumentation: true,
        addTests: false,
        testsPath: 'src/tests',
        // js, ts, coffee, dart
        fileType: 'js',
        //suffixes of files. Suffix will NOT be added to the directive name.
        suffixes: {
            module: 'Mdl',
            controller: 'Ctrl',
            directive: 'Drtv',
            service: 'Srv'
        }
    };
    //[ath to the main app module where the dependencies are stored
    configs.coreModule = (function () {
        return configs.devFilesPath + '/main' + configs.suffixes.module + '.js';
    })();
    return configs;
})();