var offlineUsers = [];
var onlineUsers = [];
var map;
var markers = [];
var arrayLIToOffline = [];
var directionsService;
var directionsDisplay;
var onlineTripId = [];

//const SERVERIP="54.255.154.6";
const SERVERIP="52.41.89.223";
const WEBSOCKETPORT="7979";


$(function () {
    setupWebSocket()
});


// This example requires the Places library. Include the libraries=places
// parameter when you first load the API. For example:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places">



function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: -6.213510,
            lng: 106.802570
        },
        zoom: 15,
        disableDefaultUI: true
    });
    var card = document.getElementById('pac-card');
    var input = document.getElementById('pac-input');
    var types = document.getElementById('type-selector');
    var strictBounds = document.getElementById('strict-bounds-selector');
    directionsService = new google.maps.DirectionsService;
    directionsDisplay = new google.maps.DirectionsRenderer({
        polylineOptions: {
            strokeColor: "red"
        }
    });


    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);

    var autocomplete = new google.maps.places.Autocomplete(input);

    // Bind the map's bounds (viewport) property to the autocomplete object,
    // so that the autocomplete requests use the current map bounds for the
    // bounds option in the request.
    autocomplete.bindTo('bounds', map);

    var infowindow = new google.maps.InfoWindow();
    var infowindowContent = document.getElementById('infowindow-content');
    infowindow.setContent(infowindowContent);
    var marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29)
    });

    autocomplete.addListener('place_changed', function () {
        infowindow.close();
        marker.setVisible(false);
        var place = autocomplete.getPlace();
        if (!place.geometry) {
            // User entered the name of a Place that was not suggested and
            // pressed the Enter key, or the Place Details request failed.
            window.alert("No details available for input: '" + place.name + "'");
            return;
        }

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17); // Why 17? Because it looks good.
        }
        marker.setPosition(place.geometry.location);
        marker.setVisible(true);

        var address = '';
        if (place.address_components) {
            address = [
                (place.address_components[0] && place.address_components[0].short_name || ''), (place.address_components[1] && place.address_components[1].short_name || ''), (place.address_components[2] && place.address_components[2].short_name || '')
                        ].join(' ');
        }

        infowindowContent.children['place-icon'].src = place.icon;
        infowindowContent.children['place-name'].textContent = place.name;
        infowindowContent.children['place-address'].textContent = address;
        infowindow.open(map, marker);
    });

    // Sets a listener on a radio button to change the filter type on Places
    // Autocomplete.
    function setupClickListener() {
        var radioButton = document.getElementById('changetype-all');
        radioButton.addEventListener('click', function () {
            autocomplete.setTypes([]);
        });
    }
}



