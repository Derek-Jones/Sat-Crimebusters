'use strict';

angular.module('ScatterPlot',['Utils'])
  /* @ngInject */
  .directive('ocScatterPlot', function($filter, setupD3) {
    function link(scope, element, attributes) {
      var svg = d3.select(element[0]).select('svg');
      var setup = setupD3({
        width: scope.width(),
        height: scope.height(),
        bounds: scope.bounds(),
        svg: svg
      });
      var points = $filter('stripNans')(scope.points());

      var circles = svg.selectAll('circle')
          .data(points);

      circles.enter()
          .append('circle')
          .attr('cx', function(d) { return setup.xMap(d[0]); })
          .attr('cy', function(d) { return -setup.yMap(d[1]); })
          .attr('r', 2);
    }

    return {
      restrict: 'E',
      template: '<svg></svg>',
      link: link,
      scope: {
        points: "&ocPoints",
        width: "&ocWidth",
        height: "&ocHeight",
        bounds: "&ocBounds"
      }
    };
  });
