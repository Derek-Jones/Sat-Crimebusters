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

'use strict';

angular.module('ScatterPlot',['Utils'])
  /* @ngInject */
  .directive('ocScatterPlot', ['$filter', 'setupD3', function($filter, setupD3) {
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
  }]);

'use strict';

angular.module('Transmissions', ['Utils'])
  .constant('Transmission', (function() {
    var colors = [];

    function genColor(mmsi) {
      return colors[mmsi] = (colors[mmsi] || '#' + (Math.random() * 0xFFFFFF << 0).toString(16));
    }

    function Transmission(raw) {
      this.mmsi = raw[0];
      this.date = raw[1];
      this.time = raw[2];
      this.sog = raw[3];
      this.coords = [parseFloat(raw[4]), parseFloat(raw[5])];
      this.cog = raw[6];
      this.timestamp = parseFloat(this.date + this.time);
      this.color = genColor(this.mmsi);
    }

    Transmission.prototype.longitude = function() { return this.coords[0]; };
    Transmission.prototype.latitude = function() { return this.coords[1]; };

    return Transmission;
  })());

'use strict';

angular.module('Maps', ['Transmissions'])
  /* @ngInject */
  .controller('MapsController', ['$scope', '$timeout', '$rootScope', 'TransmissionsService', function($scope, $timeout, $rootScope, TransmissionsService) {
    $scope.width = 1000;
    $scope.height = 500;
    $scope.center = new google.maps.LatLng(38.56293181498852, 16.47674560546875);

    var neutralBlue = [{"featureType":"water","elementType":"geometry","stylers":[{"color":"#193341"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#2c5a71"}]},{"featureType":"road","elementType":"geometry","stylers":[{"color":"#29768a"},{"lightness":-37}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#406d80"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#406d80"}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#3e606f"},{"weight":2},{"gamma":0.84}]},{"elementType":"labels.text.fill","stylers":[{"visibility": "off"},{"color":"#ffffff"}]},{"featureType":"administrative","elementType":"geometry","stylers":[{"weight":0.6},{"color":"#1a3541"}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#2c5a71"}]}];

    var mapOptions = {
      center: $scope.center,
      zoom: 5,
      panControl: false,
      zoomControl: false,
      overviewMapControl: false,
      streetViewControl: false,
      scaleControl: false,
      mapTypeControl: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: neutralBlue
    };

    $scope.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

    google.maps.event.addListenerOnce($scope.map, 'bounds_changed', function() {
      var gmapBounds = $scope.map.getBounds();
      var ne = gmapBounds.getNorthEast();
      var sw = gmapBounds.getSouthWest();

      $scope.$apply(function(scope) {
        scope.bounds = {
          x: [sw.lng(), ne.lng()],
          y: [sw.lat(), ne.lat()]
        };
      });
    });

    $scope.bounds = {
      x: [-5.49591064453125, 38.44940185546875],
      y: [29.475171256180307, 46.63222897271767]
    };

    $scope.ready = false;
    function ready() {
      $scope.ready = true;
      TransmissionsService.removeListener(ready);
    }

    TransmissionsService.addListener(ready);
  }]);

'use strict';

angular.module('Transmissions')
  /* @ngInject */
  .service('TransmissionsService', ['$http', 'Transmission', 'clone', function($http, Transmission, clone) {
    var start = new Date();
    var self = this;
    self.transmissions = [];
    self.timeSeries = [];
    self.compressedSeries = [];
    var listeners = [];

    self.addListener = function(listener) {
      if (listeners.indexOf(listener) === -1) {
        listeners.push(listener);
      }
    };

    self.removeListener = function(listener) {
      var index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index);
      }
    };

    function notifyListeners() {
      debugger
      var i = listeners.length - 1;
      do {
        listeners[i].call();
      } while (i--);
    }

    $http({ method: 'GET', url: '/transmissions' })
      .success(function(data, status, headers, config) {
        self.transmissions = parseRawData(data);
        var obj = processTransmissions(self.transmissions);
        self.timeSeries = obj.buckets;
        self.compressedSeries = obj.compressed;
        notifyListeners();
      }).error(function(data, status, headers, config) {
        alert(data);
      });

    function parseRawData(rawData) {
      var data = rawData.trim();

      var rows = data.split("\n");
      var headers = rows[0].split(',');

      var transmissions = [];
      for (var i = 1; i < rows.length; i++) {
        var d = rows[i].split(',');

        transmissions.push(new Transmission(d));
      }

      return transmissions;
    }

    function processTransmissions(transmissions) {
      var interval = 100*100;
      var compressedSeries = {};
      var i, j;
      var sorted = transmissions.sort(function(a, b) {
        return a.timestamp - b.timestamp;
      }).map(function(a) {
        compressedSeries[a.mmsi] = compressedSeries[a.mmsi] || {
          obj: a,
          points: []
        };
        compressedSeries[a.mmsi].points.push(a.coords);
        a.bucket = (Math.floor(a.timestamp / interval) * interval).toString();
        return a;
      });

      function sortedIntKeys(obj) {
        return Object.keys(obj).sort(function(a, b) {
          return parseFloat(b) - parseFloat(a);
        });
      }

      function parseDateTime(str) {
        return new Date(str.slice(0, 4), str.slice(4, 6), str.slice(6, 8), str.slice(8, 10), str.slice(10, 12), str.slice(12, 14));
      }

      var bucketsObject = {},
          i = sorted.length - 1;
      do {
        var key = sorted[i].bucket;
        bucketsObject[key] = bucketsObject[key] || {};
        bucketsObject[key][sorted[i].mmsi] = sorted[i];
      } while(i--);

      var bucketsArray = [],
          keys = sortedIntKeys(bucketsObject),
          a = {},
          counter = 0,
          indices = {},
          i = keys.length - 1;

      do {
        var b = clone(a);
        var active = [];
        for (var k in bucketsObject[keys[i]]) {
          var h = bucketsObject[keys[i]][k];
          indices[h.mmsi] = indices[h.mmsi] || (function() { counter = counter + 1; return counter; })();
          b[h.mmsi] = h;
          active.push(h.mmsi);
        }

        var bkeys = Object.keys(b);
        var array = [];
        for (var j = 0; j < bkeys.length; j++) {
          array.push(b[bkeys[j]]);
        }
        bucketsArray.push({
          timestamp: parseDateTime(keys[i]),
          transmissions: array.sort(function(a,b) { return indices[a.mmsi] - indices[b.mmsi]; }),
          active: active
        });
        a = b;
      } while(i--);

      var array = [];
      for (var key in compressedSeries) {
        array.push(compressedSeries[key]);
      }
      return {
        compressed: array,
        buckets: bucketsArray
      };
    }

    console.log(new Date() - start);
    return this;
  }]).filter('grabCoordinates', function() {
    return function(transmissions) {
      return transmissions.map(function(transmission) {
        return transmission.coords;
      });
    };
  });

'use strict';

angular.module('Visualizations', ['Transmissions', 'Utils']);

'use strict';

angular.module('App', ['Transmissions', 'ScatterPlot', 'Visualizations', 'Maps', 'ngRoute'])
  /* @ngInject */
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/track', { templateUrl: 'views/track.html' })
        .when('/routes', { templateUrl: 'views/routes.html' })
        .otherwise({ redirectTo: '/track' });
  }]).directive('bsNavLink', ['$location', function($location) {
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
  }]);

'use strict';

/* @ngInject */
angular.module('Visualizations')
  .directive('routeTrace', ['TransmissionsService', 'setupD3', function(TransmissionsService, setupD3) {
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
  }]);

'use strict';

angular.module('Visualizations')
  /* @ngInject */
  .directive('vesselTracking', ['$filter', '$timeout', 'TransmissionsService', 'setupD3', function($filter, $timeout, TransmissionsService, setupD3) {
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
        return -setup.yMap(d.coords[1]);
      }

      function color(d) {
        return d.color;
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
            .attr('r', 2)
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
  }]);

angular.module("App").run(["$templateCache", function($templateCache) {$templateCache.put("views/routes.html","<route-trace oc-width=\"width\" oc-height=\"height\" oc-bounds=\"bounds\"></route-trace>\n");
$templateCache.put("views/track.html","<vessel-tracking oc-width=\"width\" oc-height=\"height\" oc-bounds=\"bounds\"></vessel-tracking>\n");
$templateCache.put("visualizations/vessel-tracking.html","<svg>\n  <g transform=\"translate(10, 25)\">\n    <text class=\"timestamp\"></text>\n  </g>\n</svg>\n");}]);