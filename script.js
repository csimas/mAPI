function init() {
  dictionaryInit();
}
document.addEventListener("DOMContentLoaded", init, false);

function dictionaryInit() {
	document.dictionary = dictionary_json;
	// console.log(document.dictionary["race"]);
	// console.log($.inArray("camel", document.dictionary["race"]));
	// console.log(stemmer("prejudice"));

	if(containsHateSpecific("Everyone needs to stop using the word 'Oriental'.", "race")) {
		console.log("test true");
	}

	if(containsHateGeneral("'Pride and Prejudice'.")) {
		console.log("general true");
	}
}

function containsHateSpecific(review, filter) {
	var review_arr = review.replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g, "").toLowerCase().split(" ");
	var stem_arr = [];
	for (var i in review_arr) {
		stem_arr.push(stemmer(review_arr[i]));
	}
	// console.log(review_arr);
	// console.log(stem_arr);
	for (var i in document.dictionary[filter]){
		if(review_arr.indexOf(document.dictionary[filter][i]) > -1 || stem_arr.indexOf(document.dictionary[filter][i]) > -1) {
			return true;
		}
	}
	return false;
}

function containsHateGeneral(review) {
	var review_arr = review.replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g, "").toLowerCase().split(" ");
	var stem_arr = [];
	for (var i in review_arr) {
		stem_arr.push(stemmer(review_arr[i]));
	}
	// console.log(review_arr);
	// console.log(stem_arr);
	for (var filter in document.dictionary) {
		for (var i in document.dictionary[filter]){
			if(review_arr.indexOf(document.dictionary[filter][i]) > -1 || stem_arr.indexOf(document.dictionary[filter][i]) > -1) {
				return true;
			}
		}
	}
	return false;
}

//adapted from https://developers.google.com/maps/documentation/javascript/examples/place-radar-search
var map;
var infoWindow;
var service;
var markers = [];
var latitude=40.730
var longitude=-74.006

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		  center: {lat: latitude, lng: longitude},
		  zoom: 13,
		  styles: [{
			    stylers: [{ visibility: 'simplified' }]
		  }, {
			    elementType: 'labels',
			    stylers: [{ visibility: 'off' }]
		  }]
	});
	infoWindow = new google.maps.InfoWindow();
	service = new google.maps.places.PlacesService(map);
	//map.addListener('idle', performSearch);
}

function performSearch() {
	var search = $( "#search" ).val();

	if ($('input:radio[name=type]:checked').val() != null) {
		console.log('here');

		var request = {
			bounds: map.getBounds(),
			keyword: search,
			type: $('input:radio[name=type]:checked').val()
		};
		service.radarSearch(request, callback);
	} else {
		var types = ['restaurant','bar','store','bank','local_government_office'];
		for (t in types) {
			var request = {
				bounds: map.getBounds(),
				keyword: search,
				type: types[t]
			};
			service.radarSearch(request, callback);
		}
	}

}

function filterSearch() {
	deleteMarkers();
	var search = $( "#search" ).val();
	$("#results td").empty();
	var request = {
		bounds: map.getBounds(),
		keyword: search,
		type: $('input:radio[name=type]:checked').val()
	};

	console.log(request.type);
	service.radarSearch(request, callback);
}

function filterHate() {
	// TODO
}

var actuals;
var count;

function callback(results, status) {
	if (status !== google.maps.places.PlacesServiceStatus.OK) {
	  console.error(status);
	  return;
	}
	for (var i = 0, result; result = results[i]; i++) {
	 // 	var service = new google.maps.places.PlacesService(map);
		count = 0;
        service.getDetails({
          placeId: result.place_id
        }, function(place, status) {
          	if (status === google.maps.places.PlacesServiceStatus.OK) {
              	if(place.reviews != null){  //checks to see if place has review

              		// document.getElementById('results').innerHTML+=
		              // 		'<div><strong>' + place.name + '</strong><br>' + 'Place ID: ' + place.place_id + '<br>' + place.formatted_address + '</div>'; //dumby text
	              	for (var j = 0, review; review = place.reviews[j]; j++){

	              		if(review.text.search("rude")>-1){ //checks for strings (here just checking for placeholder searchstr 'rude')
	              			// document.getElementById('results').innerHTML+=
		              		// '<div>' + place.reviews[j].text + '</div>'; //dumby text
							count++;
	              		}
	              	}
	              	if (count > 0) {
						var res = "<strong>"+place.name+"</strong>"+"<br>"+place.formatted_address;
						var count_badge = "<span class='badge'>"+count+"</span>";
						$("#results").append("<tr><td>"+res+count_badge+"</td></tr>");

					}
	            }     	
          	}
        });


        //all green
		if (count == 0) {
			addMarkerGreen(result);
		} else {
			addMarkerRed(result);
		}

	}
}

function addMarkerRed(place) {
	var marker = new google.maps.Marker({
	  map: map,
	  position: place.geometry.location,
	  icon: {
	    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
	    anchor: new google.maps.Point(10, 10),
	    scaledSize: new google.maps.Size(10, 17)
	  }
	});
	markers.push(marker);

	google.maps.event.addListener(marker, 'click', function() {
	  service.getDetails(place, function(result, status) {
	    if (status !== google.maps.places.PlacesServiceStatus.OK) {
	      console.error(status);
	      return;
	    }
	    infoWindow.setContent(result.name);
	    infoWindow.open(map, marker);
	  });
	});
}

function addMarkerGreen(place) {
	var marker = new google.maps.Marker({
		map: map,
		position: place.geometry.location,
		icon: {
			url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
			anchor: new google.maps.Point(10, 10),
			scaledSize: new google.maps.Size(10, 17)
		}
	});
	markers.push(marker);

	google.maps.event.addListener(marker, 'click', function() {
		service.getDetails(place, function(result, status) {
			if (status !== google.maps.places.PlacesServiceStatus.OK) {
				console.error(status);
				return;
			}
			infoWindow.setContent(result.name);
			infoWindow.open(map, marker);
		});
	});
}

function deleteMarkers() {
	setMapOnAll(null);
	markers = [];
}
function setMapOnAll(map) {
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(map);
	}
}
