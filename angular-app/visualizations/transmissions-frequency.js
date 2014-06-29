'use strict';

angular.module('Visualizations')
    /* @ngInject */
    .directive('transmissionsFrequency', function(TransmissionsService, setupD3) {
      var transmissions = TransmissionsService.transmissions;
      var setup, svg;

      TransmissionsService.addListener(function() {
        transmissions = TransmissionsService.transmissions;
      });

      function link(scope, element, attrs) {
        svg = d3.select(element[0]).select('svg');

        setup = setupD3({
          width: scope.width(),
          height: scope.height(),
          bounds: scope.bounds(),
          svg: svg
        });
      }

      return {
        restrict: 'E',
        templateUrl: 'visualizations/transmissions-frequency.html',
        link: link,
        scope: {
          width: "&ocWidth",
          height: "&ocHeight",
          bounds: "&ocBounds"
        }
      };
    });
