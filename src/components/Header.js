import React from "react";
import MatbishIcon from './MatbishIcon';

function Header() {
    return (
        <header id={"header"} className="pb-3">
            <MatbishIcon />
            <h3>Bereshit Map</h3>
        </header>
    );
}

export default Header;
