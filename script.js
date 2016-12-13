var dictionary_json = {
	"race": [
		"aryan",
		"apu",
		"beaner",
		"bigot",
		"brownie",
		"camel",
		"charlie",
		"chinaman",
		"ching chong",
		"chink",
		"cholo",
		"colored",
		"coon",
		"cracker",
		"darky",
		"darkie",
		"dothead",
		"dot head",
		"dot-head",
		"featherhead",
		"ghetto",
		"gook",
		"greaseball",
		"greaser",
		"gringo",
		"guido",
		"guinea",
		"gypsy",
		"halfbreed",
		"half breed",
		"honky",
		"injun",
		"jap",
		"jigaboo",
		"jigga",
		"lynch",
		"klan",
		"kkk",
		"macaca",
		"mongrel",
		"mulatto",
		"mutt",
		"nazi",
		"negr",
		"nigger",
		"nigga",
		"niggah",
		"niggress",
		"orient",
		"oriental",
		"racial",
		"racism",
		"racist",
		"redskin",
		"spic",
		"spick",
		"spig",
		"spigotty",
		"tacohead",
		"uncle tom",
		"welfare",
		"white trash"
	],

	"gender": [
		"bitch",
		"breastfeed",
		"catcall",
		"grope",
		"mansplain",
		"misogyn",
		"sexism",
		"sexist",
		"slut"
	],

	"LGBTQ": [
		"butch",
		"carpet muncher",
		"dyke",
		"gay",
		"homo",
		"lesbian",
		"lesbo",
		"dragqueen",
		"fag",
		"fairy",
		"flamer",
		"tranny"
	],
		
	"religion": [
		"goy",
		"hijab",
		"hindu",
		"islam",
		"jew",
		"jihad",
		"kike",
		"muslim",
		"osama",
		"shylock",
		"terrorist",
		"towelhead",
		"towel head",
		"raghead",
		"rag head"
	],

	"disability":[
		"blind",
		"deaf",
		"dwarf",
		"handicapped",
		"midget",
		"mongol",
		"mongoloid",
		"retard",
		"retarded",
		"tard",
		"wheelchair"
	],

	"immigration status" :[
		"anchor baby",
		"durka",
		"eurotrash",
		"fresh off the boat",
		"fob",
		"get out",
		"illegals",
		"immigra",
		"speak english",
		"no english",
		"mick",
		"our country",
		"paki",
		"polack",
		"wetback"
	],

	"violence": [
		"attack",
		"hit",
		"punch",
		"kick",
		"grab",
		"throw"
	],

	"hate speech": [
		"discrimin",
		"harass",
		"prejudice",
		"hate crime"
	]
};

function init() {
  dictionaryInit();
}
document.addEventListener("DOMContentLoaded", init, false);

function dictionaryInit() {
	document.dictionary = dictionary_json;
	console.log(document.dictionary["race"]);
	// for (var index in document.dictionary["race"]){
	// 	console.log(document.dictionary["race"][index])
	// }

	// console.log($.inArray("camel", document.dictionary["race"]));

	// console.log(stemmer("prejudice"));

	if(containsHate("Everyone needs to stop using the word 'Oriental'.", "race")) {
		console.log("test true");
	}
}

function containsHate(review, filter) {
	var review_arr = review.replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~]/g, "").toLowerCase().split(" ");
	console.log(review_arr);
	for (var i in document.dictionary[filter]){
		if(review_arr.indexOf(document.dictionary[filter][i]) > -1) {
			return true;
		}
	}
	return false;
}

//adapted from https://developers.google.com/maps/documentation/javascript/examples/place-radar-search
var map;
var infoWindow;
var service;
var latitude=40.730
var longitude=-74.006

function initMap() {
	map = new google.maps.Map(document.getElementById('right'), {
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
	map.addListener('idle', performSearch);
}

function performSearch() {
	var search = $( "#search" ).val();
	var request = {
		  bounds: map.getBounds(),
		  keyword: search
	};
	service.radarSearch(request, callback);
}

function filterSearch() { //not currently working
	var search = $( "#search" ).val();
	var request = {
		bounds: map.getBounds(),
		keyword: search,
		type: $('input:radio[name=type]:checked').val()
	};
	console.log(request.type);
	service.radarSearch(request, callback);
}
var actuals;

function callback(results, status) {
	if (status !== google.maps.places.PlacesServiceStatus.OK) {
	  console.error(status);
	  return;
	}
	for (var i = 0, result; result = results[i]; i++) {


	 // 	var service = new google.maps.places.PlacesService(map);
		var count = 0;
        service.getDetails({
          placeId: result.place_id
        }, function(place, status) {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
              	if(place.reviews != null){  //checks to see if place has review

              		// document.getElementById('results').innerHTML+=
		              // 		'<div><strong>' + place.name + '</strong><br>' + 'Place ID: ' + place.place_id + '<br>' + place.formatted_address + '</div>'; //dumby text
	              	for(var j=0,review;review=place.reviews[j];j++){

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
						addMarkerRed(result);
					}
	            }	
		              	
          }
          
        });


        //for some reason rn they're all green?
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
