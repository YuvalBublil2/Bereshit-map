import React from "react";
import MatbishIcon from './MatbishIcon'; // Import your icon component

function Header() {
    return (
        <header className="pb-3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', left: 0 }}>
                <MatbishIcon />
            </div>
            <h1>Bereshit Map</h1>
        </header>
    );
}

export default Header;
