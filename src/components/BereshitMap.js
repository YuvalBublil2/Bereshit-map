import React, { useEffect, useState, useRef } from 'react';
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import L from 'leaflet';

import SearchBar from "./BereshitMap_components/SearchBar";
import PolygonLoader from "./BereshitMap_components/PolygonLoader";
import MassageDisplay from "./BereshitMap_components/MessageDisplay";
import MapContainer from "./BereshitMap_components/MapContainer";
import LocationMarker from "./BereshitMap_components/LocationMarker";

function BereshitMap() {
    const mapRef = useRef(null);
    const [polygons, setPolygons] = useState([]);
    const [locationMessage, setLocationMessage] = useState('');

    useEffect(() => {
        // Initialize the map only if it's not already initialized
        if (!mapRef.current) {
            const map = L.map("map").setView([31.938748, 35.256152], 8);
            mapRef.current = map;

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
                maxZoom: 18,
            }).addTo(map);

            loadXMLData("./bereshit_polygons.xml", handleXMLData);
        }

        // Cleanup function to properly dispose of the map instance
        return () => {
            if (mapRef.current) {
                mapRef.current.off();
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    const loadXMLData = (filePath, callback) => {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                callback(xhr.responseXML);
            }
        };
        xhr.open("GET", filePath, true);
        xhr.send();
    };

    const handleXMLData = (xmlData) => {
        if (!xmlData) {
            console.error("No XML data found.");
            return;
        }

        let newPolygons = [];
        const folderData = xmlData.getElementsByTagName("Folder");

        for (let i = 0; i < folderData.length; i++) {
            const folder = folderData[i];
            const folderColor = folder.getElementsByTagName("color")[0].textContent;
            const folderPolygons = folder.getElementsByTagName("Polygon");

            for (let j = 0; j < folderPolygons.length; j++) {
                const polygon = folderPolygons[j];
                const name = polygon.getElementsByTagName("name")[0].textContent;
                const coordinates = polygon.getElementsByTagName("coordinates")[0].textContent.trim();

                const coordinatePairs = coordinates.split(' ').map(coord => {
                    const [lon, lat] = coord.split(',');
                    return [parseFloat(lat), parseFloat(lon)];
                });

                newPolygons.push({
                    name: name,
                    color: folderColor,
                    coordinates: coordinatePairs
                });
            }
        }

        setPolygons(newPolygons);
        addPolygonsToMap(newPolygons);
    };

    const addPolygonsToMap = (polygonsData) => {
        if (mapRef.current) {
            const drawnItems = new L.FeatureGroup();
            polygonsData.forEach(polygon => {
                const polygonOptions = {
                    color: polygon.color,
                    fill: false,
                    weight: 2
                };
                const layer = L.polygon(polygon.coordinates, polygonOptions);
                layer.bindTooltip(polygon.name, {permanent: false});
                drawnItems.addLayer(layer);
            });
            mapRef.current.addLayer(drawnItems); // Add all polygons at once
        }
    };

    const showLocation = async () => {
        const fullLocation = document.getElementById("name-location");
        let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${fullLocation.value}`);
        let data = await response.json();
        let findPolygon = false;

        if (data[0] && mapRef.current) {
            // Inside your showLocation function
            const icon = new L.Icon({
                iconUrl: markerIconPng,
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            const marker = L.marker([data[0].lat, data[0].lon], { icon }).addTo(mapRef.current)
                .bindPopup(fullLocation.value)
                .openPopup();

            // Set the map view to the new marker with a higher zoom level
            mapRef.current.setView([data[0].lat, data[0].lon], 14); // You can adjust the zoom level

            localStorage.setItem(fullLocation.value, JSON.stringify(fullLocation.value));
            setTimeout(() => {
                mapRef.current.removeLayer(marker);
            }, 10000);
        } else {
            console.error("Geocoding service could not find location: " + fullLocation.value);
        }

        for (let i = 0; i < polygons.length; i++) {
            const points = polygons[i].coordinates;
            const pName = polygons[i].name;
            const isIn = pointInPolygon(data[0].lat, data[0].lon, points);
            if (isIn === true) {
                setLocationMessage(`The location inside Bereshit: ${pName}`);
                findPolygon = true;
            }
        }

        if (findPolygon === false) {
            setLocationMessage("The location isn't in polygons area");
        }
    };

    const pointInPolygon = (x, y, polygon) => {
        let inside = false;
        let j = polygon.length - 1;

        for (let i = 0; i < polygon.length; i++) {
            const xi = polygon[i][0], yi = polygon[i][1];
            const xj = polygon[j][0], yj = polygon[j][1];

            const intersect = ((yi > y) !== (yj > y)) &&
                (x < ((xj - xi) * (y - yi) / (yj - yi)) + xi);
            if (intersect) {
                inside = !inside;
            }

            j = i;
        }

        return inside;
    };

    return (
        <div>
            <div className="input-group mb-3 shadow-sm">
                <span className="input-group-text">Enter Location :</span>
                <input id="name-location" type="text" placeholder="location name" className="form-control"/>
                <button className="btn btn-primary" onClick={() => showLocation()}>Search</button>
            </div>
            <span>{locationMessage}</span>
            <div id="map" className="p-4 rounded shadow-sm"></div>
        </div>
    );
}

export default BereshitMap;
