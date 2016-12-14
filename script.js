function init() {
  dictionaryInit();
}
document.addEventListener("DOMContentLoaded", init, false);

function dictionaryInit() {
	document.dictionary = dictionary_json;
	// console.log(document.dictionary["race"]);
	// console.log($.inArray("camel", document.dictionary["race"]));
	// console.log(stemmer("prejudice"));

	// if(containsHateSpecific("Everyone needs to stop using the word 'Oriental'.", "race")) {
	// 	console.log("test true");
	// }

	// if(containsHateGeneral("'Pride and Prejudice'.")) {
	// 	console.log("general true");
	// }
}

function containsHateSpecific(review, filter, tags, words) {
	var review_arr = review.replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g, "").toLowerCase().split(" ");
	var stem_arr = [];
	for (var i in review_arr) {
		stem_arr.push(stemmer(review_arr[i]));
	}
	var found = false;
	for (var i in document.dictionary[filter]){
		if(review_arr.indexOf(document.dictionary[filter][i]) > -1 || stem_arr.indexOf(document.dictionary[filter][i]) > -1) {
			console.log(document.dictionary[filter][i]);
			if(tags.indexOf(filter) === -1) {
				tags.push(filter);
			}
			if(words.indexOf(document.dictionary[filter][i]) === -1) {
				words.push(document.dictionary[filter][i]);
			}
			found = true;
		}
	}
	return found;
}

function containsHateGeneral(review, tags, words) {
	var review_arr = review.replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g, "").toLowerCase().split(" ");
	var stem_arr = [];
	for (var i in review_arr) {
		stem_arr.push(stemmer(review_arr[i]));
	}
	var found = false;
	for (var filter in document.dictionary) {
		for (var i in document.dictionary[filter]){
			if(review_arr.indexOf(document.dictionary[filter][i]) > -1 || stem_arr.indexOf(document.dictionary[filter][i]) > -1) {
				console.log(document.dictionary[filter][i]);
				if(tags.indexOf(filter) === -1) {
					tags.push(filter);
				}
				if(words.indexOf(document.dictionary[filter][i]) === -1) {
					words.push(document.dictionary[filter][i]);
				}
				found = true;
			}
		}
	}
	return found;
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

function performSearch(flag=true) {
	var search = $( "#search" ).val();
	deleteMarkers();
	$("#results tr").empty();
	
	if(flag){
		store.set('user',search);
		initStore(); 
	}
	
	if ($('input:checkbox[name=type]:checked').length > 0) {
		$('input:checkbox[name=type]:checked').each(function() {
			var request = {
				bounds: map.getBounds(),
				keyword: search,
				type: $(this).val()
			};
			console.log(request.type);
			service.radarSearch(request, callback);
		});
	}
	else {
		// var types = document.getElementsByName("type");
		// console.log(types);
		// var types = ['restaurant','bar','store','bank','local_government_office'];
		// for (t in types) {
		// 	console.log(types[t]["value"]);
		// 	var request = {
		// 		bounds: map.getBounds(),
		// 		keyword: search,
		// 		type: types[t]["value"]
		// 	};
		// 	service.radarSearch(request, callback);
		// }
		var request = {
			bounds: map.getBounds(),
			keyword: search
		};
		service.radarSearch(request, callback);
	}
}

function initStore() {
    if (!store.enabled) {
        alert('Local storage is not supported by your browser. Please disable "Private Mode", or upgrade to a modern browser.');
        return;
    }
	store.forEach(function(key, val) {
    	$("#searchHistory").prepend("<tr><td>"+val+"</td></tr>");
	});
}

function filterSearch() {
	deleteMarkers();
	$("#results tr").empty();

	performSearch(false);
}

var actuals;

var reviews = {};

