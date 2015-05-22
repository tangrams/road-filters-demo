/*jslint browser: true*/
/*global Tangram, gui */

map = (function () {

    // Get location from URL
    var locations = {
        'London': [51.508, -0.105, 15],
        'New York': [40.75, -73.99, 14],
        'Seattle': [47.609722, -122.333056, 15]
    };

    var map_start_location = locations['New York'];

    /*** URL parsing ***/

    // leaflet-style URL hash pattern:
    // #[zoom],[lat],[lng]
    var url_hash = window.location.hash.slice(1, window.location.hash.length).split('/');
    var searchtext = "";

    if (url_hash.length >= 3) {
        map_start_location = [url_hash[1],url_hash[2], url_hash[0]];
        // convert from strings
        map_start_location = map_start_location.map(Number);
    }
    if (url_hash.length == 4) {
        searchtext = url_hash[3];
    }

    // Put current state on URL
    function updateURL () {
        var map_latlng = map.getCenter();
        var url_options = [map.getZoom().toFixed(1), map_latlng.lat.toFixed(4), map_latlng.lng.toFixed(4), searchtext];
        window.location.hash = url_options.join('/');
    }

    function updateHash () {
        newhash = hash.lastHash + "/"+scene.config.layers["roads"].properties.filter_text;
        if (window.location != newhash) window.location = newhash
    }
    /*** Map ***/

    var map = L.map('map', {
        maxZoom: 20,
        minZoom: 4,
        inertia: false,
        keyboard: true
    });
    var layer = Tangram.leafletLayer({
        scene: 'scene.yaml',
        attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors | <a href="https://mapzen.com/" target="_blank">Mapzen</a>',
    });

    window.layer = layer;
    var scene = layer.scene;
    window.scene = scene;

    map.setView(map_start_location.slice(0, 2), map_start_location[2]);
    map.on('moveend', updateURL);

    // var hash = new L.Hash(map);

    // Create dat GUI
    var gui = new dat.GUI({ autoPlace: true, hideable: false, width: 300 });
    function addGUI () {

        gui.domElement.parentNode.style.zIndex = 5; // make sure GUI is on top of map
        window.gui = gui;

        gui.input = searchtext;
        var input = gui.add(gui, 'input').name("search");
        function updateFilter(value) {
            searchtext = value;
            if (value == "") value = "willdefinitelynotmatch";
            scene.config.layers["roads"].properties.filter_text = value;
            scene.rebuildGeometry();
            scene.requestRedraw();
            updateURL();            
        }
        updateFilter(searchtext);
        input.onChange(function(value) {
            updateFilter(value);
        });
        //select input text when you click on it
        input.domElement.id = "filterbox";
        input.domElement.onclick = function() { this.getElementsByTagName('input')[0].select(); };

    }
    // Add map
    window.addEventListener('load', function () {
        // Scene initialized
        layer.on('init', function() {
            addGUI();
            var filterbox = document.getElementById('filterbox').getElementsByTagName('input')[0];
            if (filterbox.value.length == 0) filterbox.focus();
            else filterbox.select();
        });
        layer.addTo(map);
    });

    return map;

}());
