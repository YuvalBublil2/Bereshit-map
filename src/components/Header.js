import React from "react";
import MatbishIcon from './MatbishIcon';

function Header() {
    return (
        <header className="pb-3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10%' }}>
            <div style={{ position: 'absolute', left: 0 }}>
                <MatbishIcon />
            </div>
            <h3>Bereshit Map</h3>
        </header>
    );
}

export default Header;
