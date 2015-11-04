var MBTA = {
	position: {latitude: 0, longitude: 0},
	api_key: "YOBRtODK8UqArT04htFxbw", //temp key
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
			console.log(data);
			var stationName = data.stop_name;
			var mode = $.grep(data.mode, function(e){ return e.mode_name == "Subway"; });
			var subway = mode[0].route[0]

			var northbound = $.grep(subway.direction, function(e){ return e.direction_name == "Northbound"; });
			var southbound = $.grep(subway.direction, function(e){ return e.direction_name == "Southbound"; });
			
			if(stationName == "Quincy Center"){ 
				$('#direction').html("Quincy Center");
				that.displayStopData(northbound[0].trip); 
			}else{ 
				$('#direction').html("South Station");
				that.displayStopData(southbound[0].trip); 
			}
		});		
	},
	displayStopData: function(trips){
		var that = this;
		$.each(trips, function(i,trip){
			var minutes = parseInt(trip.pre_away / 60, 10)
	        var seconds = parseInt(trip.pre_away % 60, 10);
			
			var arrival = new Date();
			//arrival.setSeconds(arrival.getSeconds() + trip.pre_away);
			var arrivalTime = new Date(arrival.valueOf()+trip.pre_away*1000);
			
			$('#trips').append("<p><span class='left' id='" + trip.trip_id + "'>" + minutes + " minutes</span><span class='right'>" + arrivalTime.toLocaleTimeString() + "</span></p>");
			if(trip.trip_headsign == "Ashmont"){ $('#' + trip.trip_id).addClass('ashmont'); }
		});		
	},
	distanceBetween: function(myPos, stopPos){
		var p = 0.017453292519943295;    // Math.PI / 180
		var c = Math.cos;
		var a = 0.5 - c((stopPos.latitude - myPos.latitude) * p)/2 + 
		    c(myPos.latitude * p) * c(stopPos.latitude * p) * 
		    (1 - c((stopPos.longitude - myPos.longitude) * p))/2;

		return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
	}
};
