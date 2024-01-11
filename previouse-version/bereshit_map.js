

// Sample XML data
var map;
// Initialize an array to store the extracted polygons
let polygons = [];

// Function to load XML data from a file
function loadXMLData(filePath, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            callback(xhr.responseXML);
        }
    };
    xhr.open("GET", filePath, true);
    xhr.send();
}

function handleXMLData(xmlData) {
    if (!xmlData) {
        console.error("No XML data found.");
        return;
    }

    // Find all Folder elements
    var folders = xmlData.getElementsByTagName("Folder");

    // Iterate over each Folder element
    for (var i = 0; i < folders.length; i++) {
        var folder = folders[i];
        var folderColor = folder.getElementsByTagName("color")[0].textContent;

        var folderPolygons = folder.getElementsByTagName("Polygon");

        // Iterate over each Polygon element within the folder
        for (var j = 0; j < folderPolygons.length; j++) {
            var polygon = folderPolygons[j];
            var name = polygon.getElementsByTagName("name")[0].textContent;
            var coordinates = polygon.getElementsByTagName("coordinates")[0].textContent.trim();

            // Process coordinates
            const coordinatePairs = coordinates.split(' ').map(coord => {
                const [lon, lat] = coord.split(',');
                return [parseFloat(lat), parseFloat(lon)]; // Ensure correct order of lat, lon
            });

            // Create polygon object
            const current_polygon = {
                name: name,
                color: folderColor,
                coordinates: coordinatePairs
            };

            polygons.push(current_polygon);
        }
    }
    // After processing XML, add polygons to the map
    addPolygonsToMap();
}

// Function to add polygons to the map
function addPolygonsToMap() {
    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    polygons.forEach(polygon => {
        // Adjust these options as needed
        const polygonOptions = {
            color: polygon.color,      // Outline color
            fill: false,               // Disable filling the polygon
            weight: 2                  // Width of the polygon lines
        };

        const layer = L.polygon(polygon.coordinates, polygonOptions);
        layer.bindTooltip(polygon.name, { permanent: false });
        drawnItems.addLayer(layer);
    });
}


// Initialize the map and load XML data
document.addEventListener("DOMContentLoaded", function () {
    // Initialize the map
    map = L.map("map").setView([31.938748, 35.256152], 8);

    // Add a tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
        maxZoom: 18,
    }).addTo(map);

    // Load XML and add polygons to map
    loadXMLData("bereshit_polygons.xml", handleXMLData);
});





async function showLocation() {
	const fullLocation = document.getElementById("name_location");
	let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${fullLocation.value}`);
    let data = await response.json();
	let findPolygon = false;

	if (data[0] && map) {
		const marker = L.marker([data[0].lat, data[0].lon]).addTo(map)
			.bindPopup(fullLocation.value)
			.openPopup();

		// Set the map view to the new marker with a higher zoom level
        map.setView([data[0].lat, data[0].lon], 14); // You can adjust the zoom level

        localStorage.setItem(fullLocation.value, JSON.stringify(fullLocation.value));
        setTimeout(() => {
            map.removeLayer(marker);
        }, 10000);
    } else {
        console.error("Geocoding service could not find location: " + fullLocation.value);
    }

    for (let i = 0; i < polygons.length; i++) {
        const points = polygons[i].coordinates;
        const pName = polygons[i].name;
		const isIn = pointInPolygon(data[0].lat, data[0].lon, points);
		if (isIn === true) {
            document.getElementById("polygon-number").textContent = "The location inside Bereshit " + pName;
            findPolygon = true;
        }
    }

    if (findPolygon === false) {
        document.getElementById("polygon-number").textContent = "The location isn't in polygons area"
    }
}


function pointInPolygon(x, y, polygon) {
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
}
