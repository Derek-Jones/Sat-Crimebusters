'use strict';

/* @ngInject */
angular.module('Visualizations')
  .directive('routeTrace', function(TransmissionsService, setupD3) {
    var compressedSeries = TransmissionsService.compressedSeries;

    TransmissionsService.addListener(function() {
      compressedSeries = TransmissionsService.compressedSeries;
    });

    function link(scope, element, attributes) {
      var svg = d3.select(element[0]).select('svg');
      var setup = setupD3({
        bounds: scope.bounds(),
        svg: svg
      });

      var line = d3.svg.line()
          .x(function(d) { return setup.xMap(d[0]); })
          .y(function(d) { return -setup.yMap(d[1]); });

      svg.selectAll('.vessel-route')
          .data(compressedSeries)
        .enter().append('g')
          .attr('class', 'vessel-route')
        .append('path')
          .attr('d', function(d) { return line(d.points); })
          .style('stroke', function(d) { return d.obj.color; })
          .style('fill', 'none')
          .style('opacity', 0.5);
    }

    return {
      restrict: 'E',
      template: '<svg></svg>',
      link: link,
      scope: {
        bounds: "&ocBounds"
      }
    };
  });
