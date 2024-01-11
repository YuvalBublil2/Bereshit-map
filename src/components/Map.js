import React, { useEffect, useState, useRef } from 'react';
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import L from 'leaflet';
import polygonsData from '../polygons.json';
import { isPointInPolygon } from 'geolib';

function Map() {
    const mapRef = useRef(null);
    const [locationMessage, setLocationMessage] = useState('');
    const [currentMarker, setCurrentMarker] = useState(null);

    useEffect(() => {
        // Initialize the map only if it's not already initialized
        if (!mapRef.current) {
            mapRef.current = L.map("map").setView([31.938748, 35.256152], 8);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
                maxZoom: 18,
            }).addTo(mapRef.current);
            // Listener for long press
            mapRef.current.on("contextmenu", handleMapLongPress);

            loadPolygonsData();
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

    const loadPolygonsData = () => {
        polygonsData.forEach(polygon => {
            const latLngs = polygon.coordinates.map(coord => [coord[1], coord[0]]);
            const polygonOptions = {
                color: polygon.color,
                fill: true,
                weight: 2
            };
            L.polygon(latLngs, polygonOptions).bindTooltip(polygon.name, { permanent: false }).addTo(mapRef.current);
        });
    };

    const showUserLocation = () => {
        if (!navigator.geolocation) {
            setLocationMessage("Geolocation is not supported by this browser.");
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const {latitude, longitude} = position.coords;
            await findLocation(latitude, longitude, "your location");
        }, (error) => {
            console.error("Error Code = " + error.code + " - " + error.message);
            setLocationMessage("Unable to retrieve your location");
        });
    };

    const handleMapLongPress = (e) => {
      const { latlng } = e;
      const { lat, long } = latlng;
      const locationInput = "Custom Location";

      findLocation(lat, long, locationInput);
    };

    const showLocation = async () => {
        const locationInput = document.getElementById("name-location").value;
        try {
            let data = await handleLocationSearch(locationInput);
            await findLocation(data.lat, data.lon, locationInput);
        } catch (error) {
            console.error("Error finding location: " + error.message);
            setLocationMessage("Error finding location");
        }
    };

    const findLocation = async (latitude, longitude, locationInput) => {
        try {
            const icon = new L.Icon({
                iconUrl: markerIconPng,
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            const marker = L.marker([latitude, longitude], {icon}).addTo(mapRef.current)
                .bindPopup(locationInput)
                .openPopup();
            marker.bindTooltip(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);

            if (currentMarker) {
                mapRef.current.removeLayer(currentMarker);
            }
            setCurrentMarker(marker);

            mapRef.current.setView([latitude, longitude], 14);

            localStorage.setItem(locationInput, JSON.stringify(locationInput));

            const polygonName = locationInPolygons(latitude, longitude)
            if (polygonName) {
                setLocationMessage(`Location In Bereshit ${polygonName}`);
            } else {
                setLocationMessage("Outside of Bereshits area");
            }
        } catch (error) {
            console.error("Error finding location: " + error.message);
            setLocationMessage("Error finding location");
        }
    };

    const handleLocationSearch = async (inputText) => {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputText)}`);
        const data = await response.json();
        if (data.length === 0) throw new Error('Location not found');
        return data[0];
    };

    const locationInPolygons = (latitude, longitude) => {
        const point = { latitude, longitude };

        for (const polygon of polygonsData) {
            const coordinates = polygon.coordinates.map(coord => ({
                latitude: coord[1],
                longitude: coord[0],
            }));

            if (isPointInPolygon(point, coordinates)) {
                return polygon.name;
            }
        }
        return null;
    };

    return (
        <div>
            <div className="input-group mb-3 shadow-sm">
                <span className="input-group-text">Enter Location :</span>
                <input id="name-location" type="text" placeholder="location name" className="form-control"/>
                <button className="btn btn-primary" onClick={() => showLocation()}>Search</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1%' }}>
                <span>{locationMessage}</span>
                <button className="btn btn-primary" onClick={showUserLocation}>use your location</button>
            </div>
            <div id="map" className="p-4 rounded shadow-sm" style={{ marginTop: '1%' }}></div>
        </div>
    );

}

export default Map;
