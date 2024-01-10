import React from 'react';
import Footer from "./components/Footer";
import Header from "./components/Header";
import Map from "./components/Map";

function App() {
    return (
        <div className="container mt-4">
            <Header />

            <Map />

            <Footer />
        </div>
    );
}

export default App;
