// Assign URL for API call. 
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
console.log (url)

// Assign URL for plates API call.
var url_plates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
console.log (url_plates)

// Create marker size function based on level of earthquake. 
function markerSize(magnitude) {
    return magnitude * 4;
};

// set Layergroup to myMap variable. 
var myMap = new L.LayerGroup();

// d3 API call to pull earthquake data and append data to myMap then create myMap. 
d3.json(url, function (geoJson) {
    L.geoJSON(geoJson.features, {
        pointToLayer: function (geoJsonPoint, latlng) {
            return L.circleMarker(latlng, { radius: markerSize(geoJsonPoint.properties.mag) });
        },

        style: function (geoJsonFeature) {
            return {
                fillColor: color(geoJsonFeature.properties.mag),
                fillOpacity: 0.7,
                weight: 0.1,

            }
        },

        onEachFeature: function (feature, layer) {
            layer.bindPopup(
                "<h4 style='text-align:center;'>" + new Date(feature.properties.time) +
                "</h4> <hr> <h5 style='text-align:center;'>" + feature.properties.title + "</h5>");
        }
    }).addTo(myMap);
    createMap(myMap);
});

// Create layergroup for plates call. 
var plates = new L.LayerGroup();

// d3 API call to pull plate data and append data to plates layer
d3.json(url_plates, function (geoJson) {
    L.geoJSON(geoJson.features, {
        style: function (geoJsonFeature) {
            return {
                weight: 2,
                color: 'red'
            }
        },
    }).addTo(plates);
})

// Color function to stylize circles and assign color based on magnitude. 
function color(magnitude) {
    if (magnitude > 5) {
        return 'red'
    } else if (magnitude > 4) {
        return 'orange'
    } else if (magnitude > 3) {
        return 'brown'
    } else if (magnitude > 2) {
        return 'teal'
    } else if (magnitude > 1) {
        return 'purple'
    } else {
        return 'lightgreen'
    }
};

// Create Map Layers
function createMap() {

    // Regular street map. 
    var lightMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: API_KEY
    });

    // Dark Map
    var darkMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.dark',
        accessToken: API_KEY
    });

    // Satellite view map. 
    var satellite = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.satellite',
        accessToken: API_KEY
    });

    // Create base layers and assign attributes for switch. Added high contrast for fun. 
    var baseLayers = {
        "Light": lightMap,
        "Dark": darkMap,
        "Satellite": satellite,
    };

    // Assign created layers to attribues. 
    var overlays = {
        "Earthquakes": myMap,
        "Plate Boundaries": plates,
    };

    // Establish and cetner map. 
    var mymap = L.map('mymap', {
        center: [40, -99],
        zoom: 4.3,
        layers: [lightMap, myMap, plates]
    });

    // Set control for the different layers and then add to map. 
    L.control.layers(baseLayers, overlays).addTo(mymap);

    // Establish lengend and place in bottom right via style. 
    var legend = L.control({ position: 'bottomright' });

    // Create legend content. 
    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            magnitude = [0, 1, 2, 3, 4, 5];

        // Append legend to html.
        div.innerHTML += "<h4 style='margin:4px'>M A G N I T U D E</h4>"

        // Loops through magnitude list and apply a color from the color function to each level of magnitude. 
        for (var i = 0; i < magnitude.length; i++) {
            div.innerHTML +=
                '<i style="background:' + color(magnitude[i] + 1) + '"></i> ' +
                magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+');
        }

        return div;
    };
    // Physically add legend to map. 
    legend.addTo(mymap);
}
