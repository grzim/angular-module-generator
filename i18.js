var i18nModule = angular.module('i18nModule', [
    'pascalprecht.translate'
]);

i18nModule.config(['$translateProvider', function ($translateProvider) {
    'use strict';

    $translateProvider.preferredLanguage('en');


    $translateProvider.registerAvailableLanguageKeys(['en', 'pl'], {
        'en_US': 'en',
        'en_UK': 'en',
        'pl': 'pl'
    });

    $translateProvider.determinePreferredLanguage();

    // set en_Us language as the default language
    // if there will be no translations in preferred language
    // it will take the translation from en_US
    $translateProvider.fallbackLanguage('en');

    $translateProvider.useLoader('$translatePartialLoader', {
        urlTemplate: 'scripts/{part}/i18n/{lang}.json'
    });


}]);