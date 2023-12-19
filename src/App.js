import React from 'react';
import FooterComponent from "./components/FooterComponent";
import HeaderComponent from "./components/HeaderComponent";
import BereshitMap from "./components/BereshitMap";

function App() {
    return (
        <div className="container mt-4">
            <HeaderComponent />

            <BereshitMap />

            <FooterComponent />
        </div>
    );
}

export default App;
