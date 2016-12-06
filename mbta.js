//TODO - sort stations by lat/lon distance

var App = angular.module('App', ['ngMaterial']);

App.controller('MainController', ['$scope', 'predictions', function($scope, predictions) {
  
  $scope.showAlert = function(dir_str){
    $scope.view_direction = dir_str;

    if(dir_str == "Northbound"){
      $( "span:contains('Northbound')" ).parent().addClass('md-accent');
      $( "span:contains('Southbound')" ).parent().removeClass('md-accent');
    }else{
      $( "span:contains('Southbound')" ).parent().addClass('md-accent');
      $( "span:contains('Northbound')" ).parent().removeClass('md-accent');
    }
  };

  

  var vm = this;
  $scope.view_direction = "Northbound";
  

  $scope.queryMBTA = function(){ 
    predictions.get(function (data) {
    
      vm.alerts = [];
      $.each(data.alert_headers, function(){ 
        vm.alerts.push(this.header_text);
      });
      
      //navigator.geolocation.getCurrentPosition(function(location) {
      //var USER_LAT = location.coords.latitude;
      //var USER_LON = location.coords.longitude;
  

      vm.stations = [];

      var stationData = [
        {'name': 'Braintree',         'display': true, 'lat': 42.2087804241, 'lon': -71.0013341904 },
        {'name': 'Quincy Adams',      'display': true, 'lat': 42.2327515704, 'lon': -71.0071492195 },
        {'name': 'Quincy Center',     'display': true, 'lat': 42.250879, 'lon': -71.004798 },
        {'name': 'Wollaston',         'display': true, 'lat': 42.2656146622, 'lon': -71.0194015503 },
        {'name': 'North Quincy',      'display': true, 'lat': 42.2748161177, 'lon': -71.0291755199 },
        {'name': 'JFK/UMASS',         'display': true, 'lat': 42.3214378629, 'lon': -71.0523927212 },
        {'name': 'Andrew',            'display': true, 'lat': 42.32955, 'lon': -71.05696 },
        {'name': 'Broadway',          'display': true, 'lat': 42.3429, 'lon': -71.05713 },
        {'name': 'South Station',     'display': true, 'lat': 42.351709611, 'lon': -71.0549998283 },
        {'name': 'Downtown Crossing', 'display': true, 'lat': 42.355295, 'lon': -71.060788 },
        {'name': 'Park Street',       'display': true, 'lat': 42.3561971861, 'lon': -71.0622954369 },
        {'name': 'Charles/MGH',       'display': true, 'lat': 42.3612710899, 'lon': -71.0720801353 },
        {'name': 'Kendall/MIT',       'display': true, 'lat': 42.3624602268, 'lon': -71.0865855217 },
        {'name': 'Central',           'display': true, 'lat': 42.3651634477, 'lon': -71.103322506 },
        {'name': 'Harvard',           'display': true, 'lat': 42.373939, 'lon': -71.119106 },
        {'name': 'Porter',            'display': true, 'lat': 42.3883461218, 'lon': -71.1192440987 },
        {'name': 'Davis',             'display': true, 'lat': 42.3960638548, 'lon': -71.1220550537 },
        {'name': 'Alewife',           'display': true, 'lat': 42.3949070477, 'lon': -71.1409807205 },
        {'name': 'Savin Hill',        'display': false, 'lat': 0, 'lon': 0 },
        {'name': 'Fields Corner',     'display': false, 'lat': 0, 'lon': 0 },
        {'name': 'Shawmut',           'display': false, 'lat': 0, 'lon': 0 },
        {'name': 'Ashmont',           'display': false, 'lat': 0, 'lon': 0 }
      ];
      
      $.each(stationData, function(i,v){
        var station = {};
        station.name = v.name;
        station.predictions = [];
        station.display = v.display;
        var lat = v.lat;
        var lon = v.lon;
        
        station.calcDist = function(lat1, lon1, lat2, lon2) 
        {
          var R = 6371; // km
          var dLat = (lat2-lat1) * Math.PI / 180;
          var dLon = (lon2-lon1) * Math.PI / 180;
          var lat1 = (lat1) * Math.PI / 180;
          var lat2 = (lat2) * Math.PI / 180;

          var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
          var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
          var d = R * c;
          return d;
        }

        station.distance = station.calcDist($scope.USER_LAT, $scope.USER_LON, v.lat, v.lon);

        vm.stations.push(station);
      });

    
      //, "Quincy Adams", "Quincy Center", "Wollaston", "North Quincy", "JFK/UMASS", "Andrew", "Broadway", "South Station", "Downtown Crossing", "Park Street", "Charles/MGH", "Kendall/MIT", "Central", "Harvard", "Porter", "Davis", "Alewife"

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

      vm.stations.sort(function(a,b){
        return a.distance - b.distance;
      });

      $.each(vm.stations, function(station){
        this.predictions.sort(function(a, b)
          {
            return a.distance - b.distance;
          });
      });
      console.log(vm.stations);
    });
  };

  navigator.geolocation.getCurrentPosition(function(location) {
    $scope.USER_LAT = location.coords.latitude;
    $scope.USER_LON = location.coords.longitude;
    $scope.queryMBTA();
  });

}]);

App.factory('predictions', ['$http', function ($http) {
  return {
    get: function (callback) {
      $http.get('https://realtime.mbta.com/developer/api/v2/predictionsbyroute?api_key=wX9NwuHnZU2ToO7GmGR9uw&route=Red&format=json').success(function (data) { callback(data); })
    }
  }
}]);

App.filter('toTimeDisplay', function(){
  return function(seconds){
    var minutes = parseInt(seconds/60, 10);
    if(minutes<1){return "ARR"}
    else{return minutes + " min"}
  }
})

App.filter('toCaps', function(){
  return function(str){
    return str.toUpperCase();
  }
})

App.config(function($mdThemingProvider) {
  $mdThemingProvider.theme('dark-grey')
    .primaryPalette('grey') 
    .accentPalette('red')
    .dark();
})

