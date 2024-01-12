import React, { useEffect, useState, useRef } from 'react';
import LocationInput from './LocationInput';
import LocationMessage from './LocationMessage';
import UserLocationButton from './UserLocationButton';
import polygonsData from '../polygons.json';
import L from 'leaflet';
import markerIconPng from "leaflet/dist/images/marker-icon.png"
import { isPointInPolygon } from 'geolib';


function Map() {
    const mapRef = useRef(null);
    const [locationMessage, setLocationMessage] = useState('');

    useEffect(() => {
        if (!mapRef.current) {
            const mapElement = L.map('map').setView([31.938748, 35.256152], 8);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
                maxZoom: 18,
            }).addTo(mapElement);

            mapRef.current = mapElement;

            loadPolygonsData();
        }

        return () => {
            if (mapRef.current && mapRef.current.off) {
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

    const handleLocationSearch = async (inputText) => {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(inputText)}`);
        const data = await response.json();
        if (data.length === 0) throw new Error('Location not found');
        return data[0];
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
            mapRef.current.setView([latitude, longitude], 14);

            const marker = L.marker([latitude, longitude], {icon}).addTo(mapRef.current)
                .bindPopup(locationInput)
                .openPopup();
            marker.bindTooltip(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);

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

    return (
        <div style={{ position: 'relative' }}>
            <div id={"map"} className={"p-4 rounded shadow-sm"}></div>

            <div style={{ position: 'absolute', top: '50%', left: '40%', zIndex: 2 }}>
                <LocationInput onSearch={showLocation} />
            </div>

            <div style={{ position: 'absolute', bottom: '10px', left: '10px', zIndex: 2 }}>
                <UserLocationButton onClick={showUserLocation} />
            </div>

            <div style={{ position: 'absolute', bottom: '0px', left: '50%', zIndex: 2 }}>
                <LocationMessage message={locationMessage} />
            </div>
        </div>
    );
}
export default Map;
