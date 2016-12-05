var App = angular.module('App', ['ngMaterial']);

App.controller('MainController', ['predictions', function(predictions) {
  
  var vm = this;
  predictions.get(function (data) {
  
    vm.alerts = [];
    $.each(data.alert_headers, function(){ 
      vm.alerts.push(this.header_text);
    });
    
    vm.stations = [];
    $.each(["Braintree", "Quincy Adams", "Quincy Center", "Wollaston", "North Quincy", "JFK/UMASS", "Andrew", "Broadway", "South Station", "Downtown Crossing", "Park Street", "Charles/MGH", "Kendall/MIT", "Central", "Harvard", "Porter", "Davis", "Alewife", "Savin Hill", "Fields Corner", "Shawmut", "Ashmont"], function(i,v){
      var station = {};
      station.name = v;
      station.predictions = [];
      vm.stations.push(station);
    });

    //console.log(vm.stations);

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

          var stopName = stop.stop_name.split(' - ')[0];
          if(stopName == "JFK/UMASS Braintree" || stopName == "JFK/UMASS Ashmont"){ stopName = "JFK/UMASS"; }

          vm.stations.filter(function( obj ) { return obj.name == stopName })[0].predictions.push(prediction);
          
        });
      });
    });
    //console.log(vm.stations);
  });
}]);

App.factory('predictions', ['$http', function ($http) {
  return {
    get: function (callback) {
      $http.get('https://realtime.mbta.com/developer/api/v2/predictionsbyroute?api_key=wX9NwuHnZU2ToO7GmGR9uw&route=Red&format=json').success(function (data) { callback(data); })
    }
  }
}]);

App.filter('toMinSec', function(){
  return function(input){
    var minutes = parseInt(input/60, 10);
    var seconds = input%60;

    return minutes+ ':' +seconds;
  }
})

App.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('dark-grey')
    .primaryPalette('grey') 
    .accentPalette('red')
    .dark();
})