function setupWebSocket() {
    if ("WebSocket" in window) {
        //alert("WebSocket is supported by your Browser!");
        var ip = SERVERIP;
        //var ip="127.0.0.1";
        var port = WEBSOCKETPORT; //or your port
        // Let us open a web socket
        var ws = new WebSocket("ws://" + ip + ":" + port + "/");

        $(document).ready(function () {
            $("#search").keypress(function (e) {
                console.log("------")
                console.log(onlineUsers);
                var itemsSearch = [];
                for (var i = 0; i < onlineUsers.length; i++) {
                    //                var item = {};
                    //                item.label = onlineUsers[i].driverId;
                    //                item.title = onlineUsers[i].driverId;
                    //                item.driverName = onlineUsers[i].driverName;
                    onlineUsers[i].key = i;
                    onlineUsers[i].label = onlineUsers[i].busNo;
                    //onlineUsers[i].title = onlineUsers[i].driverId;
                    //                item.url = "http://google.com",
                    //                    itemsSearch.push(item);
                }


                var key = e.which;
                $("#search").autocomplete({
                    source: onlineUsers
                }).data("ui-autocomplete")._renderItem = function (ul, onlineUser) {
                    return $("<li tripId='" + onlineUser.tripId + "' lat='" + onlineUser.lat + "' drivername='" + onlineUser.driverName + "' busNo='" + onlineUser.busNo + "' lng='" + onlineUser.lon + "' class='searchList'>").data("ui-autocomplete-item", onlineUser).append("<a>" + onlineUser.busNo + "</a>").appendTo(ul);
                };


                if (key == 13) // the enter key code
                {
                    var searchBox = $("#search").val();
                    var searchLat;
                    var searchLng;
                    if ($("li[busNo='" + searchBox + "']", "#ui-id-1").length > 0) {

                        var ob = $("li[busNo='" + searchBox + "']", "#ui-id-1")
                        searchLat = ob.attr("lat");
                        searchLng = ob.attr("lng");
                        var pos = {
                            lat: parseFloat(searchLat),
                            lng: parseFloat(searchLng)
                        };

                        map.setCenter(new google.maps.LatLng(pos));
                    }

                }
            });
        });

        ws.onopen = function () {
            console.log("connected");
            ws.send("JOIN#WEB");


            //request online drivers
            setInterval(function () {
                ws.send("WHOISONLINE");
                driversAjax();
            }, 5000);

        };

        function searchOnlineUser(searchLat, searchLng) {
            var pos = {
                lat: parseFloat(searchLat),
                lng: parseFloat(searchLng)
            };
            map.setCenter(new google.maps.LatLng(pos));
        }
        ws.onmessage = function (evt) {
            // console.log(evt.data);
            var received_msg = evt.data;
            var parts = received_msg.split("#");

            if (received_msg == "PING") {
                ws.send("PONG");
            }

            if (parts[0] == "UP") {
                console.log("--->UP");
                var trip_id = parts[1];
                var lt = parseFloat(parts[2]);
                var ln = parseFloat(parts[3]);
                var bus_num = parts[4];
                var dlt = parseFloat(parts[5]);
                var dlon = parseFloat(parts[6]);
                var time = parseFloat(parts[7]);
                var trialBus = String(bus_num);
                var region = parts[8];
                region = region.toLowerCase();
                // var image = '../../assets/dist/img/bus.png';
                var image = '../../assets/dist/img/' + region + '.png';
                console.log("UP--->", trip_id);
                var geocoder = new google.maps.Geocoder;


                var latLng = new google.maps.LatLng(lt, ln)
                var found = 0;
                markers.forEach(function (marker) {
                    console.log("TRIP--->", trip_id);
                    if (marker.id == trip_id) {


                        if (onlineTripId.indexOf(trip_id) < 0) {
                            marker.setMap(null);
                            return;

                        }
                        if (marker.getMap() == null) marker.setMap(map);
                        console.log("ssssssss", onlineUsers);
                        marker.setPosition(latLng);
                        google.maps.event.clearListeners(marker, 'click');
                        marker.addListener('click', function () {
                            // console.log(lt + " and " + ln + " bus is " + bus_num + " dest lat,lon" + dlt + "," + dlon);
                            //Calculate the duration till the destination
                            var distinationOrigin = new google.maps.LatLng(lt, ln);
                            var destinationMarker = new google.maps.LatLng(dlt, dlon);
                            //                    var destinationMarker = locations[i][1] + ',' + '' + locations[i][2];
                            var infowindow = new google.maps.InfoWindow();
                            // infowindow.setContent('Abdulghani Akhras');
                            infowindow.open(map, marker);
                            geocoder.geocode({'location': destinationMarker}, function(results, status) {
                                if (status === 'OK') {
                                    if (results[0]) {
                                        infowindow.setContent(results[0].formatted_address);
                                    } else {
                                        window.alert('No results found');
                                    }
                                } else {
                                    window.alert('Geocoder failed due to: ' + status);
                                }
                            });
                            calculateAndDisplayRoute(directionsService, directionsDisplay, distinationOrigin, destinationMarker, infowindow);
                            //Get and display trip Passengers
                            passengerAjax(trip_id);

                        });
                        found++;
                    }
                });

                if (found == 0) {
                    console.log("TRIP--->", trip_id);
                    var marker = new google.maps.Marker({
                        // position: latLng,
                        //map: map,
                        icon: {
                            labelOrigin: new google.maps.Point(22, 50),
                            url: image,
                            //                        size: new google.maps.Size(22, 40),
                            origin: new google.maps.Point(0, 0),
                            anchor: new google.maps.Point(11, 40),
                        },
                        label: {
                            color: 'black',
                            fontWeight: 'bold',
                            text: trialBus,
                        },
                        title: bus_num,
                        id: trip_id
                    });
                    markers.push(marker);
                    marker.setPosition(latLng);
                    marker.setMap(map);
                    marker.addListener('click', function () {
                        console.log(trip_id);
                        // console.log(lt + " and " + ln + " bus is " + bus_num + " dest lat,lon" + dlt + "," + dlon);
                        //Calculate the duration till the destination
                        var distinationOrigin = new google.maps.LatLng(lt, ln);
                        var destinationMarker = new google.maps.LatLng(dlt, dlon);
                        //                    var destinationMarker = locations[i][1] + ',' + '' + locations[i][2];
                        var infowindow = new google.maps.InfoWindow();
                        infowindow.setContent("Bus Number: " + bus_num);
                        infowindow.open(map, marker);
                        calculateAndDisplayRoute(directionsService, directionsDisplay, distinationOrigin, destinationMarker, infowindow);
                        //Get and display trip Passengers
                        passengerAjax(trip_id);

                    });

                }

                //map.setCenter(latLng);



                //now you received lat lon and driver id and update map and log database if needed
            } else if (parts[0] == "JOIN") {
                var type = parts[1];
                var driverId = parts[2];
                var tripId = parts[3];
                var bus = parts[4];
                var time = parts[5];
                //            console.log("New Driver " + driverId + " joined in Trip " + tripId + " busno " + bus);

            } else if (parts[0] == "EV") {
                var type = parts[1];
                var tripId = parts[2];
                var description = parts[3];
                var bus = parts[4];
                var time = parts[5];
                var image;
                var date = new Date();
                console.log("--->EV");
                console.log("TIME SENT: " + time + " DATE: " + date);
                // alert("yyyyy",tripId, type, description);
                // Create a new JavaScript Date object based on the timestamp
                // multiplied by 1000 so that the argument is in milliseconds, not seconds.
                // var date = new Date(time * 1000);
                // Hours part from the timestamp
                var hours = date.getHours();
                // Minutes part from the timestamp
                var minutes = date.getMinutes();
                // Seconds part from the timestamp
                var seconds = date.getSeconds();

                // Will display time in 10:30:23 format
                var formattedTime = hours + ':' + minutes + ':' + seconds;
                if (type == "BR") {
                    type = "Breakdown";
                    image = "../../assets/dist/img/breakdown.png";
                } else if (type == "DL") {
                    type = "Delay";
                    image = "../../assets/dist/img/delay.png";
                } else if (type == "TF") {
                    type = "Traffic";
                    image = "../../assets/dist/img/traffic.png";
                } else if (type == "OT") {
                    type = "Others";
                    image = "../../assets/dist/img/others.png";
                }

                var ob = $("<li class='notificationItem' style='display:none' bus_no='" + bus + "' issue='" + type + "'></li>");
                ob.html("<div class='overflow-hidden' style='width:46px;float:left'><img src='" + image + "' width='80' alt='image'></div><div class='textSidebar'><h5>Bus Number: " + bus + "</h5><h5>Issue: " + type + "</h5><p> " + description + "</p><p>Time: " + formattedTime + "</p></div>")

                $(".right-sidebar-list").prepend(ob);
                $($("li", ".right-sidebar-list")[0]).css("display", "flex");
                // console.log("New Event occured " + tripId + " type=" + type + " time=" + time);

            } else if (parts[0] == "CI") {
                var tripId = parts[1];
                var passengerId = parts[2];
                var bus = parts[3];
                var time = parts[4];
                console.log("passenger checked in " + tripId + " passengerID=" + passengerId + " time=" + time + " bus=" + bus);

            } else if (parts[0] == "CO") {
                var tripId = parts[1];
                var passengerId = parts[2];
                var bus = parts[3];
                var time = parts[4];
                console.log("passenger checked out " + tripId + " passengerID=" + passengerId + " time=" + time + " bus=" + bus);

            } else if (parts[0] == "STOP") {
                console.log("--->STOP");
                var tripId = parts[1];
                var time = parts[2]
                console.log("Trip " + tripId + " ended time=" + time);
                var c = 0;
                markers.forEach(function (marker) {
                    if (marker.id == tripId) {
                        marker.setMap(null);
                        markers.splice(c, 1);
                    }
                    c++;
                });

            } else if (parts[0] == "WHOISONLINE") {
                console.log("--->WHOISONLINE");
                var data = parts[1];
                // console.log(data);
                var json = JSON.parse(data);
                onlineUsers = json.users; // this is array

                console.log("online users");
                console.log(onlineUsers);
                onlineTripId = [];
                arrayLIToOffline = [];
                // console.log("arrayLIToOffline.. : " + arrayLIToOffline);
                if (onlineUsers.length > 0) {
                    for (i = 0; i < onlineUsers.length; i++) {

                        console.log("onlineUsers[i]");
                        console.log(onlineUsers[i]);
                        onlineTripId.push(onlineUsers[i].tripId);
                        if ($("li[id='" + onlineUsers[i].busNo + "']", ".offline").length > 0) {
                            var ob = $("li[id='" + onlineUsers[i].busNo + "']", ".offline")
                            ob.attr('lat', onlineUsers[i].lat);
                            ob.attr('lng', onlineUsers[i].lon);
                            ob.attr('trip_id', onlineUsers[i].tripId);
                            ob.attr('driverName', onlineUsers[i].driverName);
                            $(ob).append("<div class='dropdown-content' style='left:0;'><a href='#'>Center Map</a><a href='#' id='" + onlineUsers[i].driverId + "' class='toggleMessage' data-toggle='modal' data-target='#myModal'>Send Message</a></div>");
                            console.log(onlineUsers[i].busNo + " ::MOVE----> " + onlineUsers[i].lat)
                            ob.slideToggle();

                            $(".driver .chat-history .online").prepend(ob);
                            ob.slideToggle();
                        } else
                        if ($("li[id='" + onlineUsers[i].busNo + "']", ".online").length <= 0) {

                            //                        var parent = $("<span class='dropdown' style='float:left;'></span>");
                            var ob = $("<li style='display:none' id='" + onlineUsers[i].busNo + "' lat='" + onlineUsers[i].lat + "' lng='" + onlineUsers[i].lon + "' trip_id='" + onlineUsers[i].tripId + "' driverName='" + onlineUsers[i].driverName + "' busNo='" + onlineUsers[i].busNo + "' class='userAction dropdown'></li>");
                            ob.html("<a href='#'><i class='fa fa-user'></i></a> " + onlineUsers[i].busNo + "<div class='dropdown-content' style='left:0;'><a href='#'>Center Map</a><a href='#' id='" + onlineUsers[i].driverId + "' class='toggleMessage' data-toggle='modal' data-target='#myModal'>Send Message</a></div>")
                                //                        parent.html(ob);
                            $(".driver .chat-history .online").prepend(ob);
                            $($("li", ".driver .chat-history .online")[0]).slideToggle()




                        }
                        arrayLIToOffline.push(onlineUsers[i].busNo);
                    }
                }

                if (offlineUsers.length > 0) {
                    for (i = 0; i < offlineUsers.length; i++) {
                        // console.log("Offline users ");
                        // console.log(offlineUsers);
                        //                    console.log("offf : ", offlineUsers[i]._id);
                        if ($("li[id='" + offlineUsers[i].bus_no + "']", ".online").length <= 0 && $("li[id='" + offlineUsers[i].bus_no + "']", ".offline").length <= 0) {
                            //                        var parent = $("<span class='dropdown' style='float:left;'></span>");
                            var ob = $("<li style='display:none' id='" + offlineUsers[i].bus_no + "' bus_no='" + offlineUsers[i].bus_no + "' lat='" + offlineUsers[i].lat + "' lng='" + offlineUsers[i].lon + "' trip_id='" + offlineUsers[i].tripId + "' class='userAction dropdown'></li>");
                            ob.html("<a href='#'><i class='fa fa-user'></i></a> " + offlineUsers[i].bus_no)
                                //                        parent.html(ob);
                            $(".driver .chat-history .offline").prepend(ob);
                            $($("li", ".driver .chat-history .offline")[0]).slideToggle()
                        } else if (arrayLIToOffline.indexOf(offlineUsers[i].bus_no) < 0) {
                            // console.log("AMIIRRR");
                            //                        console.log("arrayLIToOffline : ", offlineUsers[i]._id);
                            var ob = $("li[id='" + offlineUsers[i].bus_no + "']", ".online");

                            $('.dropdown-content', $('.offline')).each(function (e, v) {
                                $(this).remove()
                            })

                            // if($('#"'+offlineUsers[i].bus_no+'"').children('.dropdown-content').length > 0){
                            //    $('#"'+offlineUsers[i].bus_no+'"').remove(".dropdown-content");
                            // }

                            if (ob.length > 0) {
                                console.log("AMIIRRR");
                                ob.slideToggle();
                                $(".driver .chat-history .offline").prepend(ob);
                                ob.slideToggle();
                            }


                        }
                    }
                }
                // console.log("offline users ");
                //console.log(offlineUsers);

            }

            //        else if (parts[0] == "SEARCH") {
            //            var data = parts[1];
            //            console.log(data);
            //            var json = JSON.parse(data);
            //            var results = json.found; // this is array
            //            var lat = (json.found[0].lat);
            //            var lng = (json.found[0].lon);
            //            var latLng = new google.maps.LatLng(lat, lng);
            //            //                        console.log("sadasdasdasdsa " + latLng);
            //            pos = {
            //                lat: parseFloat(lat),
            //                lng: parseFloat(lng)
            //            };
            //            alert("AMIIR IS SOOO GOOD");
            //            map.setCenter(new google.maps.LatLng(pos));
            //            var results = json.found;
            //            //            console.log("found results ");
            //            //            console.log(results);
            //        }

        };

        ws.onclose = function () {
            // websocket is closed.
            setTimeout(setupWebSocket, 1000);
            console.log("Connection is closed...");
        };

    } else {

        alert("WebSocket NOT supported by your Browser!");
    }
}


