/* Vienna Sightseeing Beispiel */

// Stephansdom Objekt
let stephansdom = {
    lat: 48.208493,
    lng: 16.373118,
    title: "Stephansdom"
};

// Karte initialisieren
let map = L.map("map").setView([
    stephansdom.lat, stephansdom.lng
], 15);

//thematische Layer 
let themaLayer = {
    stops: L.featureGroup(),
    lines: L.featureGroup().addTo(map),
    zones: L.featureGroup().addTo(map),
    sights: L.featureGroup(),
}

// Hintergrundlayer
let layerControl = L.control.layers({
    "BasemapAT Grau": L.tileLayer.provider("BasemapAT.grau").addTo(map),
    "BasemapAT Standard": L.tileLayer.provider("BasemapAT.basemap"),
    "BasemapAT High-DPI": L.tileLayer.provider("BasemapAT.highdpi"),
    "BasemapAT Gelände": L.tileLayer.provider("BasemapAT.terrain"),
    "BasemapAT Oberfläche": L.tileLayer.provider("BasemapAT.surface"),
    "BasemapAT Orthofoto": L.tileLayer.provider("BasemapAT.orthofoto"),
    "BasemapAT Beschriftung": L.tileLayer.provider("BasemapAT.overlay")
}, {
    "Vienna Sightseeing Haltestellen": themaLayer.stops,
    "Vienna Sightseeing Linien": themaLayer.lines,
    "Fußgängerzonen": themaLayer.zones,
    "Sehenswürdigkeiten": themaLayer.sights,
}).addTo(map);


// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

//Vienna Sightseeing Haltestellen
//asynchrone Funktion, damit schneller geladen werden kann
async function showStops(url) {
    let response = await fetch(url); //Anfrage, Antwort kommt zurück
    let jsondata = await response.json(); //json Daten aus Response entnehmen 
    L.geoJSON(jsondata, {
        onEachFeature: function (feature, layer) {
            let prop = feature.properties; //Variable damit kürzer; * steht als Platzhalter für Bildunterschrift, Link für Infos, nur 1 Tab für Links
            layer.bindPopup(`
                <line><i class="fa-solid fa-bus"></i> ${prop.LINE_NAME}</line> </br></br>
                <stop>${prop.STAT_ID} ${prop.STAT_NAME}</stop>
                `);
            //console.log(prop.NAME);
        }
    }).addTo(themaLayer.stops); //alle Busstopps anzeigen als Marker
    //console.log(response);
}
showStops("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:TOURISTIKHTSVSLOGD&srsName=EPSG:4326&outputFormat=json"); //aufrufen der Funktion 

async function showLines(url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    let lineNames = {};
    let lineColors = {  // https://clrs.cc/
            "1": "#FF4136", //Red Line
            "2": "#FFDC00", //Yellow Line
            "3": "#0074D9", //Blue Line
            "4": "#2ECC40", //Green Line
            "5": "#AAAAAA", //Grey Line
            "6": "#FF851B", //Orange Line
    }

    L.geoJSON(jsondata, {
        style: function (feature) {
            return {
                color: lineColors[feature.properties.LINE_ID],
                weight: 3,
                dashArray: [10, 4],
            };
        },
        onEachFeature: function (feature, layer) {
            let prop = feature.properties; //Variable damit kürzer; * steht als Platzhalter für Bildunterschrift, Link für Infos, nur 1 Tab für Links
            layer.bindPopup(`
            <line><i class="fa-solid fa-bus"></i> ${prop.LINE_NAME}</line> </br></br>
            <start><i class="fa-regular fa-circle-stop"></i> ${prop.FROM_NAME}</start></br>
            <i class="fa-sharp fa-solid fa-arrow-down"></i></br>
            <end><i class="fa-regular fa-circle-stop"></i> ${prop.TO_NAME}</end>
            `);
            lineNames[prop.LINE_ID] = prop.LINE_NAME;
            console.log(lineNames);
        }
    }).addTo(themaLayer.lines);
    //console.log(response);
}
showLines("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:TOURISTIKLINIEVSLOGD&srsName=EPSG:4326&outputFormat=json");

async function showSights(url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    L.geoJSON(jsondata, {
        onEachFeature: function (feature, layer) {
            let prop = feature.properties; //Variable damit kürzer; * steht als Platzhalter für Bildunterschrift, Link für Infos, nur 1 Tab für Links
            layer.bindPopup(`
            <img src = "${prop.THUMBNAIL}" alt="*" > 
            <h4><a href="${prop.WEITERE_INF}" target="Wien">${prop.NAME}</a></h4>
            <address>${prop.ADRESSE}</adress>
            `);
            //console.log(prop.NAME);
        }
    }).addTo(themaLayer.sights);
    //console.log(response);
}
showSights("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:SEHENSWUERDIGOGD&srsName=EPSG:4326&outputFormat=json");

async function showZones(url) {
    let response = await fetch(url);
    let jsondata = await response.json();
    L.geoJSON(jsondata, {
        style: function (feature) {
            return {
                color: "FUCHSIA",
                weight: 1,
                opacity: 0.4,
                fillOpacity: 0.1,
            };
        },
        onEachFeature: function (feature, layer) {
            let prop = feature.properties; //Variable damit kürzer; * steht als Platzhalter für Bildunterschrift, Link für Infos, nur 1 Tab für Links
            layer.bindPopup(`
            <ort>Fußgängerzone ${prop.ADRESSE}</ort></br></br>
            <zeitraum><i class="fa-regular fa-clock"></i> ${prop.ZEITRAUM || "dauerhaft"}</zeitraum></br></br>
            <information><i class="fa-solid fa-circle-info"></i> ${prop.AUSN_TEXT||"keine Ausnahmen"}</information>

            `);
            //console.log(prop.NAME);
        }
    }).addTo(themaLayer.zones);
    //console.log(response);
}
showZones("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:FUSSGEHERZONEOGD&srsName=EPSG:4326&outputFormat=json");

map.addControl(new L.Control.Fullscreen({
    title: {
        'false': 'View Fullscreen',
        'true': 'Exit Fullscreen'
    }
}));