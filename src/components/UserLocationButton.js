import React from 'react';

const UserLocationButton = ({ onClick }) => {
  return (
    <button className={"btn btn-primary"} onClick={onClick}>Use your location</button>
  );
};

export default UserLocationButton;