function passengerAjax(trip_id) {
    $(".passenger-chat .chat-history").empty();
    $.ajax({
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Content-type", "application/json");
        },
        url: '/api/v1/passenger/online-passengers/' + trip_id,
        success: function (data) {
            if (data.success = "true") {
                $(".passenger-chat .chat-history").empty();
                console.log(data.passengers);
                var passengers = data.passengers;
                if (passengers.length > 0) {
                    for (i = 0; i < passengers.length; i++) {
                        for (i = 0; i < passengers.length; i++) {
                            var ob = $("<li style='display:none'></li>");
                            ob.html('<div class="chat-message clearfix"><img src="http://www.freeiconspng.com/uploads/person-icon-blue-18.png" alt="" width="32" height="32"><div class="chat-message-content clearfix"><h4>' + passengers[i].name + '</h4></div></div><hr>')
                            $(".passenger-chat .chat-history").prepend(ob);
                            $($("li", ".passenger-chat .chat-history")[0]).slideToggle()

                        }
                    }
                }
                $('.passenger-chat').css('display', 'block');
            }
        }
    });
}



function driversAjax() {
    $.ajax({
        type: 'GET',
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Content-type", "application/json");
        },
        url: '/api/v1/users/offline-users',
        success: function (data) {
            if (data.success = "true") {
                offlineUsers = data.users;
            }
        }
    });
}

