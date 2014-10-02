Angular extensions for building apps with [Aerobatic](http://www.aerobatic.com), the single page app hosting platform built for front-end devs.

### Performance Optimization
For the most part you author your Angular app exactly how you normally would, the main difference has to do with how Aerobatic serves all static assets with absolute URLs pointing to a seperate cookie-less domain. This improves performance as it allows the asests to be [fingerprinted](https://developers.google.com/speed/docs/insights/LeverageBrowserCaching) and served with aggressive cache headers, making the most of the browser's local cache. Additionally any cookies set on the main domain will not get unnecessarily passed along when the browser downloads static assets.

## Installation
`bower install angular-aerobatic --save`

## Setup
Include a reference to the script in your index.html page. In debug mode you can simply point to the non-compressed file. In release mode you will likely want to concat the minified version together with other vendor scripts via a Grunt or Gulp task.

```html
<script data-aero-build="debug" src="bower_components/angular-aerobatic/angular-aerobatic.js"></script>
<script data-aero-build="release" src="dist/vendor.min.js"></script>
```

In your main `app.js` file, register the `Aerobatic` as a module dependency:

```js
angular.module('angularApp', ['ngRoute', 'Aerobatic']);
```

The module includes an `aerobatic` service which can be injected into your own services, controllers, directives, etc. The service is simply a pointer to the `window.__config__` object that Aerobatic injects into the `<head/>` of your `index.html` document.

### Getting current user
If your Aerobatic app has [OAuth enabled](http://www.aerobatic.com/docs/authentication), the `aerobatic` service will provide a `user` attribute that you can use to display the username, profile image, etc.

```js
angular.module('angularApp').controller('MainCtrl', function($scope, aerobatic) {
  $scope.user = aerobatic.user;
});
```

### Building absolute URLs
The `aerobatic` service provides an `assetUrl` function that will build the correct absolute URL given a relative path. If the app is running in simulator mode, the returned URL will be `//localhost:3000`.

```js
// Make an AJAX call to a static JSON file
$scope.names = $http.get(aerobatic.assetUrl('/data/names.json'));
```

__Note that it's not necessary to use the assetUrl function for assets declared in the index.html page as they will get converted automatically.__

### Image URLs
The module includes a convenient `assetSrc` directive for image declarations inside of partial templates. Internally the directive uses the `assetUrl` function to build the correct absolute image url.

```html
<img asset-src="icon.png"></img>
```

### Configuration
For assets that are written to a special build folder by Grunt or Gulp, you can specify a `releasePrefix` property in your app's `config` block using the `aerobaticProvider`. The `assetUrl` function will inject the prefix between the host and the relative path, but only in release builds.

```js
angular.module('angularApp').config(function($routeProvider, aerobaticProvider) {
  // Register routes
  aerobaticProvider.config.releasePrefix = 'build';
});
```

### HTML5 PushState
When html5 push state is enabled in your Angular app, it can cause havoc with the simulator because the special querystring parameters `sim=1&userid=xxx` will get lost whenever the view changes. When the browser refreshes, either manually or by livereload, the simulator mode is lost. To avoid this the module internally includes logic to re-generate the querystring whenever the route changes:

```js
if ($location.$$html5 === true) {
  var originalQuery = $location.search();
  $rootScope.$on('$routeChangeStart', function() {
    for (var key in originalQuery) {
      $location.search(key, originalQuery[key]);
    }
  });
}
```
