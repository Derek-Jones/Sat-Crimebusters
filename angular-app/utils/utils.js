'use strict';

angular.module('Utils', [])
  .constant('setupD3', function(def) {
    var self = {};

    function get(value, defaultValue) {
      return value || defaultValue;
    }

    self.width = get(def.width, 1000);
    self.height = get(def.height, 500);

    self.margin = get(def.margin, 0);
    self.marginLeft = get(def.marginLeft, self.margin);
    self.marginRight = get(def.marginRight, self.margin);
    self.marginTop = get(def.marginTop, self.margin);
    self.marginBottom = get(def.marginBottom, self.margin);

    self.bounds = def.bounds;

    def.svg.attr('width', self.width)
        .attr('height', self.height);

    switch (def.scale) {
      default:
        self.xMap = d3.scale.linear()
            .domain(self.bounds.x)
            .range([0 + self.marginLeft, self.width - self.marginRight]);
        self.yMap = d3.scale.linear()
            .domain([self.bounds.y[0] + 0.5, self.bounds.y[1] + 0.5])
            .range([-self.height + self.marginBottom, 0 - self.marginTop]);
        break;
    }

    return self;
  })
  .constant('clone', function(obj) {
    var copy = {};
    for (var key in obj) {
      copy[key] = obj[key];
    }

    return copy;
  })
  .filter('stripNans', function() {
    return function(points) {
      return points.filter(function(d) {
        return !isNaN(d.coords[0]);
      });
    };
  });