function calculateAndDisplayRoute(directionsService, directionsDisplay, distinationOrigin, destinationMarker, infowindow) {
    directionsService.route({
        origin: distinationOrigin,
        destination: destinationMarker,
        travelMode: google.maps.TravelMode.DRIVING
    }, function (response, status) {
        if (status === google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
            computeTotals(response, infowindow);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

function computeTotals(result, infowindow) {
    var totalDist = 0;
    var totalTime = 0;
    var myroute = result.routes[0];
    for (i = 0; i < myroute.legs.length; i++) {
        totalDist += myroute.legs[i].distance.value;
        totalTime += myroute.legs[i].duration.value;
    }
    totalDist = totalDist / 1000.
    infowindow.setContent(infowindow.getContent() + "<br>total distance=" + totalDist.toFixed(2) + " km (" + (totalDist / 0.621371).toFixed(2) + " miles)<br>total time=" + (totalTime / 60).toFixed(2) + " minutes");
}

$(function () {

    var messageToId;
    $("body").on("click", ".toggleMessage", function () {
        messageToId = $(this).attr('id');
        console.log(messageToId);
    });

    $(".sendMessage").click(function () {
        //        var messageContent = {};
        //        var notification = {};
        var messageField = $("#messageField").val();
        $("#messageField").val("");
        messageField = "" + messageField + "";
        $("#messageField").val("");
        //        notification.body = messageField;
        //        messageContent.to = messageToId;
        //        messageContent.notification = notification;
        //        
        var jsonObject = {
            "driverId": messageToId,
            "message": messageField
        }



        $.ajax({
            type: "POST",
            contentType: "application/json",
            dataType: "json",
            url: "/api/v1/users/send-message",
            headers: {
                "Authorization": "key=AAAAOSqYsUg:APA91bEin90FtJgx2XkVm9qiWiFr13AJ1Eu59wzRI-JF_zD-zT3PdbhvGGXetwWBiDPeybYuceiu0iktCIp6XOeckl3kRtT7uM-yR9YFh1RaKVofFnw4J5NyFDEfpOnMlsRYCG4tLTL4"
            },
            data: JSON.stringify(jsonObject),
            success: function (user_data) {
                alert("Message Sent");
                $('#myModal').modal('toggle');

            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(thrownError);
            }
        });
    });

    $("body").on("click", ".searchList", function () {
        console.log("PARENT", $(this).parent());
        var searchLat = $(this).attr("lat");
        var searchLng = $(this).attr("lng");
        searchOnlineUser(searchLat, searchLng);
    });
    $("#changetype-address").click(function () {
        if ($("#changetype-address").is(":checked")) {
            $("#pac-input").show();
            $("#search").hide();
        } else {
            $("#pac-input").hide();
            $("#search").show();
        }
    })
    $("#changetype-geocode").click(function () {
        if ($("#changetype-geocode").is(":checked")) {
            $("#search").show();
            $("#pac-input").hide();
        } else {
            $("#search").hide();
            $("#pac-input").show();
        }
    })

    $("body").on("click", ".online .userAction", function () {

        var obj = $(this);
        var lat = obj.attr("lat");
        var lng = obj.attr("lng");
        var tripId = obj.attr("trip_id");
        pos = {
            //            lat: 33.5138,
            lat: parseFloat(lat),
            lng: parseFloat(lng)
                //            lng: 36.2765
        };
        passengerAjax(tripId);
        map.setCenter(new google.maps.LatLng(pos));


    })
    driversAjax();
})