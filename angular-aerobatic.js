/*!
 angular-aerobatic 0.0.1
 (c) 2014 Aerobatic, LLC. http://www.aerobatic.com
 License: MIT
*/
(function() {
  'use strict';

  // Detect CORS support which is required in order to load templates using XHR from the CDN.
  // https://hacks.mozilla.org/2009/07/cross-site-xmlhttprequest-with-cors/
  var corsEnabled = 'withCredentials' in new XMLHttpRequest();
  var releaseMode = window.__config__.simulator !== true || /release=1/.test(window.location.search);

  // Build the absolute asset URL.
  var _aerobatic = {};
  for (var key in window.__config__) {
    _aerobatic[key] = window.__config__[key];
  }

  _aerobatic.assetUrl = function(path) {
    if (path[0] !== '/') {
      path = '/' + path;
    }

    // If there is a release prefix prepend it to the path
    if (releaseMode === true && _aerobatic.releasePrefix) {
      path = '/' + _aerobatic.releasePrefix + path;
    }

    return window.__config__.cdnUrl + path;
  };

  var module = angular.module('Aerobatic', []);

  // Expose the aerobatic object as a service
  module.provider('aerobatic', function() {
    this.config = _aerobatic;

    this.$get = function () {
      return _aerobatic;
    };
  });

  module.config(function($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
      // Need the special 'self' keyword so the angular-ui templates are trusted
      'self',
      window.location.protocol + '//' + _aerobatic.cdnHost + '/**'
    ]);
  });

  module.run(function($log, $rootScope, $location) {
    // Preserve the querystring during HTML5 view navigations when in simulator
    // mode. This way when livereload forces the browser to refresh we won't lose
    // the fact we are in simulator mode designated by the "sim=1" in the querystring.
    if ($location.$$html5 === true) {
      var originalQuery = $location.search();
      $rootScope.$on('$routeChangeStart', function() {
        for (var key in originalQuery) {
          $location.search(key, originalQuery[key]);
        }
      });
    }
  });

  // Directive that builds url to a static asset by prepending the cdnUrl.
  module.directive('assetSrc', function($log, aerobatic) {
    return function(scope, element, attrs) {
      var absoluteUrl = aerobatic.assetUrl(attrs.assetSrc);
      // Detect if this is an .html or .json request
      if (corsEnabled === false && /(\.html|\.json)$/.test(attrs.assetSrc)) {
        $log.error('Browser does not support CORS. Cross domain request for static asset at ' + absoluteUrl + ' will fail');
      }

      element.attr('src', absoluteUrl);
    };
  });
})();
