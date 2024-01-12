import React from 'react';

const LocationInput = ({ onSearch }) => {
  return (
    <div className={"input-group mb-3 shadow-sm"}>
      <span className={"input-group-text"}>Enter Location:</span>
      <input id={"name-location"} type={"text"} placeholder={"location name:"} className={"form-control"}/>
      <button className={"btn btn-primary"} onClick={onSearch}>Search</button>
    </div>
  );
};

export default LocationInput;
