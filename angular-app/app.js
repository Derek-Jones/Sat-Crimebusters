'use strict';

angular.module('App', ['Transmissions', 'ScatterPlot', 'Visualizations', 'Maps', 'ngRoute'])
  /* @ngInject */
  .config(function($routeProvider) {
    $routeProvider.when('/track', { templateUrl: 'views/track.html' })
        .when('/routes', { templateUrl: 'views/routes.html' })
        .otherwise({ redirectTo: '/track' });
  }).directive('bsNavLink', function($location) {
    return {
      restrict: 'E',
      replace: true,
      scope: {},
      template: '<li><a href="#{{href}}">{{text}}</a></li>',
      link: function(scope, element, attrs, controller) {
        var path = attrs.bsHref;
        scope.href = path;
        scope.text = attrs.bsText;
        scope.location = $location;
        scope.$watch('location.path()', function(newPath) {
          if (path == newPath) {
            element.addClass('active');
          } else {
            element.removeClass('active');
          }
        });
      }
    };
  });
