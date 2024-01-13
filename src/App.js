import React from 'react';
import Footer from "./components/Footer";
import Header from "./components/Header";
import Map from "./components/Map";
import MatbishIcon from "./components/MatbishIcon";

function App() {
    return (
        <div className="container mt-4">
            <Header />

            <MatbishIcon />

            <Map />

            <Footer />
        </div>
    );
}

export default App;
