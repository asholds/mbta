var MBTA = {
	position: {latitude: 0, longitude: 0},
	api_key: "wX9NwuHnZU2ToO7GmGR9uw", //temp key
	closestStop: function(){
		var QCN = {latitude:42.251809, longitude:-71.005409}
		var SST = {latitude:42.352271, longitude:-71.055242}

  		if(this.distanceBetween(this.position, QCN) < this.distanceBetween(this.position, SST)){ return "place-qnctr"; }
  		else{ return "place-sstat"; }
	},
	getStopData : function(){
		var that = this;
		
		var stop = this.closestStop();
		var requestUrl = "http://realtime.mbta.com/developer/api/v2/predictionsbystop?api_key=" + this.api_key + "&stop=" + stop + "&format=json";
		$.getJSON( requestUrl, function( data ) {
			var stationName = data.stop_name;
			var mode = $.grep(data.mode, function(e){ return e.mode_name == "Subway"; });
			var subway = mode[0].route[0]

			var northbound = $.grep(subway.direction, function(e){ return e.direction_name == "Northbound"; });
			var southbound = $.grep(subway.direction, function(e){ return e.direction_name == "Southbound"; });
				
			if(stationName == "Quincy Center"){ 
				$('#direction').html("Quincy Center Northbound");
				that.displayStopData(northbound[0].trip); 
			}else{ 
				$('#direction').html("South Station Southbound");
				that.displayStopData(southbound[0].trip); 
			}
		});		
	},
	displayStopData: function(trips){
		//console.log(trips);
		var that = this;
		$.each(trips, function(i,trip){
			console.log(trip);
			$('#trips').append("<li id='" + trip.trip_id + "' class='trip'></li>");
			that.startTimer(trip.pre_away, $('#' + trip.trip_id));
		});		
	},
	distanceBetween: function(myPos, stopPos){
		var p = 0.017453292519943295;    // Math.PI / 180
		var c = Math.cos;
		var a = 0.5 - c((stopPos.latitude - myPos.latitude) * p)/2 + 
		    c(myPos.latitude * p) * c(stopPos.latitude * p) * 
		    (1 - c((stopPos.longitude - myPos.longitude) * p))/2;

		return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
	},
	startTimer: function (duration, display) {
	    var timer = duration, minutes, seconds;
	    setInterval(function () {
	        minutes = parseInt(timer / 60, 10)
	        seconds = parseInt(timer % 60, 10);

	        minutes = minutes < 10 ? "0" + minutes : minutes;
	        seconds = seconds < 10 ? "0" + seconds : seconds;

	        display.text(minutes + ":" + seconds);

	        if (--timer < 0) {
	            timer = 0;
	        }
	    }, 1000);
	}
};