function callback(results, status) {
	if (status !== google.maps.places.PlacesServiceStatus.OK) {
	  console.error(status);
	  return;
	}
	var hate_filters = $('input:checkbox[name=hate]:checked').map(function(_, el) {return $(el).val();}).get();
	// console.log(hate_filters);
	for (var i = 0, result; result = results[i]; i++) {
	 // 	var service = new google.maps.places.PlacesService(map);
		
        service.getDetails({
          placeId: result.place_id
        }, function(place, status) {
          	if (status === google.maps.places.PlacesServiceStatus.OK) {
                var count = 0;
              	if(place.reviews != null){  //checks to see if place has review

              		reviews[place.id] = [];
              		// document.getElementById('results').innerHTML+=
		              // 		'<div><strong>' + place.name + '</strong><br>' + 'Place ID: ' + place.place_id + '<br>' + place.formatted_address + '</div>'; //dumby text
	              	for (var j = 0, review; review = place.reviews[j]; j++){
	              		// console.log(review.text);
	              		var tags = [];
	              		var words = [];
	              		if (hate_filters.length == 0) {
	              			// console.log("in if");
	              			if (containsHateGeneral(review.text, tags, words)) {
	              				console.log(review.text);
	              				var review_details = {
	              					"text": review.text,
	              					"author": review.author_name,
	              					"place_name": place.name,
	              					"place_address": place.formatted_address,
	              					"place_phone": place.formatted_phone_number,
	              					"tags": tags,
	              					"words": words
	              				};
	              				reviews[place.id].push(review_details);
	              				count++;
	              				console.log(count);
	              			}
	              		}
	              		else {
	              			// console.log("in else");
	              			for (var i in hate_filters) {
	              				if (containsHateSpecific(review.text, hate_filters[i], tags, words)) {
	              					console.log(hate_filters[i]);
	              					console.log(review.text);
	              					var review_details = {
		              					"text": review.text,
		              					"author": review.author_name,
		              					"place_name": place.name,
		              					"place_address": place.formatted_address,
		              					"place_phone": place.formatted_phone_number,
		              					"tags": tags,
		              					"words": words
		              				}
		              				reviews[place.id].push(review_details);
	              					count++;
	              					console.log(count);
	              				}
	              			}
	              		}

	      //         		if(review.text.search("rude")>-1){ //checks for strings (here just checking for placeholder searchstr 'rude')
	      //         			// document.getElementById('results').innerHTML+=
		     //          		// '<div>' + place.reviews[j].text + '</div>'; //dumby text
							// count++;
	      //         		}
	              	}
	              	if (count > 0) {
						var res = "<strong>"+place.name+"</strong>"+"<br>"+place.formatted_address;
						var count_badge = "<span class='badge'>"+count+"</span>";

						$("#results").append("<tr onclick=\"showReview(this);\" data-internalid="+place.id+" data-toggle=\"modal\" href=\"#reviews\"><td>"+res+count_badge+"</td></tr>");
					}
	            }
				if (count == 0) {
					addMarkerGreen(place, count);
				} else {
					addMarkerRed(place, count);
				}
          	}
        });
	}
}

function showReview(event) {
	var review_arr = reviews[event.dataset.internalid];
	for (var i in review_arr) {
		$("#review-body").text(review_arr[i]["text"]);
	}
}

function addMarkerRed(place, count) {
	var marker = new google.maps.Marker({
	  map: map,
	  position: place.geometry.location,
	  icon: {
	    url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
	    anchor: new google.maps.Point(10, 10),
	    scaledSize: new google.maps.Size(17+count, 17+count)
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

function addMarkerGreen(place, count) {
	var marker = new google.maps.Marker({
		map: map,
		position: place.geometry.location,
		icon: {
			url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
			anchor: new google.maps.Point(10, 10),
			scaledSize: new google.maps.Size(17+count, 17+count)
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

function setMapOnAll(map) {
	for (var i = 0; i < markers.length; i++) {
		markers[i].setMap(map);
	}
}
function deleteMarkers() {
	setMapOnAll(null);
	markers = [];
}
