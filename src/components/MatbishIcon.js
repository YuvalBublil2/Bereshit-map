import React from 'react';

function MatbishIcon() {
    return (
        <div>
            <img
                key="/icons/matbish.png"
                src={process.env.PUBLIC_URL + `/icons/matbish.png`}
                alt="Matbish Icon"
                style={{ width: '70px', height: '70px', cursor: 'pointer', margin: '20%' }}
            />
        </div>
    );
}

export default MatbishIcon;
