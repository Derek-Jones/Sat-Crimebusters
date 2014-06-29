'use strict';

angular.module('Maps', ['Transmissions'])
  /* @ngInject */
  .controller('MapsController', function($scope, $timeout, $rootScope, TransmissionsService) {
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
  });
