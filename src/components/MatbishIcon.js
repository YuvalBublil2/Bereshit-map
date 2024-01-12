import React from 'react';

function MatbishIcon() {
    return (
        <div className={"matbishIcon"}>
            <img
                key={"/icons/matbish.png"}
                src={process.env.PUBLIC_URL + `/icons/matbish.png`}
                alt={"Technological Laboratory Icon"}
                style={{ width: '70px', height: '70px', cursor: 'pointer', margin: '20%' }}
            />
        </div>
    );
}

export default MatbishIcon;
