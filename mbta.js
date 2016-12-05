var App = angular.module('App', []);

App.controller('MainController', ['predictions', function(predictions) {
  var vm = this;
  predictions.get(function (data) {

    //console.log(data);

    vm.alerts = [];
    $.each(data.alert_headers, function(){ 
      vm.alerts.push(this.header_text);
    });
    
    vm.stations = [];
    $.each(["Braintree", "Quincy Adams", "Quincy Center", "Wollaston", "North Quincy", "JFK/UMass", "Andrew", "Broadway", "South Station", "Downtown Crossing", "Park Street", "Charles/MGH", "Kendall/MIT", "Central", "Harvard", "Porter", "Davis", "Alewife", "Savin Hill", "Fields Corner", "Shawmut", "Ashmont"], function(i,v){
      var station = {};
      station.name = v;
      station.predictions = [];
      vm.stations.push(station);
    });

    console.log(vm.stations);

    $.each(data.direction, function(){ 
      var direction = this;
      $.each(direction.trip, function(){  //each train
        var train = this;
        $.each(train.stop, function(){ 
          var stop = this;
          var prediction = {};
          prediction.headsign = train.trip_headsign;
          prediction.direction = direction.direction_name;
          prediction.distance = this.pre_away;
          console.log(stop.stop_name.split(' - ')[0]);
          console.log(vm.stations.filter(function( obj ) { return obj.name == stop.stop_name.split(' - ')[0] }));
          vm.stations.filter(function( obj ) { return obj.name == stop.stop_name.split(' - ')[0] })[0].predictions.push(prediction);
          

        });
      });
    });

    console.log(vm.stations);

  });
}]);

App.factory('predictions', ['$http', function ($http) {
  return {
    get: function (callback) {
      $http.get('https://realtime.mbta.com/developer/api/v2/predictionsbyroute?api_key=wX9NwuHnZU2ToO7GmGR9uw&route=Red&format=json').success(function (data) { callback(data); })
    }
  }
}]);

App.filter('stationName', function() {
  return function(input) { return input.split(' - ')[0]; }
});