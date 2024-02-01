
const LocationInput = ({ onSearch }) => {
  return (
    <div className={"input-group mb-3 shadow-sm"}>
      <input id={"name-location"} type={"text"} placeholder={"location name:"} className={"form-control"}/>
      <button className={"btn btn-primary"} onClick={onSearch}>Search</button>
    </div>
  );
};

export default LocationInput;
