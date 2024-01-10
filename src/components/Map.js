import React, { useEffect, useState, useRef } from 'react';
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import L from 'leaflet';
import polygonsData from '../polygons.json';
import { isPointInPolygon } from 'geolib';

function Map() {
    const mapRef = useRef(null);
    const [locationMessage, setLocationMessage] = useState('');

    useEffect(() => {
        // Initialize the map only if it's not already initialized
        if (!mapRef.current) {
            mapRef.current = L.map("map").setView([31.938748, 35.256152], 8);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
                maxZoom: 18,
            }).addTo(mapRef.current);

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

    const showLocation = async () => {
        const locationInput = document.getElementById("name-location");
        try {
            let data = await handleLocationSearch(locationInput.value);

            if (data && mapRef.current) {
                const icon = new L.Icon({
                    iconUrl: markerIconPng,
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });

                const marker = L.marker([data.lat, data.lon], { icon }).addTo(mapRef.current)
                    .bindPopup(locationInput.value)
                    .openPopup();

                mapRef.current.setView([data.lat, data.lon], 14);

                localStorage.setItem(locationInput.value, JSON.stringify(locationInput.value));
                setTimeout(() => {
                    mapRef.current.removeLayer(marker);
                }, 10000);

                const polygonName = locationInPolygons(data.lat, data.lon)
                if (polygonName) {
                    setLocationMessage(`The location inside Bereshit ${polygonName}`);
                } else {
                    setLocationMessage("Outside of Bereshits area");
                }
            } else {
                console.error("Location not found");
                setLocationMessage("Location not found");
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
            <span>{locationMessage}</span>
            <div id="map" className="p-4 rounded shadow-sm"></div>
        </div>
    );
}

export default Map;