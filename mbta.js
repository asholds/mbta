var MBTA_DATA = {}

$(document).ready(function(){
  
  navigator.geolocation.getCurrentPosition(function(position){
    queryMBTA(position.coords)
  })

  $('.switchDirection').click(function(e){
    var newDirection = $('#disabledDirection').html()
    $('#disabledDirection').html($('#activeDirection').html())
    $('#activeDirection').html(newDirection)
    displayMBTA(MBTA_DATA[newDirection])

  })
})

function queryMBTA(coords){
  var API_KEY = "161d100130e44ab2ab9a5ab5e80391b4"
  var API_URL = "https://api-v3.mbta.com/" +
      "predictions" + 
      "?filter[latitude]=" + coords.latitude + 
      "&filter[longitude]=" + coords.longitude +
      "&filter[radius]=0.03" +
      "&filter[route_type]=1" +
      "&include=stop,trip,route" + 
      "&api_key=" + API_KEY

  $.ajax({
    url: API_URL
  }).done(function(response){
    MBTA_DATA = parseMBTA(response)
    displayMBTA(MBTA_DATA["Alewife"])
  })
}

function parseMBTA(response){
//  console.log(response)

  var stops = {}
  $.each(response.included.filter(stop => stop.type == "stop"), function(i,stop){ stops[stop.id] = stop.attributes })

  var trips = {}
  $.each(response.included.filter(trip => trip.type == "trip"), function(i,trip){ trips[trip.id] = trip.attributes })

  var predictions = {}
  $.each(response.data.filter(prediction => prediction.relationships.route.data.id=="Red"), function(i,prediction){ 
    if(trips[prediction.relationships.trip.data.id].headsign != "Ashmont" && !["Savin Hill","Fields Corner","Shawmut","Ashmont"].includes(stops[prediction.relationships.stop.data.id].name)){ //ignore ashmont side stations
      predictions[prediction.id] = prediction.attributes 
      predictions[prediction.id].trip = trips[prediction.relationships.trip.data.id] 
      predictions[prediction.id].headsign = trips[prediction.relationships.trip.data.id].headsign
      predictions[prediction.id].stop = stops[prediction.relationships.stop.data.id]
      predictions[prediction.id].stopName = stops[prediction.relationships.stop.data.id].name
    }
  })

//  console.log(predictions)
  
  var stations = {Alewife:{},Braintree:{}}
  $.each(predictions, function(i,prediction){

    if(!stations[prediction.headsign][prediction.stopName]){ 
      stations[prediction.headsign][prediction.stopName] = [] 
    }

    var now = new Date();
    var arrival = new Date(prediction.arrival_time)
    var timeDiff = Math.abs(arrival.getTime() - now.getTime())
    var minutesAway = Math.ceil(timeDiff/(1000*60))

    stations[prediction.headsign][prediction.stopName].push({
      "arrival_time": minutesAway
    })
  })

//  console.log(stations)

  return stations
}

function displayMBTA(stations){
  console.log(stations)
  $('#app').html("")
  $.each(stations, function(i,station){
    $('#app').append('<h2>' + i + '</h2><ul>')
      $.each(station.slice(0,3), function(i,train){
        $('#app').append('<li>' + train.arrival_time + ' minutes</li>')
      })
    $('#app').append('</ul>')
  })
}
