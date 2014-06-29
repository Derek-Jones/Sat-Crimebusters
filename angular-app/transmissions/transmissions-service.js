'use strict';

angular.module('Transmissions')
  /* @ngInject */
  .service('TransmissionsService', function($http, Transmission, clone) {
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

    return this;
  }).filter('grabCoordinates', function() {
    return function(transmissions) {
      return transmissions.map(function(transmission) {
        return transmission.coords;
      });
    };
  });
