'use strict';

angular.module('Visualizations')
  /* @ngInject */
  .directive('vesselTracking', function($filter, $timeout, TransmissionsService, setupD3) {
    var timeSeries = TransmissionsService.timeSeries;
    var index, svg, setup;

    function updateTimeSeries() {
      timeSeries = TransmissionsService.timeSeries;

      if (timeSeries.length === 0) {
        return;
      }

      for (var i = 0; i < timeSeries.length; i++) {
        timeSeries[i].transmissions = $filter('stripNans')(timeSeries[i].transmissions);
      }
    }

    updateTimeSeries();
    TransmissionsService.addListener(updateTimeSeries);

    function update() {
      var prevData = timeSeries[index - 1] || {transmissions: []};
      var data = timeSeries[index];

      if (typeof data === 'undefined') {
        $timeout(update, 800);
        return;
      }

      var circles = svg.selectAll('circle')
          .data(data.transmissions.slice(0, 800));

      svg.select('text.timestamp').text(data.timestamp.toString() + ' [' + index + '/' + timeSeries.length + ']');

      function x(d) {
        return setup.xMap(d.coords[0]);
      }

      function y(d) {
        return setup.yMap(d.coords[1]);
      }

      function color(d) {
        return d.color;
      }

      function radius(d) {
        return (d.mdist > 0.00000001) ? (2 + d.mdist*2000000000) : 2;
      }

      function opacity(d) {
        if (data.active.indexOf(d.mmsi) !== -1) {
          return 1;
        } else {
          return 0.3;
        }
      }

      function applyUpdates(d) {
        d.attr('cx', x)
            .attr('cy', y)
            .attr('r', radius)
            .style('fill', color)
            .style('opacity', opacity);
      }

      circles.exit().remove();

      applyUpdates(circles.transition());
      // applyUpdates(circles);
      applyUpdates(circles.enter().append('circle'));

      var line = d3.svg.line()
        .x(function(d) { return setup.xMap(d.coords[0]); })
        .y(function(d) { return -setup.yMap(d.coords[1]); });

      index = (index + 1) % timeSeries.length;

      $timeout(update, 800);
    }

    function link(scope, element, attributes) {
      index = 0;
      svg = d3.select(element[0]).select('svg');

      scope.$on('$destroy', function() {
        svg = undefined;
        clearTimeout(update);
      });

      function updateSetup() {
        setup = setupD3({
          width: scope.width(),
          height: scope.height(),
          bounds: scope.bounds(),
          svg: svg
        });
      }

      scope.$watch(updateSetup);

      updateSetup();

      update();
    }

    return {
      restrict: 'E',
      templateUrl: 'visualizations/vessel-tracking.html',
      link: link,
      scope: {
        width: "&ocWidth",
        height: "&ocHeight",
        bounds: "&ocBounds"
      }
    };
  });
