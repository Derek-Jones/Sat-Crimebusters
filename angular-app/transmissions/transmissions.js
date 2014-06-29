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
      while (this.time.length < 6) {
        this.time = '0' + this.time;
      }
      this.coords = [parseFloat(raw[3]), parseFloat(raw[4])];
      this.timestamp = parseFloat(this.date + this.time);
      this.color = genColor(this.mmsi);
    }

    Transmission.prototype.longitude = function() { return this.coords[0]; };
    Transmission.prototype.latitude = function() { return this.coords[1]; };

    return Transmission;
  })());
