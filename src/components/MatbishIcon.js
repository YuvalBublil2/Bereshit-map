import React from 'react';

function MatbishIcon() {
    return (
        <div className="matbish-icon">
            <img
                key={"/icons/matbish.png"}
                src={process.env.PUBLIC_URL + `/icons/matbish.png`}
                alt={"Technological Laboratory Icon"}
                style={{ width: '70px', height: '70px', cursor: 'pointer'}}
            />
        </div>
    );
}

export default MatbishIcon;
